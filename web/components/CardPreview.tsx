'use client'

import React from 'react'
import { CardConfig, Theme } from './types'
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
  // Determine aspect ratio class
  let ratioClass = ''
  if (config.aspectRatio === '1:1') ratioClass = 'aspect-square'
  else if (config.aspectRatio === '3:4') ratioClass = 'aspect-[3/4]'
  else if (config.aspectRatio === '16:9') ratioClass = 'aspect-video'
  else ratioClass = 'min-h-[400px]' // auto

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

  return (
    <div className="w-full bg-zinc-950/50 rounded-xl border border-zinc-800 p-4 md:p-8 flex items-center justify-center overflow-hidden min-h-[400px]">
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
        {/* Render theme specific decorative elements */}
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
    </div>
  )
}
