import TurndownService from 'turndown'

export interface ExtractedArticle {
  title: string
  author: string
  source: string
  content: string
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

turndown.addRule('remove-junk', {
  filter: ['script', 'style', 'iframe', 'noscript', 'canvas'],
  replacement: () => '',
})

/**
 * 纯前端抓取与提取文章正文
 * 策略 1: 优先使用 Jina Reader API (https://r.jina.ai/)，自动绕过微信/知乎的反爬与动态渲染，输出格式化 Markdown
 * 策略 2: 降级使用公共 CORS 代理 (AllOrigins) + 浏览器原生 DOMParser + Turndown
 */
export async function extractArticle(rawUrl: string): Promise<ExtractedArticle> {
  const targetUrl = rawUrl.trim()
  if (!targetUrl) {
    throw new Error('请输入有效的文章链接')
  }

  let hostname = ''
  try {
    const parsed = new URL(targetUrl)
    hostname = parsed.hostname
  } catch {
    throw new Error('链接格式不正确，请确保包含 http:// 或 https://')
  }

  // 1. 尝试主通道：Jina Reader (免代理、支持跨域、自动转 Markdown)
  try {
    const jinaUrl = `https://r.jina.ai/${targetUrl}`
    const response = await fetch(jinaUrl, {
      headers: {
        Accept: 'text/plain, text/markdown',
      },
    })

    if (response.ok) {
      const text = await response.text()
      if (text && text.length > 50) {
        return parseJinaOutput(text, hostname)
      }
    }
  } catch (jinaErr) {
    console.warn('Jina Reader fallback, trying CORS proxy...', jinaErr)
  }

  // 2. 降级备用通道：通过 AllOrigins CORS 代理拉取 HTML，并在浏览器端解析
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    const response = await fetch(proxyUrl)

    if (!response.ok) {
      throw new Error(`CORS 代理请求失败: HTTP ${response.status}`)
    }

    const html = await response.text()
    if (!html) {
      throw new Error('未能从目标网址读取到内容')
    }

    return parseHtmlInBrowser(html, hostname)
  } catch (proxyErr: any) {
    console.error('All extraction attempts failed:', proxyErr)
    throw new Error(
      proxyErr.message || '受目标网站防爬与浏览器跨域限制，自动提取失败。建议直接复制文章内容粘贴到输入框。'
    )
  }
}

/**
 * 解析 Jina Reader 输出的 Markdown
 */
function parseJinaOutput(markdown: string, hostname: string): ExtractedArticle {
  const lines = markdown.split('\n')
  let title = ''
  let contentStartIndex = 0

  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i].trim()
    if (line.startsWith('Title:')) {
      title = line.replace(/^Title:\s*/, '').trim()
    }
    if (line.startsWith('Markdown Content:')) {
      contentStartIndex = i + 1
      break
    }
  }

  let body = lines.slice(contentStartIndex).join('\n').trim()

  // 过滤 Jina 可能带有的头尾系统说明
  body = body.replace(/Warning:\s*This is a cached snapshot[\s\S]*?\n\n/, '').trim()

  let source = hostname
  if (hostname.includes('weixin.qq.com')) source = '微信公众号'
  else if (hostname.includes('zhihu.com')) source = '知乎'
  else if (hostname.includes('yuque.com')) source = '语雀'
  else if (hostname.includes('medium.com')) source = 'Medium'

  return {
    title: title || '未命名文章',
    author: '',
    source,
    content: body,
  }
}

/**
 * 使用浏览器原生 DOMParser 解析 HTML
 */
function parseHtmlInBrowser(html: string, hostname: string): ExtractedArticle {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // 移除无用标签
  const junks = doc.querySelectorAll('script, style, svg, noscript, iframe, link')
  junks.forEach((el) => el.remove())

  let title = ''
  let author = ''
  let source = hostname
  let mainElement: Element | null = null

  if (hostname.includes('weixin.qq.com')) {
    source = '微信公众号'
    title = doc.querySelector('#activity-name')?.textContent?.trim() || doc.title || ''
    author = doc.querySelector('#js_name')?.textContent?.trim() || ''
    mainElement = doc.querySelector('#js_content')
  } else if (hostname.includes('zhihu.com')) {
    source = '知乎'
    title = doc.querySelector('.Post-Title')?.textContent?.trim() || doc.title || ''
    author = doc.querySelector('.AuthorInfo-name')?.textContent?.trim() || ''
    mainElement = doc.querySelector('.Post-RichText, .RichContent-inner')
  } else if (hostname.includes('yuque.com')) {
    source = '语雀'
    title = doc.querySelector('.article-title')?.textContent?.trim() || doc.title || ''
    author = doc.querySelector('.doc-author-name')?.textContent?.trim() || ''
    mainElement = doc.querySelector('.ne-viewer-body, article')
  } else if (hostname.includes('medium.com')) {
    source = 'Medium'
    title = doc.querySelector('h1')?.textContent?.trim() || doc.title || ''
    author = doc.querySelector('[data-testid="authorName"]')?.textContent?.trim() || ''
    mainElement = doc.querySelector('article, main')
  }

  // 通用备选逻辑
  if (!title) {
    title =
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ||
      doc.querySelector('h1')?.textContent?.trim() ||
      doc.title ||
      '未命名文章'
  }

  if (!mainElement) {
    mainElement = doc.querySelector('article, main, [role="main"], .article-content, .post-content') || doc.body
  }

  // 移除页眉页脚
  mainElement.querySelectorAll('header, footer, nav, aside, .comments, .sidebar').forEach((el) => el.remove())

  const markdown = turndown.turndown(mainElement.innerHTML || '')

  return {
    title,
    author,
    source,
    content: markdown.trim() || '未能提取到正文',
  }
}
