'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CardConfig, Theme } from './types'
import { renderCardToSvg } from '@/lib/textcard-wasm'
import { Loader2, Maximize2 } from 'lucide-react'
import clsx from 'clsx'

interface CardPreviewProps {
  content: string
  title: string
  author: string
  source?: string
  theme: Theme
  config: CardConfig
}

export default function CardPreview({ content, title, author, source = '', theme, config }: CardPreviewProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const renderSeq = useRef(0)

  useEffect(() => {
    const currentSeq = ++renderSeq.current
    setIsRendering(true)

    const timer = setTimeout(async () => {
      try {
        const svg = await renderCardToSvg(content, title, author, source, theme, config)
        if (currentSeq === renderSeq.current) {
          setSvgContent(svg)
          const match = svg.match(/viewBox=["']\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*["']/)
          if (match) {
            const w = Math.round(parseFloat(match[3]))
            const h = Math.round(parseFloat(match[4]))
            if (w > 1 && h > 1) {
              setDimensions({ width: w, height: h })
            }
          }
          setIsRendering(false)
        }
      } catch (err) {
        console.warn('Preview SVG render failed, keeping fallback:', err)
        if (currentSeq === renderSeq.current) {
          setIsRendering(false)
        }
      }
    }, 120)

    return () => clearTimeout(timer)
  }, [content, title, author, source, theme, config])

  const getFontFamily = () => {
    switch (config.fontFamily) {
      case 'serif': return 'var(--font-serif)'
      case 'sans': return 'var(--font-sans)'
      case 'kai': return '"Kaiti SC", "STKaiti", serif'
      default: return 'inherit'
    }
  }

  const hasTitle = Boolean(config.showTitle && title.trim())
  const hasAuthor = Boolean(config.showAuthor && author.trim())
  const hasSource = Boolean(config.showSource && source.trim())
  const hasFooter = hasAuthor || hasSource

  let ratioClass = ''
  if (config.aspectRatio === '1:1') ratioClass = 'aspect-square'
  else if (config.aspectRatio === '3:4') ratioClass = 'aspect-[3/4]'
  else if (config.aspectRatio === '16:9') ratioClass = 'aspect-video'
  else ratioClass = 'min-h-[400px]'

  return (
    <div className="w-full bg-zinc-950/60 rounded-xl border border-zinc-800 p-4 md:p-8 flex flex-col items-center justify-center relative min-h-[440px]">
      {/* Dimensions & live status badge */}
      <div className="w-full flex items-center justify-between text-xs text-zinc-500 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <Maximize2 size={13} className="text-zinc-400" />
          <span>
            {dimensions ? `${dimensions.width} × ${dimensions.height} px` : '计算排版尺寸中...'}
          </span>
          {config.aspectRatio === 'auto' && (
            <span className="bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 px-1.5 py-0.5 rounded text-[10px]">
              {config.autoMode === 'fixed-height' ? '定高·自适应宽' : '定宽·自适应高'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isRendering && (
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Loader2 size={12} className="animate-spin text-indigo-400" />
              <span>排版更新中</span>
            </span>
          )}
          {!isRendering && svgContent && (
            <span className="text-[11px] text-emerald-400/80">WASM 矢量预览 (与导出一致)</span>
          )}
        </div>
      </div>

      {svgContent ? (
        /* Real Typst vector SVG rendering: 100% pixel-perfect match with exported PNG/SVG */
        <div
          className="w-full flex items-center justify-center max-w-xl transition-all duration-200 [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:max-h-[72vh] [&>svg]:shadow-2xl [&>svg]:rounded-lg [&>svg]:overflow-hidden [&>svg]:block"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        /* Fallback HTML preview while WASM and CJK fonts initialize */
        <div 
          className={clsx(
            `theme-${theme}`,
            ratioClass,
            "w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col transition-all duration-300 ease-in-out"
          )}
          style={{
            fontFamily: getFontFamily(),
          }}
        >
          {theme === 'xiaohongshu' && hasTitle && (
            <div className="w-full py-3.5 px-6 bg-red-500 text-white font-bold text-center text-lg">
              {title}
            </div>
          )}
          
          {theme === 'minimal-dark' && (
            <div className="absolute bottom-6 right-6 w-12 h-[2px] bg-zinc-700" />
          )}

          <div className="p-8 md:p-10 flex flex-col h-full flex-grow">
            {hasTitle && theme !== 'xiaohongshu' && (
              <h2 
                className={clsx(
                  "font-bold mb-6",
                  theme === 'newspaper' ? 'border-b-2 border-black pb-4 text-center text-2xl' : 'text-xl text-center'
                )}
              >
                {title}
              </h2>
            )}
            
            <div 
              className="flex-grow whitespace-pre-wrap break-words"
              style={{
                fontSize: `${config.fontSize}px`,
                lineHeight: config.lineHeight,
                textAlign: config.justify ? 'justify' : 'left',
                textIndent: config.firstLineIndent ? '2em' : '0'
              }}
            >
              {content || '请输入正文内容...'}
            </div>

            {hasFooter && (
              <div className={clsx(
                "mt-8 pt-4 flex items-center justify-between text-xs opacity-80 border-t",
                theme === 'minimal-dark' ? 'border-zinc-800 text-zinc-400' : 'border-zinc-300/60 text-zinc-600'
              )}>
                <div>
                  {hasSource && (
                    <span>
                      {theme === 'literary-paper' ? `摘自《${source}》` : `来源: ${source}`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasAuthor && (
                    <>
                      <span>— {author}</span>
                      {theme === 'literary-paper' && (
                        <span className="w-5 h-5 border border-red-600 text-red-600 inline-flex items-center justify-center rounded-[2px] text-[10px] font-bold">
                          {author.slice(-1)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

