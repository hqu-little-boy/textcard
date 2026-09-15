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

fn prepare_world_for_render(
    content: &str,
    template: &str,
    config_json: &str,
) -> Result<(), JsValue> {
    let mut world = get_world();

    let config: CardConfig = serde_json::from_str(config_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid config JSON: {}", e)))?;

    let main_id = world::make_file_id("/main.typ");

    let title = config.title.unwrap_or_default();
    let author = config.author.unwrap_or_default();
    let font_family = config.font_family.unwrap_or_else(|| "Serif".to_string());

    let typst_source = format!(
        r#"
#import "/templates/{template}.typ": *
#show: card.with(
  width: {width}pt,
  height: {height}pt,
  title: "{title}",
  author: "{author}",
  font-family: "{font_family}",
)

{content}
        "#,
        template = template,
        width = config.width,
        height = config.height,
        title = title,
        author = author,
        font_family = font_family,
        content = content
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
