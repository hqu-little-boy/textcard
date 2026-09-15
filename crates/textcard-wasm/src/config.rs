use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardConfig {
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub auto_dimension: Option<String>, // "height" | "width" | "none"
    pub title: Option<String>,
    pub author: Option<String>,
    pub source: Option<String>,
    pub show_title: Option<bool>,
    pub show_author: Option<bool>,
    pub show_source: Option<bool>,
    pub font_family: Option<String>,
    pub font_size: Option<f64>,
    pub line_height: Option<f64>,
    pub bg_color: Option<String>,
    pub first_line_indent: Option<bool>,
    pub justify: Option<bool>,
}

impl Default for CardConfig {
    fn default() -> Self {
        Self {
            width: Some(1080.0),
            height: Some(1440.0),
            auto_dimension: None,
            title: None,
            author: None,
            source: None,
            show_title: Some(true),
            show_author: Some(true),
            show_source: Some(true),
            font_family: None,
            font_size: Some(24.0),
            line_height: Some(1.8),
            bg_color: None,
            first_line_indent: Some(true),
            justify: Some(true),
        }
    }
}

