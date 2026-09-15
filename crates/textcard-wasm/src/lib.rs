mod config;
mod world;

use std::sync::Mutex;
use wasm_bindgen::prelude::*;
use typst::foundations::Bytes;
use typst::text::Font;
use typst_layout::PagedDocument;
use typst_render::RenderOptions;
use typst_svg::SvgOptions;

use config::CardConfig;
use world::CardWorld;

// Global mutex for the World instance to keep fonts/templates cached across calls.
static WORLD: std::sync::OnceLock<Mutex<CardWorld>> = std::sync::OnceLock::new();

fn get_world() -> std::sync::MutexGuard<'static, CardWorld> {
    WORLD.get_or_init(|| Mutex::new(CardWorld::new())).lock().unwrap()
}

#[wasm_bindgen]
pub fn init() {
    console_error_panic_hook::set_once();
    let mut world = get_world();
    load_templates(&mut world);
}

#[wasm_bindgen]
pub fn load_font(name: &str, data: &[u8]) -> Result<(), JsValue> {
    let bytes = Bytes::new(data.to_vec());
    let font = Font::new(bytes, 0)
        .ok_or_else(|| JsValue::from_str(&format!("Failed to parse font: {}", name)))?;

    let mut world = get_world();
    world.add_font(font);

    Ok(())
}

fn find_optimal_width(
    world: &mut CardWorld,
    template: &str,
    target_height: f64,
    content: &str,
    title: &str,
    author: &str,
    source: &str,
    font_family: &str,
    font_size: f64,
    line_height: f64,
    bg_color_expr: &str,
    first_line_indent: &str,
    justify: &str,
) -> f64 {
    let mut low: f64 = 320.0;
    let mut high: f64 = 3840.0;
    let mut best_width: f64 = high;

    for _ in 0..10 {
        let mid = ((low + high) / 2.0).round();
        let source_code = format!(
            r#"
#import "/templates/{template}.typ": *
#show: card.with(
  width: {mid}pt,
  height: {target_height}pt,
  title: "{title}",
  author: "{author}",
  source: "{source}",
  font-family: "{font_family}",
  font-size: {font_size}pt,
  line-height: {line_height}em,
  bg-color: {bg_color_expr},
  first-line-indent: {first_line_indent},
  justify: {justify},
)

{content}
            "#,
            template = template,
            mid = mid,
            target_height = target_height,
            title = title,
            author = author,
            source = source,
            font_family = font_family,
            font_size = font_size,
            line_height = line_height,
            bg_color_expr = bg_color_expr,
            first_line_indent = first_line_indent,
            justify = justify,
            content = content,
        );

        let main_id = world::make_file_id("/main.typ");
        world.add_source(main_id, source_code);
        world.set_main(main_id);

        let doc = typst::compile::<PagedDocument>(&*world);
        if let Ok(paged) = doc.output {
            if paged.pages().len() <= 1 {
                best_width = mid;
                high = mid - 10.0;
            } else {
                low = mid + 10.0;
            }
        } else {
            low = mid + 10.0;
        }
    }

    best_width
}

fn prepare_world_for_render(
    content: &str,
    template: &str,
    config_json: &str,
) -> Result<(), JsValue> {
    let mut world = get_world();

    let config: CardConfig = serde_json::from_str(config_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid config JSON: {}", e)))?;

    let main_id = world::make_file_id("/main.typ");

    let show_title = config.show_title.unwrap_or(true);
    let show_author = config.show_author.unwrap_or(true);
    let show_source = config.show_source.unwrap_or(true);

    let title = if show_title { config.title.unwrap_or_default() } else { String::new() };
    let author = if show_author { config.author.unwrap_or_default() } else { String::new() };
    let source = if show_source { config.source.unwrap_or_default() } else { String::new() };
    let font_family = config.font_family.unwrap_or_else(|| "Serif".to_string());

    let title_escaped = title.replace('\\', "\\\\").replace('"', "\\\"");
    let author_escaped = author.replace('\\', "\\\\").replace('"', "\\\"");
    let source_escaped = source.replace('\\', "\\\\").replace('"', "\\\"");
    let font_family_escaped = font_family.replace('\\', "\\\\").replace('"', "\\\"");
    let safe_content = if content.trim().is_empty() {
        "请输入正文内容...".to_string()
    } else {
        content.replace('#', "\\#")
    };

    let (width_expr, height_expr) = if config.auto_dimension.as_deref() == Some("height") || config.height == Some(0.0) {
        let w = config.width.unwrap_or(1080.0).max(200.0);
        (format!("{}pt", w), "auto".to_string())
    } else if config.auto_dimension.as_deref() == Some("width") || config.width == Some(0.0) {
        let target_h = config.height.unwrap_or(1440.0).max(200.0);
        let font_size = config.font_size.unwrap_or(24.0);
        let line_height = config.line_height.unwrap_or(1.8);
        let first_line_indent = if config.first_line_indent.unwrap_or(true) { "2em" } else { "0pt" };
        let justify = if config.justify.unwrap_or(true) { "true" } else { "false" };
        let bg_color_expr = match &config.bg_color {
            Some(c) if !c.trim().is_empty() => format!("rgb(\"{}\")", c.trim()),
            _ => "none".to_string(),
        };

        let best_w = find_optimal_width(
            &mut world,
            template,
            target_h,
            &safe_content,
            &title_escaped,
            &author_escaped,
            &source_escaped,
            &font_family_escaped,
            font_size,
            line_height,
            &bg_color_expr,
            first_line_indent,
            justify,
        );
        (format!("{}pt", best_w), format!("{}pt", target_h))
    } else {
        let w = config.width.unwrap_or(1080.0).max(200.0);
        let h = config.height.unwrap_or(1440.0).max(200.0);
        (format!("{}pt", w), format!("{}pt", h))
    };

    let font_size = config.font_size.unwrap_or(24.0);
    let line_height = config.line_height.unwrap_or(1.8);
    let first_line_indent = if config.first_line_indent.unwrap_or(true) { "2em" } else { "0pt" };
    let justify = if config.justify.unwrap_or(true) { "true" } else { "false" };
    let bg_color_expr = match &config.bg_color {
        Some(c) if !c.trim().is_empty() => format!("rgb(\"{}\")", c.trim()),
        _ => "none".to_string(),
    };

    let typst_source = format!(
        r#"
#import "/templates/{template}.typ": *
#show: card.with(
  width: {width_expr},
  height: {height_expr},
  title: "{title}",
  author: "{author}",
  source: "{source}",
  font-family: "{font_family}",
  font-size: {font_size}pt,
  line-height: {line_height}em,
  bg-color: {bg_color_expr},
  first-line-indent: {first_line_indent},
  justify: {justify},
)

{content}
        "#,
        template = template,
        width_expr = width_expr,
        height_expr = height_expr,
        title = title_escaped,
        author = author_escaped,
        source = source_escaped,
        font_family = font_family_escaped,
        font_size = font_size,
        line_height = line_height,
        bg_color_expr = bg_color_expr,
        first_line_indent = first_line_indent,
        justify = justify,
        content = safe_content
    );

    world.add_source(main_id, typst_source);
    world.set_main(main_id);

    Ok(())
}

