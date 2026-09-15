use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardConfig {
    #[serde(default = "default_width")]
    pub width: f64,
    #[serde(default = "default_height")]
    pub height: f64,
    pub title: Option<String>,
    pub author: Option<String>,
    pub font_family: Option<String>,
}

fn default_width() -> f64 { 1080.0 }
fn default_height() -> f64 { 1440.0 }

impl Default for CardConfig {
    fn default() -> Self {
        Self {
            width: default_width(),
            height: default_height(),
            title: None,
            author: None,
            font_family: None,
        }
    }
}
