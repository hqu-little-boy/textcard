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
    leading_em: f64,
    spacing_em: f64,
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
  line-height: {leading_em}em,
  par-spacing: {spacing_em}em,
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
            leading_em = leading_em,
            spacing_em = spacing_em,
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

fn format_content_for_typst(content: &str) -> String {
    let trimmed = content.trim();
    if trimmed.is_empty() {
        return "请输入正文内容...".to_string();
    }

    // Escape '#' so Typst doesn't interpret it as code
    let escaped = content.replace('#', "\\#");
    let normalized = escaped.replace("\r\n", "\n").replace('\r', "\n");

    // Split paragraphs by 2 or more consecutive newlines
    let paragraphs: Vec<&str> = normalized.split("\n\n").collect();
    let mut formatted_paragraphs = Vec::new();

    for p in paragraphs {
        if p.is_empty() {
            formatted_paragraphs.push(String::new());
            continue;
        }
        // Within each paragraph, single newlines represent line breaks typed by the user (e.g. poetry, list items).
        // In Typst, " \\\n" creates a line break within the paragraph without starting a new paragraph.
        let lines: Vec<&str> = p.split('\n').collect();
        let formatted_p = lines.join(" \\\n");
        formatted_paragraphs.push(formatted_p);
    }

    formatted_paragraphs.join("\n\n")
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
    let safe_content = format_content_for_typst(content);

    let font_size = config.font_size.unwrap_or(24.0);
    let raw_line_height = config.line_height.unwrap_or(1.8);
    // In Typst, `leading` is the extra spacing BETWEEN lines, not total line-height multiplier.
    // To match user intuition of line-height factor (e.g. 1.8), leading should be (line_height - 1.0) * 0.9.
    // Inter-paragraph spacing (spacing_em) must be significantly larger than leading_em.
    let leading_em = ((raw_line_height - 1.0) * 0.9).max(0.35);
    let spacing_em = (leading_em + 0.95).max(1.5);

    let first_line_indent = if config.first_line_indent.unwrap_or(true) { "2em" } else { "0pt" };
    let justify = if config.justify.unwrap_or(true) { "true" } else { "false" };
    let bg_color_expr = match &config.bg_color {
        Some(c) if !c.trim().is_empty() => format!("rgb(\"{}\")", c.trim()),
        _ => "none".to_string(),
    };

    let (width_expr, height_expr) = match config.auto_dimension.as_deref() {
        Some("height") => {
            let w = config.width.filter(|&v| v > 20.0).unwrap_or(1080.0);
            (format!("{}pt", w), "auto".to_string())
        }
        Some("width") => {
            let target_h = config.height.filter(|&v| v > 20.0).unwrap_or(1440.0);

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
                leading_em,
                spacing_em,
                &bg_color_expr,
                first_line_indent,
                justify,
            );
            (format!("{}pt", best_w), format!("{}pt", target_h))
        }
        _ => {
            let w = config.width.filter(|&v| v > 20.0).unwrap_or(1080.0);
            let h = config.height.filter(|&v| v > 20.0).unwrap_or(1440.0);
            (format!("{}pt", w), format!("{}pt", h))
        }
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
  line-height: {leading_em}em,
  par-spacing: {spacing_em}em,
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
        leading_em = leading_em,
        spacing_em = spacing_em,
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_content_soft_breaks_and_paragraphs() {
        let input = "第一行\n第二行\n\n第二段第一行\n第二段第二行";
        let output = format_content_for_typst(input);
        assert_eq!(output, "第一行 \\\n第二行\n\n第二段第一行 \\\n第二段第二行");
    }

    #[test]
    fn test_format_content_escapes_hash() {
        let input = "标签 #tag 还有 #123";
        let output = format_content_for_typst(input);
        assert_eq!(output, "标签 \\#tag 还有 \\#123");
    }

    #[test]
    fn test_format_content_empty() {
        assert_eq!(format_content_for_typst("   "), "请输入正文内容...");
    }

    #[test]
    fn test_prepare_world_and_compile_all_templates() {
        let mut world = get_world();
        load_templates(&mut world);
        drop(world);

        let sample_text = "床前明月光，\n疑是地上霜。\n\n举头望明月，\n低头思故乡。";
        let config_json = r#"{
            "width": 1080,
            "height": 1440,
            "fontSize": 24,
            "lineHeight": 1.8,
            "showTitle": true,
            "title": "静夜思",
            "showAuthor": true,
            "author": "李白",
            "showSource": true,
            "source": "唐诗三百首"
        }"#;

        for template in ["literary-paper", "xiaohongshu", "minimal-dark", "newspaper"] {
            let res = prepare_world_for_render(sample_text, template, config_json);
            assert!(res.is_ok(), "Failed prepare for template {}: {:?}", template, res.err());

            let world = get_world();
            let doc = typst::compile::<PagedDocument>(&*world);
            assert!(doc.output.is_ok(), "Compilation error for {}: {:?}", template, doc.output.err());
            let paged = doc.output.unwrap();
            assert!(!paged.pages().is_empty(), "No pages for {}", template);
        }
    }

    #[test]
    fn test_auto_dimension_compiles() {
        let mut world = get_world();
        load_templates(&mut world);
        drop(world);

        let sample_text = "长篇文字测试第一段。\n第二行。\n\n第二段。";
        let config_json = r#"{
            "autoDimension": "height",
            "width": 800,
            "fontSize": 20,
            "lineHeight": 1.6
        }"#;

        let res = prepare_world_for_render(sample_text, "literary-paper", config_json);
        assert!(res.is_ok());
        let world = get_world();
        let doc = typst::compile::<PagedDocument>(&*world);
        assert!(doc.output.is_ok());
    }
}
