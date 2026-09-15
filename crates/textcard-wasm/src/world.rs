use std::collections::HashMap;
use std::path::PathBuf;

use typst::diag::{FileError, FileResult};
use typst::foundations::{Bytes, Datetime, Duration};
use typst::syntax::{FileId, RootedPath, Source, VirtualPath, VirtualRoot};
use typst::text::{Font, FontBook};
use typst::World;
use typst::{Library, LibraryExt};

pub fn make_file_id(path: &str) -> FileId {
    let vpath = VirtualPath::new(path).expect("valid virtual path");
    FileId::new(RootedPath::new(VirtualRoot::Project, vpath))
}

/// A custom World implementation for Typst in WASM.
pub struct CardWorld {
    library: typst::utils::LazyHash<Library>,
    book: typst::utils::LazyHash<FontBook>,
    fonts: Vec<Font>,
    files: HashMap<FileId, Bytes>,
    sources: HashMap<FileId, Source>,
    main: FileId,
}

impl CardWorld {
    pub fn new() -> Self {
        let main_id = make_file_id("/main.typ");
        Self {
            library: typst::utils::LazyHash::new(Library::default()),
            book: typst::utils::LazyHash::new(FontBook::new()),
            fonts: Vec::new(),
            files: HashMap::new(),
            sources: HashMap::new(),
            main: main_id,
        }
    }

    pub fn set_main(&mut self, id: FileId) {
        self.main = id;
    }

    pub fn add_source(&mut self, id: FileId, text: String) {
        let source = Source::new(id, text);
        self.sources.insert(id, source);
    }

    pub fn add_file(&mut self, id: FileId, data: Vec<u8>) {
        self.files.insert(id, Bytes::new(data));
    }

    pub fn add_font(&mut self, font: Font) {
        if self.fonts.iter().any(|f| f.info() == font.info()) {
            return;
        }
        self.fonts.push(font);
        // Rebuild the font book
        self.book = typst::utils::LazyHash::new(FontBook::from_fonts(self.fonts.iter()));
    }
}

impl World for CardWorld {
    fn library(&self) -> &typst::utils::LazyHash<Library> {
        &self.library
    }

    fn book(&self) -> &typst::utils::LazyHash<FontBook> {
        &self.book
    }

    fn main(&self) -> FileId {
        self.main
    }

    fn source(&self, id: FileId) -> FileResult<Source> {
        self.sources
            .get(&id)
            .cloned()
            .ok_or_else(|| FileError::NotFound(PathBuf::from(id.vpath().get_without_slash())))
    }

    fn file(&self, id: FileId) -> FileResult<Bytes> {
        self.files
            .get(&id)
            .cloned()
            .ok_or_else(|| FileError::NotFound(PathBuf::from(id.vpath().get_without_slash())))
    }

    fn font(&self, index: usize) -> Option<Font> {
        self.fonts.get(index).cloned()
    }

    fn today(&self, _offset: Option<Duration>) -> Option<Datetime> {
        #[cfg(target_arch = "wasm32")]
        {
            let now = js_sys::Date::new_0();
            Datetime::from_ymd(
                now.get_full_year() as i32,
                (now.get_month() + 1) as u8, // JS months are 0-indexed
                now.get_date() as u8,
            )
        }
        #[cfg(not(target_arch = "wasm32"))]
        {
            Datetime::from_ymd(2026, 9, 15)
        }
    }
}
