'use client'

import React from 'react'
import { CardConfig } from './types'

interface ConfigPanelProps {
  config: CardConfig
  setConfig: React.Dispatch<React.SetStateAction<CardConfig>>
}

export default function ConfigPanel({ config, setConfig }: ConfigPanelProps) {
  const updateConfig = (key: keyof CardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">字体</label>
        <select 
          className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 outline-none focus:border-indigo-500"
          value={config.fontFamily}
          onChange={(e) => updateConfig('fontFamily', e.target.value)}
        >
          <option value="system">系统默认</option>
          <option value="serif">思源宋体</option>
          <option value="sans">思源黑体</option>
          <option value="kai">霞鹜文楷</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-zinc-300">字号</label>
          <span className="text-xs text-zinc-500">{config.fontSize}pt</span>
        </div>
        <input 
          type="range" 
          min="14" 
          max="24" 
          step="1" 
          value={config.fontSize} 
          onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
          className="w-full accent-indigo-500"
        />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-zinc-300">行高</label>
          <span className="text-xs text-zinc-500">{config.lineHeight}</span>
        </div>
        <input 
          type="range" 
          min="1.4" 
          max="2.4" 
          step="0.1" 
          value={config.lineHeight} 
          onChange={(e) => updateConfig('lineHeight', parseFloat(e.target.value))}
          className="w-full accent-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">比例</label>
        <div className="grid grid-cols-4 gap-2">
          {['1:1', '3:4', '16:9', 'auto'].map((ratio) => (
            <button
              key={ratio}
              onClick={() => updateConfig('aspectRatio', ratio)}
              className={`py-1.5 text-xs rounded-md border ${
                config.aspectRatio === ratio 
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                  : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {ratio === 'auto' ? '自适应' : ratio}
            </button>
          ))}
        </div>

        {config.aspectRatio === 'auto' && (
          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg space-y-3 mt-3">
            <div>
              <div className="text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>自适应调节维度</span>
                <span className="text-[10px] text-emerald-400 font-normal">正文不截断 · 完整排版</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateConfig('autoMode', 'fixed-width')}
                  className={`py-1.5 px-2 text-xs rounded border transition-all ${
                    config.autoMode !== 'fixed-height'
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 font-medium shadow-sm'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  定宽 · 高度自适应
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig('autoMode', 'fixed-height')}
                  className={`py-1.5 px-2 text-xs rounded border transition-all ${
                    config.autoMode === 'fixed-height'
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 font-medium shadow-sm'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  定高 · 宽度自适应
                </button>
              </div>
            </div>

            {config.autoMode !== 'fixed-height' ? (
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs text-zinc-300">调整卡片宽度</label>
                  <span className="text-xs text-indigo-400 font-mono font-medium">{config.customWidth || 1080}px</span>
                </div>
                <input
                  type="range"
                  min="480"
                  max="1600"
                  step="20"
                  value={config.customWidth || 1080}
                  onChange={(e) => updateConfig('customWidth', parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <button type="button" className="hover:text-zinc-300" onClick={() => updateConfig('customWidth', 640)}>小巧 640</button>
                  <button type="button" className="hover:text-zinc-300" onClick={() => updateConfig('customWidth', 800)}>适中 800</button>
                  <button type="button" className="hover:text-zinc-300 font-medium text-zinc-400" onClick={() => updateConfig('customWidth', 1080)}>标准 1080</button>
                  <button type="button" className="hover:text-zinc-300" onClick={() => updateConfig('customWidth', 1440)}>宽屏 1440</button>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed bg-zinc-900/60 p-1.5 rounded">
                  💡 高度随正文长短自动向下延展，文字绝不截断。
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs text-zinc-300">调整卡片高度</label>
                  <span className="text-xs text-indigo-400 font-mono font-medium">{config.customHeight || 1440}px</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="2400"
                  step="20"
                  value={config.customHeight || 1440}
                  onChange={(e) => updateConfig('customHeight', parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <button type="button" className="hover:text-zinc-300" onClick={() => updateConfig('customHeight', 800)}>紧凑 800</button>
                  <button type="button" className="hover:text-zinc-300" onClick={() => updateConfig('customHeight', 1080)}>标准 1080</button>
                  <button type="button" className="hover:text-zinc-300 font-medium text-zinc-400" onClick={() => updateConfig('customHeight', 1440)}>长图 1440</button>
                  <button type="button" className="hover:text-zinc-300" onClick={() => updateConfig('customHeight', 1920)}>超长 1920</button>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed bg-zinc-900/60 p-1.5 rounded">
                  💡 宽度随指定高度自动扩展排版，文字绝不截断。
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2 border-t border-zinc-800">
        {[
          { key: 'showTitle', label: '显示标题' },
          { key: 'showAuthor', label: '显示作者' },
          { key: 'showSource', label: '显示出处 / 专栏' },
          { key: 'firstLineIndent', label: '首行缩进' },
          { key: 'justify', label: '两端对齐' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={config[key as keyof CardConfig] as boolean}
                onChange={(e) => updateConfig(key as keyof CardConfig, e.target.checked)}
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
