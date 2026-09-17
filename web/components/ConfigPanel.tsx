'use client'

import React, { useState } from 'react'
import { CardConfig } from './types'
import { SlidersHorizontal, ChevronDown, ChevronUp, AlignLeft, AlignJustify, AlignRight, RectangleHorizontal, RectangleVertical, Square, SplitSquareHorizontal } from 'lucide-react'
import clsx from 'clsx'

interface ConfigPanelProps {
  config: CardConfig
  setConfig: React.Dispatch<React.SetStateAction<CardConfig>>
}

export default function ConfigPanel({ config, setConfig }: ConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateConfig = (key: keyof CardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
      {/* Collapsible Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-zinc-950/30 hover:bg-zinc-900/50 transition-colors focus-ring"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-zinc-800/80 rounded-md text-zinc-300 shadow-inner">
            <SlidersHorizontal size={16} />
          </div>
          <span className="text-sm font-semibold text-zinc-200 tracking-wide">排版调节</span>
        </div>
        <div className="text-zinc-500">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded Content */}
      <div className={clsx(
        "transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <div className="p-5 space-y-7 border-t border-zinc-800/50">
          
          {/* Section: Typography */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">排版 Typography</h4>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">字体族</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'system', name: '系统默认', sample: 'Aa', fontClass: 'font-sans' },
                  { id: 'serif', name: '思源宋体', sample: '文', fontClass: 'font-serif' },
                  { id: 'sans', name: '思源黑体', sample: 'A', fontClass: 'font-sans' },
                  { id: 'kai', name: '霞鹜文楷', sample: '楷', fontClass: 'font-serif' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateConfig('fontFamily', f.id)}
                    className={clsx(
                      "flex items-center gap-3 p-2 rounded-lg border transition-all text-left",
                      config.fontFamily === f.id
                        ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.05)]"
                        : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
                    )}
                  >
                    <div className={clsx(
                      "w-7 h-7 rounded flex items-center justify-center text-sm shadow-inner bg-zinc-900 border border-zinc-800/80",
                      f.fontClass,
                      config.fontFamily === f.id ? "text-indigo-300 border-indigo-500/30" : "text-zinc-400"
                    )}>
                      {f.sample}
                    </div>
                    <span className={clsx(
                      "text-xs font-medium",
                      config.fontFamily === f.id ? "text-indigo-100" : "text-zinc-300"
                    )}>
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium text-zinc-300">字号大小</label>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-1.5 rounded">{config.fontSize}pt</span>
              </div>
              <input 
                type="range" 
                min="14" 
                max="24" 
                step="1" 
                value={config.fontSize} 
                onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                className="w-full accent-indigo-500 focus-ring"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium text-zinc-300">行高</label>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-1.5 rounded">{config.lineHeight}</span>
              </div>
              <input 
                type="range" 
                min="1.4" 
                max="2.4" 
                step="0.1" 
                value={config.lineHeight} 
                onChange={(e) => updateConfig('lineHeight', parseFloat(e.target.value))}
                className="w-full accent-indigo-500 focus-ring"
              />
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent"></div>

          {/* Section: Layout */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">布局 Layout</h4>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">卡片比例</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1:1', icon: <Square size={14} />, label: '1:1' },
                  { id: '3:4', icon: <RectangleVertical size={14} />, label: '3:4' },
                  { id: '16:9', icon: <RectangleHorizontal size={14} />, label: '16:9' },
                  { id: 'auto', icon: <SplitSquareHorizontal size={14} />, label: '自适应' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => updateConfig('aspectRatio', ratio.id)}
                    className={clsx(
                      "flex flex-col items-center justify-center py-2.5 gap-1.5 rounded-lg border transition-all",
                      config.aspectRatio === ratio.id 
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                    )}
                  >
                    {ratio.icon}
                    <span className="text-[10px] font-medium">{ratio.label}</span>
                  </button>
                ))}
              </div>

              {/* Auto Mode Configuration (unchanged logic, refined UI) */}
              {config.aspectRatio === 'auto' && (
                <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-4 mt-3 shadow-inner">
                  <div>
                    <div className="text-xs font-medium text-zinc-300 mb-2 flex items-center justify-between">
                      <span>自适应调节维度</span>
                      <span className="text-[10px] text-emerald-400 font-normal px-1.5 py-0.5 bg-emerald-500/10 rounded">正文不截断 · 完整排版</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateConfig('autoMode', 'fixed-width')}
                        className={clsx(
                          "py-2 px-2 text-[11px] rounded-md border transition-all font-medium",
                          config.autoMode !== 'fixed-height'
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                        )}
                      >
                        定宽 · 高度自适应
                      </button>
                      <button
                        type="button"
                        onClick={() => updateConfig('autoMode', 'fixed-height')}
                        className={clsx(
                          "py-2 px-2 text-[11px] rounded-md border transition-all font-medium",
                          config.autoMode === 'fixed-height'
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                        )}
                      >
                        定高 · 宽度自适应
                      </button>
                    </div>
                  </div>

                  {config.autoMode !== 'fixed-height' ? (
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs text-zinc-300">调整卡片宽度</label>
                        <span className="text-xs text-emerald-400 font-mono font-medium bg-emerald-500/10 px-1.5 rounded">{config.customWidth || 1080}px</span>
                      </div>
                      <input
                        type="range"
                        min="480"
                        max="1600"
                        step="20"
                        value={config.customWidth || 1080}
                        onChange={(e) => updateConfig('customWidth', parseInt(e.target.value))}
                        className="w-full accent-emerald-500 focus-ring"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 mt-1.5 px-1">
                        <button type="button" className="hover:text-zinc-300 transition-colors" onClick={() => updateConfig('customWidth', 640)}>小巧 640</button>
                        <button type="button" className="hover:text-zinc-300 transition-colors" onClick={() => updateConfig('customWidth', 800)}>适中 800</button>
                        <button type="button" className="hover:text-zinc-300 transition-colors font-medium text-zinc-400" onClick={() => updateConfig('customWidth', 1080)}>标准 1080</button>
                        <button type="button" className="hover:text-zinc-300 transition-colors" onClick={() => updateConfig('customWidth', 1440)}>宽屏 1440</button>
                      </div>
                      <p className="text-[11px] text-zinc-400/80 mt-2 leading-relaxed bg-zinc-900/80 p-2 rounded border border-zinc-800/50 flex items-start gap-1.5">
                        <span className="text-emerald-500/70 text-[10px]">💡</span> 
                        高度随正文长短自动向下延展，文字绝不截断。
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs text-zinc-300">调整卡片高度</label>
                        <span className="text-xs text-emerald-400 font-mono font-medium bg-emerald-500/10 px-1.5 rounded">{config.customHeight || 1440}px</span>
                      </div>
                      <input
                        type="range"
                        min="600"
                        max="2400"
                        step="20"
                        value={config.customHeight || 1440}
                        onChange={(e) => updateConfig('customHeight', parseInt(e.target.value))}
                        className="w-full accent-emerald-500 focus-ring"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 mt-1.5 px-1">
                        <button type="button" className="hover:text-zinc-300 transition-colors" onClick={() => updateConfig('customHeight', 800)}>紧凑 800</button>
                        <button type="button" className="hover:text-zinc-300 transition-colors" onClick={() => updateConfig('customHeight', 1080)}>标准 1080</button>
                        <button type="button" className="hover:text-zinc-300 transition-colors font-medium text-zinc-400" onClick={() => updateConfig('customHeight', 1440)}>长图 1440</button>
                        <button type="button" className="hover:text-zinc-300 transition-colors" onClick={() => updateConfig('customHeight', 1920)}>超长 1920</button>
                      </div>
                      <p className="text-[11px] text-zinc-400/80 mt-2 leading-relaxed bg-zinc-900/80 p-2 rounded border border-zinc-800/50 flex items-start gap-1.5">
                        <span className="text-emerald-500/70 text-[10px]">💡</span> 
                        宽度随指定高度自动扩展排版，文字绝不截断。
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-lg p-3 space-y-3">
              {[
                { key: 'showTitle', label: '显示标题' },
                { key: 'showAuthor', label: '显示作者' },
                { key: 'showSource', label: '显示出处 / 专栏' },
                { key: 'firstLineIndent', label: '首行缩进' },
                { key: 'justify', label: '两端对齐' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={config[key as keyof CardConfig] as boolean}
                      onChange={(e) => updateConfig(key as keyof CardConfig, e.target.checked)}
                    />
                    <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500 group-hover:after:scale-90 shadow-inner"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
