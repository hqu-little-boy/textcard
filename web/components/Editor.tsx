'use client'

import React, { useState, useEffect } from 'react'
import ThemeSelector from './ThemeSelector'
import ConfigPanel from './ConfigPanel'
import CardPreview from './CardPreview'
import ExportBar from './ExportBar'
import { CardConfig, Theme } from './types'
import { initTextcardWasm } from '@/lib/textcard-wasm'
import { Type, Link as LinkIcon, Sparkles, Loader2, CheckCircle2, AlertCircle, Bookmark, XCircle, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const PRESETS = [
  {
    label: '古风诗词',
    title: '春江花月夜',
    author: '张若虚',
    source: '全唐诗',
    theme: 'literary-paper' as Theme,
    content: `春江潮水连海平，海上明月共潮生。
滟滟随波千万里，何处春江无月明！
江流宛转绕芳甸，月照花林皆似霰。
空里流霜不觉飞，汀上白沙看不见。
江天一色无纤尘，皎皎空中孤月轮。
江畔何人初见月？江月何年初照人？
人生代代无穷已，江月年年望相似。`,
  },
  {
    label: '纯正文随笔',
    title: '',
    author: '',
    source: '',
    theme: 'literary-paper' as Theme,
    content: `万物皆有裂痕，那是光照进来的地方。

不必苛求所有事情都有标题与作者，一段纯粹沉静的文字本身就拥有打动人心的力量。把时间留给文字与审美，简简单单，亦是圆满。`,
  },
  {
    label: '小红书干货',
    title: '高效学习的 3 个底层逻辑 💡',
    author: '思维工坊',
    source: '个人笔记',
    theme: 'xiaohongshu' as Theme,
    content: `为什么你学得越多，忘得越快？分享高效吸收的 3 个关键：

1️⃣ 费曼输出：用大白话讲给外行听，卡壳的地方就是认知漏洞。
2️⃣ 间隔复习：打破艾宾浩斯遗忘曲线，在第 1、3、7 天主动提取。
3️⃣ 场景化关联：知识不挂载到真实场景，就只是一堆无用碎片。

收藏起来，下周开始用新方法复盘！`,
  },
  {
    label: '名家散文',
    title: '荷塘月色 (节选)',
    author: '朱自清',
    source: '散文集',
    theme: 'literary-paper' as Theme,
    content: `曲曲折折的荷塘上面，弥望的是田田的叶子。叶子出水很高，像亭亭的舞女的裙。层层的叶子中间，零星地点缀着些白花，有袅娜地开着的，有羞涩地打着朵儿的；正如一粒粒的明珠，又如碧天里的星星，又如刚出浴的美人。

微风过处，送来缕缕清香，仿佛远处高楼上渺茫的歌声似的。`,
  },
  {
    label: '科技思考',
    title: '工具与思想的边界',
    author: 'Alex Chen',
    source: 'Substack',
    theme: 'minimal-dark' as Theme,
    content: `我们塑造了工具，此后工具又塑造了我们。

当大语言模型重塑了人机交互的界限，真正稀缺的不再是答案的获取速度，而是提出深刻问题的能力，以及在海量信息洪流中保持专注审美的定力。`,
  },
]

export default function Editor() {
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text')
  const [content, setContent] = useState(PRESETS[0].content)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState(PRESETS[0].title)
  const [author, setAuthor] = useState(PRESETS[0].author)
  const [source, setSource] = useState(PRESETS[0].source)
  const [theme, setTheme] = useState<Theme>(PRESETS[0].theme)
  
  const [isMetaExpanded, setIsMetaExpanded] = useState(false)

  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null)

  const [config, setConfig] = useState<CardConfig>({
    fontSize: 18,
    lineHeight: 1.8,
    fontFamily: 'serif',
    aspectRatio: '3:4',
    autoMode: 'fixed-width',
    customWidth: 1080,
    customHeight: 1440,
    bgColor: '#ffffff',
    showTitle: true,
    showAuthor: true,
    showSource: true,
    firstLineIndent: true,
    justify: true,
  })

  useEffect(() => {
    // Preload WASM engine and CJK font in background
    initTextcardWasm().catch((err) => console.warn('Preloading WASM failed:', err))
  }, [])

  const handleExtractUrl = async () => {
    if (!url.trim()) return
    setIsExtracting(true)
    setExtractError(null)
    setExtractSuccess(null)

    try {
      const { extractArticle } = await import('@/lib/extractor')
      const data = await extractArticle(url.trim())

      if (data) {
        if (data.title) setTitle(data.title)
        if (data.author) setAuthor(data.author)
        if (data.source) setSource(data.source)
        if (data.content) setContent(data.content)
        setExtractSuccess(`成功从 ${data.source || '文章'} 提取正文！已导入卡片。`)
      }
    } catch (err: any) {
      setExtractError(err.message || '提取文章内容失败，建议直接复制文章内容粘贴')
    } finally {
      setIsExtracting(false)
    }
  }

  const applyPreset = (p: typeof PRESETS[0]) => {
    setContent(p.content)
    setTitle(p.title)
    setAuthor(p.author)
    setSource(p.source)
    setTheme(p.theme)
  }

  const clearOptionalMeta = () => {
    setTitle('')
    setAuthor('')
    setSource('')
  }

  const hasOptionalMeta = Boolean(title.trim() || author.trim() || source.trim())
  
  // Helper to get a tiny color dot for presets
  const getThemeColorClass = (presetTheme: Theme) => {
    switch (presetTheme) {
      case 'literary-paper': return 'bg-[#f4f1ea]'
      case 'xiaohongshu': return 'bg-red-500'
      case 'minimal-dark': return 'bg-zinc-800'
      case 'newspaper': return 'bg-[#e8e3d3]'
      default: return 'bg-zinc-500'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
      {/* Left Panel: Input & Config */}
      <div className="lg:col-span-5 space-y-6 flex flex-col">
        <div className="glass-panel rounded-2xl p-4 md:p-6 shadow-xl">
          {/* Segmented Control Tabs */}
          <div className="flex p-1 bg-zinc-950/80 rounded-xl mb-6 border border-zinc-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('text')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-all duration-200",
                activeTab === 'text'
                  ? "bg-zinc-800/90 text-zinc-100 shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent"
              )}
            >
              <Type size={14} />
              直接编写文本
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-all duration-200",
                activeTab === 'url'
                  ? "bg-zinc-800/90 text-zinc-100 shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent"
              )}
            >
              <LinkIcon size={14} />
              URL 一键抓取
            </button>
          </div>

          {/* Preset Chips */}
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-zinc-500 flex items-center gap-1 shrink-0 text-xs font-medium mr-1">
              <Bookmark size={12} /> 灵感预设:
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700/50 transition-all text-[11px] whitespace-nowrap flex items-center gap-1.5 hover:shadow-sm focus-ring"
              >
                <span className={clsx("w-2 h-2 rounded-full shadow-inner", getThemeColorClass(p.theme))}></span>
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            {activeTab === 'text' ? (
              <div className="relative group">
                <div className="flex justify-between items-end mb-2 px-1">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <FileText size={14} className="text-zinc-500" />正文内容
                  </label>
                  <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">{content.length} 字</span>
                </div>
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="在此输入或粘贴正文内容、诗歌、随笔... 支持 Markdown 语法"
                    className="w-full h-56 bg-zinc-950/80 border border-zinc-800 rounded-xl p-5 text-zinc-200 placeholder-zinc-600 focus-ring resize-none transition-all leading-relaxed shadow-inner"
                  />
                  <div className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-inset ring-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80 shadow-inner">
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="粘贴公众号、知乎、语雀、Medium 或博客链接..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3.5 pr-28 text-zinc-200 placeholder-zinc-500 focus-ring transition-all text-sm shadow-inner"
                  />
                  <button
                    onClick={handleExtractUrl}
                    disabled={isExtracting || !url.trim()}
                    className="absolute right-1.5 top-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        提取中...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        智能提取
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px] text-zinc-400">
                  <span className="text-zinc-500 py-0.5">支持平台:</span>
                  <span className="px-1.5 py-0.5 bg-zinc-800/80 rounded-md border border-zinc-700/50 text-zinc-300">微信公众号</span>
                  <span className="px-1.5 py-0.5 bg-zinc-800/80 rounded-md border border-zinc-700/50 text-zinc-300">知乎专栏/回答</span>
                  <span className="px-1.5 py-0.5 bg-zinc-800/80 rounded-md border border-zinc-700/50 text-zinc-300">语雀公开文档</span>
                  <span className="px-1.5 py-0.5 bg-zinc-800/80 rounded-md border border-zinc-700/50 text-zinc-300">Medium</span>
                  <span className="px-1.5 py-0.5 bg-zinc-800/80 rounded-md border border-zinc-700/50 text-zinc-300">通用文章</span>
                </div>

                {extractError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg flex items-center gap-2 text-xs text-rose-300 shadow-sm backdrop-blur-sm">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{extractError}</span>
                  </div>
                )}

                {extractSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-lg flex items-center gap-2 text-xs text-emerald-300 shadow-sm backdrop-blur-sm">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{extractSuccess}</span>
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Metadata Section */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsMetaExpanded(!isMetaExpanded)}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 rounded-lg transition-colors focus-ring group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-200">
                    附加信息 <span className="text-zinc-500 font-normal ml-1">标题 / 作者 / 出处</span>
                  </span>
                  {hasOptionalMeta && !isMetaExpanded && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {hasOptionalMeta && isMetaExpanded && (
                    <div
                      onClick={(e) => { e.stopPropagation(); clearOptionalMeta(); }}
                      className="text-[10px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 bg-zinc-950 rounded-md border border-zinc-800"
                    >
                      <XCircle size={10} />
                      清空
                    </div>
                  )}
                  <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {isMetaExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>
              </button>

              <div className={clsx(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isMetaExpanded ? "max-h-[300px] mt-3 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="p-4 bg-zinc-950/50 border border-zinc-800/80 rounded-lg space-y-4 shadow-inner">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">标题 (可选)</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="留空不显示"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus-ring transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">作者署名 (可选)</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="留空不显示"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus-ring transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">出处 / 书籍 / 专栏 (可选)</label>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="如《全唐诗》或专栏名"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus-ring transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConfigPanel config={config} setConfig={setConfig} />
      </div>

      {/* Right Panel: Preview & Export */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <ThemeSelector currentTheme={theme} onSelect={setTheme} />

        <div className="flex-grow flex flex-col gap-6">
          <CardPreview
            content={content}
            title={title}
            author={author}
            source={source}
            theme={theme}
            config={config}
          />
          <ExportBar
            content={content}
            title={title}
            author={author}
            source={source}
            theme={theme}
            config={config}
          />
        </div>
      </div>
    </div>
  )
}
