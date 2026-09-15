'use client'

import React from 'react'
import { Theme } from './types'
import clsx from 'clsx'

interface ThemeSelectorProps {
  currentTheme: Theme
  onSelect: (theme: Theme) => void
}

const themes: { id: Theme; name: string; desc: string; colors: string[] }[] = [
  { id: 'literary-paper', name: '文学纸张', desc: '经典传统，温润如玉', colors: ['#f4f1ea', '#333333'] },
  { id: 'xiaohongshu', name: '小红书', desc: '活泼明快，现代感', colors: ['#ffffff', '#ff2442'] },
  { id: 'minimal-dark', name: '极简暗黑', desc: '沉稳内敛，极简风格', colors: ['#1a1a1a', '#e5e5e5'] },
  { id: 'newspaper', name: '复古报纸', desc: '怀旧岁月，排版感', colors: ['#e8e3d3', '#1a1a1a'] },
]

export default function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-zinc-300 mb-3">主题风格</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme.id)}
            className={clsx(
              "flex flex-col items-start min-w-[140px] p-3 rounded-lg border text-left transition-all",
              currentTheme === theme.id 
                ? "border-indigo-500 bg-zinc-800/80" 
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/50"
            )}
          >
            <div 
              className="w-full h-16 rounded-md mb-3 flex relative overflow-hidden border border-zinc-700"
              style={{ backgroundColor: theme.colors[0] }}
            >
              <div 
                className="absolute right-0 bottom-0 w-1/3 h-full opacity-50"
                style={{ backgroundColor: theme.colors[1] }}
              />
            </div>
            <span className="font-medium text-zinc-100 text-sm mb-1">{theme.name}</span>
            <span className="text-xs text-zinc-500">{theme.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
