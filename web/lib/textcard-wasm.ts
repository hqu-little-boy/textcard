import { CardConfig, Theme } from '@/components/types'

let wasmInstance: any = null
let initPromise: Promise<any> | null = null
let fontsLoaded = false
let fontLoadingPromise: Promise<void> | null = null

function getAssetUrl(relPath: string): string {
  if (typeof window === 'undefined') return `/${relPath}`
  const origin = window.location.origin
  const path = window.location.pathname.replace(/\/$/, '')
  if (!path || path === '/') {
    return `${origin}/${relPath}`
  }
  return `${origin}${path}/${relPath}`
}

function getWasmUrl(): string {
  return getAssetUrl('pkg/textcard_wasm_v2.wasm?v=2.2')
}

export async function ensureFontsLoaded(wasm: any): Promise<void> {
  if (fontsLoaded) return
  if (!fontLoadingPromise) {
    fontLoadingPromise = (async () => {
      try {
        const fontUrl = getAssetUrl('fonts/cjk-fallback.ttf')
        const res = await fetch(fontUrl)
        if (!res.ok) {
          throw new Error(`Failed to load CJK font from ${fontUrl}: ${res.status}`)
        }
        const buffer = await res.arrayBuffer()
        wasm.load_font('Droid Sans Fallback', new Uint8Array(buffer))
        fontsLoaded = true
        console.log('CJK font loaded into Typst WASM engine successfully!')
      } catch (e) {
        console.error('Error loading font into Typst:', e)
        fontLoadingPromise = null
        throw e
      }
    })()
  }
  return fontLoadingPromise
}

export async function initTextcardWasm() {
  if (wasmInstance && fontsLoaded) return wasmInstance
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Dynamic import of the wasm-pack generated ES module
        // @ts-ignore
        const mod = await import('../pkg/textcard_wasm.js')
        const wasmUrl = getWasmUrl()
        await mod.default(wasmUrl)
        mod.init()

        // Asynchronously preload font before returning
        await ensureFontsLoaded(mod)

        wasmInstance = mod
        return mod
      } catch (err) {
        initPromise = null
        throw err
      }
    })()
  }
  return initPromise
}

function buildConfigJson(title: string, author: string, source: string, config: CardConfig) {
  let width = 1080
  let height = 1440
  let auto_dimension: 'height' | 'width' | 'none' = 'none'

  if (config.aspectRatio === '1:1') {
    width = 1080
    height = 1080
    auto_dimension = 'none'
  } else if (config.aspectRatio === '16:9') {
    width = 1920
    height = 1080
    auto_dimension = 'none'
  } else if (config.aspectRatio === '3:4') {
    width = 1080
    height = 1440
    auto_dimension = 'none'
  } else if (config.aspectRatio === 'auto') {
    if (config.autoMode === 'fixed-height') {
      auto_dimension = 'width'
      height = config.customHeight || 1440
      width = null as any
    } else {
      // Default: fixed-width, auto-height
      auto_dimension = 'height'
      width = config.customWidth || 1080
      height = null as any
    }
  }

  return JSON.stringify({
    width,
    height,
    auto_dimension,
    title: config.showTitle ? title.trim() : '',
    author: config.showAuthor ? author.trim() : '',
    source: config.showSource ? source.trim() : '',
    show_title: config.showTitle,
    show_author: config.showAuthor,
    show_source: config.showSource,
    font_family: config.fontFamily,
    font_size: config.fontSize,
    line_height: config.lineHeight,
    bg_color: config.bgColor,
    first_line_indent: config.firstLineIndent,
    justify: config.justify,
  })
}

export async function renderCardToPng(
  content: string,
  title: string,
  author: string,
  source: string,
  template: Theme,
  config: CardConfig
): Promise<Blob> {
  const wasm = await initTextcardWasm()
  const configJson = buildConfigJson(title, author, source, config)
  const bytes = wasm.render_card(content, template, configJson)
  return new Blob([bytes], { type: 'image/png' })
}

export async function renderCardToSvg(
  content: string,
  title: string,
  author: string,
  source: string,
  template: Theme,
  config: CardConfig
): Promise<string> {
  const wasm = await initTextcardWasm()
  const configJson = buildConfigJson(title, author, source, config)
  return wasm.render_card_svg(content, template, configJson)
}

export async function getPageCount(
  content: string,
  title: string,
  author: string,
  source: string,
  template: Theme,
  config: CardConfig
): Promise<number> {
  const wasm = await initTextcardWasm()
  const configJson = buildConfigJson(title, author, source, config)
  return wasm.get_page_count(content, template, configJson)
}

export async function renderPageToPng(
  content: string,
  title: string,
  author: string,
  source: string,
  template: Theme,
  config: CardConfig,
  pageIndex: number
): Promise<Blob> {
  const wasm = await initTextcardWasm()
  const configJson = buildConfigJson(title, author, source, config)
  const bytes = wasm.render_page(content, template, configJson, pageIndex)
  return new Blob([bytes], { type: 'image/png' })
}
