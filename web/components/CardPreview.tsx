'use client'

import React from 'react'
import { CardConfig, Theme } from './types'
import clsx from 'clsx'

interface CardPreviewProps {
  content: string
  title: string
  author: string
  theme: Theme
  config: CardConfig
}

export default function CardPreview({ content, title, author, theme, config }: CardPreviewProps) {
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
        {theme === 'literary-paper' && (
          <div className="absolute top-8 right-8 w-8 h-8 border-2 border-red-600 text-red-600 flex items-center justify-center rounded-sm opacity-80 transform rotate-12">
            <span className="text-xs font-bold leading-none">印</span>
          </div>
        )}
        
        {theme === 'xiaohongshu' && (
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600" />
        )}
        
        {theme === 'minimal-dark' && (
          <div className="absolute bottom-6 right-6 w-12 h-[2px] bg-zinc-700" />
        )}

        <div className="p-8 md:p-10 flex flex-col h-full flex-grow">
          {config.showTitle && title && (
            <h2 
              className={clsx(
                "font-bold mb-6",
                theme === 'xiaohongshu' ? 'text-2xl text-center' : 'text-xl',
                theme === 'newspaper' ? 'border-b-2 border-black pb-4 text-center' : ''
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

          {config.showAuthor && author && (
            <div className={clsx(
              "mt-8 text-right opacity-80",
              theme === 'literary-paper' ? 'italic' : ''
            )}>
              <span className="text-sm">— {author}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
