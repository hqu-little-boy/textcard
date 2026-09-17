'use client'

import React from 'react'
import { Theme } from './types'
import clsx from 'clsx'
import { Palette, CheckCircle2 } from 'lucide-react'

interface ThemeSelectorProps {
  currentTheme: Theme
  onSelect: (theme: Theme) => void
}

const themes: { id: Theme; name: string; desc: string; colors: string[]; sampleText: string; sampleBg: string; sampleColor: string; sampleBorder?: string }[] = [
  { id: 'literary-paper', name: '文学纸张', desc: '经典传统，温润如玉', colors: ['#f4f1ea', '#333333'], sampleText: '文学\n纸张', sampleBg: '#f4f1ea', sampleColor: '#333333' },
  { id: 'xiaohongshu', name: '小红书', desc: '活泼明快，现代感', colors: ['#ffffff', '#ff2442'], sampleText: '小红书\n风格', sampleBg: '#ffffff', sampleColor: '#222222' },
  { id: 'minimal-dark', name: '极简暗黑', desc: '沉稳内敛，极简风格', colors: ['#1a1a1a', '#e5e5e5'], sampleText: '极简\n暗黑', sampleBg: '#1a1a1a', sampleColor: '#e5e5e5' },
  { id: 'newspaper', name: '复古报纸', desc: '怀旧岁月，排版感', colors: ['#e8e3d3', '#1a1a1a'], sampleText: '复古\n报纸', sampleBg: '#e8e3d3', sampleColor: '#1a1a1a', sampleBorder: '2px solid #1a1a1a' },
]

export default function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-zinc-200 tracking-wide">选择卡片风格</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {themes.map((theme) => {
          const isActive = currentTheme === theme.id;
          
          return (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              className={clsx(
                "group relative flex flex-col p-3 rounded-xl border text-left transition-all duration-300 ease-out",
                isActive 
                  ? "border-indigo-500/50 bg-zinc-900/80 shadow-[0_0_15px_rgba(99,102,241,0.15)] -translate-y-1" 
                  : "border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/60 hover:-translate-y-0.5 hover:shadow-lg"
              )}
            >
              {isActive && (
                <div className="absolute top-2 right-2 z-10 text-indigo-400">
                  <CheckCircle2 size={16} className="fill-indigo-500/20" />
                </div>
              )}
              
              {/* Mini Preview Card */}
              <div 
                className="w-full h-24 rounded-lg mb-3 flex flex-col items-center justify-center relative overflow-hidden shadow-inner transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ 
                  backgroundColor: theme.sampleBg, 
                  color: theme.sampleColor,
                  border: theme.sampleBorder || '1px solid rgba(120,120,120,0.2)'
                }}
              >
                {theme.id === 'xiaohongshu' && (
                  <div className="absolute top-0 w-full h-4 bg-red-500"></div>
                )}
                {theme.id === 'literary-paper' && (
                  <div className="absolute bottom-2 right-2 w-3 h-3 border border-red-600 text-[6px] text-red-600 flex items-center justify-center leading-none rounded-sm">印</div>
                )}
                {theme.id === 'minimal-dark' && (
                  <div className="absolute bottom-2 right-2 w-6 h-[1px] bg-zinc-600"></div>
                )}
                <div 
                  className={clsx(
                    "text-xs font-medium text-center leading-relaxed whitespace-pre-wrap",
                    theme.id === 'literary-paper' || theme.id === 'newspaper' ? 'font-serif' : 'font-sans'
                  )}
                >
                  {theme.sampleText}
                </div>
              </div>
              
              <div className="mt-auto">
                <span className={clsx(
                  "block font-medium text-sm mb-0.5 transition-colors",
                  isActive ? "text-indigo-100" : "text-zinc-200 group-hover:text-zinc-100"
                )}>
                  {theme.name}
                </span>
                <span className="block text-[11px] text-zinc-500 line-clamp-1">{theme.desc}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
