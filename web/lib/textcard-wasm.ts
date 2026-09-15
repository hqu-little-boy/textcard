import { CardConfig, Theme } from '@/components/types'

let wasmInstance: any = null
let initPromise: Promise<any> | null = null

function getWasmUrl(): string {
  if (typeof window === 'undefined') return '/pkg/textcard_wasm_bg.wasm'
  const origin = window.location.origin
  const path = window.location.pathname.replace(/\/$/, '')
  if (!path || path === '/') {
    return `${origin}/pkg/textcard_wasm_bg.wasm`
  }
  return `${origin}${path}/pkg/textcard_wasm_bg.wasm`
}

export async function initTextcardWasm() {
  if (wasmInstance) return wasmInstance
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Dynamic import of the wasm-pack generated ES module
        // @ts-ignore
        const mod = await import('../pkg/textcard_wasm.js')
        const wasmUrl = getWasmUrl()
        await mod.default(wasmUrl)
        mod.init()
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

function buildConfigJson(title: string, author: string, config: CardConfig) {
  let width = 1080
  let height = 1440

  if (config.aspectRatio === '1:1') {
    width = 1080
    height = 1080
  } else if (config.aspectRatio === '16:9') {
    width = 1920
    height = 1080
  } else if (config.aspectRatio === '3:4') {
    width = 1080
    height = 1440
  }

  return JSON.stringify({
    width,
    height,
    title: config.showTitle ? title : '',
    author: config.showAuthor ? author : '',
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
  template: Theme,
  config: CardConfig
): Promise<Blob> {
  const wasm = await initTextcardWasm()
  const configJson = buildConfigJson(title, author, config)
  const bytes = wasm.render_card(content, template, configJson)
  return new Blob([bytes], { type: 'image/png' })
}

export async function renderCardToSvg(
  content: string,
  title: string,
  author: string,
  template: Theme,
  config: CardConfig
): Promise<string> {
  const wasm = await initTextcardWasm()
  const configJson = buildConfigJson(title, author, config)
  return wasm.render_card_svg(content, template, configJson)
}

export async function getPageCount(
  content: string,
  title: string,
  author: string,
  template: Theme,
  config: CardConfig
): Promise<number> {
  const wasm = await initTextcardWasm()
  const configJson = buildConfigJson(title, author, config)
  return wasm.get_page_count(content, template, configJson)
}

export async function renderPageToPng(
  content: string,
  title: string,
  author: string,
  template: Theme,
  config: CardConfig,
  pageIndex: number
): Promise<Blob> {
  const wasm = await initTextcardWasm()
  const configJson = buildConfigJson(title, author, config)
  const bytes = wasm.render_page(content, template, configJson, pageIndex)
  return new Blob([bytes], { type: 'image/png' })
}