fn load_templates(world: &mut CardWorld) {
    macro_rules! add_template {
        ($name:expr) => {
            let id = world::make_file_id(concat!("/templates/", $name, ".typ"));
            let content = include_str!(concat!("../../../templates/", $name, ".typ")).to_string();
            world.add_source(id, content);
        };
    }

    add_template!("literary-paper");
    add_template!("xiaohongshu");
    add_template!("minimal-dark");
    add_template!("newspaper");
}

#[wasm_bindgen]
pub fn render_card(content: &str, template: &str, config_json: &str) -> Result<Vec<u8>, JsValue> {
    {
        let mut world = get_world();
        load_templates(&mut world);
    }

    prepare_world_for_render(content, template, config_json)?;

    let world = get_world();
    let warned = typst::compile::<PagedDocument>(&*world);
    let document = warned.output
        .map_err(|err| JsValue::from_str(&format!("Compilation error: {:?}", err)))?;

    if document.pages().is_empty() {
        return Err(JsValue::from_str("No pages generated"));
    }

    let page = &document.pages()[0];
    let opts = RenderOptions::default();
    let pixmap = typst_render::render(page, &opts);

    pixmap.encode_png()
        .map_err(|e| JsValue::from_str(&format!("PNG encoding error: {}", e)))
}

#[wasm_bindgen]
pub fn render_card_svg(content: &str, template: &str, config_json: &str) -> Result<String, JsValue> {
    {
        let mut world = get_world();
        load_templates(&mut world);
    }

    prepare_world_for_render(content, template, config_json)?;

    let world = get_world();
    let warned = typst::compile::<PagedDocument>(&*world);
    let document = warned.output
        .map_err(|err| JsValue::from_str(&format!("Compilation error: {:?}", err)))?;

    if document.pages().is_empty() {
        return Err(JsValue::from_str("No pages generated"));
    }

    let page = &document.pages()[0];
    let opts = SvgOptions::default();
    let svg = typst_svg::svg(page, &opts);
    Ok(svg)
}

#[wasm_bindgen]
pub fn get_page_count(content: &str, template: &str, config_json: &str) -> Result<u32, JsValue> {
    {
        let mut world = get_world();
        load_templates(&mut world);
    }

    prepare_world_for_render(content, template, config_json)?;

    let world = get_world();
    let warned = typst::compile::<PagedDocument>(&*world);
    let document = warned.output
        .map_err(|err| JsValue::from_str(&format!("Compilation error: {:?}", err)))?;

    Ok(document.pages().len() as u32)
}

#[wasm_bindgen]
pub fn render_page(content: &str, template: &str, config_json: &str, page_idx: u32) -> Result<Vec<u8>, JsValue> {
    {
        let mut world = get_world();
        load_templates(&mut world);
    }

    prepare_world_for_render(content, template, config_json)?;

    let world = get_world();
    let warned = typst::compile::<PagedDocument>(&*world);
    let document = warned.output
        .map_err(|err| JsValue::from_str(&format!("Compilation error: {:?}", err)))?;

    let pages = document.pages();
    if page_idx as usize >= pages.len() {
        return Err(JsValue::from_str("Page index out of bounds"));
    }

    let page = &pages[page_idx as usize];
    let opts = RenderOptions::default();
    let pixmap = typst_render::render(page, &opts);

    pixmap.encode_png()
        .map_err(|e| JsValue::from_str(&format!("PNG encoding error: {}", e)))
}
