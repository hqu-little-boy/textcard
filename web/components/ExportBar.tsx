'use client'

import React, { useState } from 'react'
import { Download, Image as ImageIcon, Copy, Loader2, Check, AlertCircle } from 'lucide-react'
import { CardConfig, Theme } from './types'
import { renderCardToPng, renderCardToSvg } from '@/lib/textcard-wasm'

interface ExportBarProps {
  content: string
  title: string
  author: string
  source?: string
  theme: Theme
  config: CardConfig
}

export default function ExportBar({ content, title, author, source = '', theme, config }: ExportBarProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const getFileName = (ext: string) => {
    const safeTitle = (title || 'card').replace(/[^\w\u4e00-\u9fa5]/g, '_').slice(0, 20)
    return `${safeTitle}_${theme}.${ext}`
  }

  const handleExportPng = async () => {
    setIsExporting(true)
    setErrorMsg(null)
    try {
      const blob = await renderCardToPng(content, title, author, source, theme, config)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getFileName('png')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('PNG export failed:', err)
      setErrorMsg(err.message || '导出 PNG 失败，请检查排版')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSvg = async () => {
    setIsExporting(true)
    setErrorMsg(null)
    try {
      const svg = await renderCardToSvg(content, title, author, source, theme, config)
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getFileName('svg')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('SVG export failed:', err)
      setErrorMsg(err.message || '导出 SVG 失败')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyClipboard = async () => {
    setIsExporting(true)
    setErrorMsg(null)
    if (typeof window !== 'undefined') {
      window.focus()
    }

    const pngPromise = renderCardToPng(content, title, author, source, theme, config)

    try {
      // Strategy 1: Pass Promise<Blob> to ClipboardItem
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        try {
          const item = new ClipboardItem({
            'image/png': pngPromise,
          })
          await navigator.clipboard.write([item])
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
          return
        } catch (promiseErr) {
          console.warn('ClipboardItem Promise write failed, trying resolved blob...', promiseErr)
        }
      }

      // Strategy 2: Await render and try writing again
      const blob = await pngPromise
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        if (typeof window !== 'undefined') window.focus()
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
        return
      }

      throw new Error('当前浏览器不支持图片复制到剪贴板')
    } catch (err: any) {
      console.error('Clipboard copy failed:', err)

      // Strategy 3: Fallback to direct download
      try {
        const blob = await pngPromise
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = getFileName('png')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setErrorMsg('浏览器安全策略限制了剪贴板写入，已为您自动保存高清 PNG 文件！')
        setTimeout(() => setErrorMsg(null), 5000)
      } catch (dlErr) {
        setErrorMsg('复制到剪贴板失败，请直接点击「下载高清 PNG」保存图片。')
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="glass-panel p-4 md:p-6 rounded-2xl shadow-xl flex flex-col gap-4">
      {errorMsg && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center gap-2 text-xs text-amber-200 backdrop-blur-md shadow-sm">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleExportPng}
          disabled={isExporting}
          className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white py-3.5 px-6 rounded-xl flex items-center justify-center gap-2.5 font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
        >
          {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} className="group-hover:scale-110 transition-transform" />}
          <span className="tracking-wide">{isExporting ? '排版生成中...' : '下载高清 PNG'}</span>
        </button>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <button
            onClick={handleCopyClipboard}
            disabled={isExporting}
            className="flex-1 sm:flex-none px-6 py-3.5 bg-zinc-800/80 hover:bg-zinc-700/80 disabled:opacity-50 text-zinc-200 border border-zinc-700/50 rounded-xl flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer group backdrop-blur-md"
            title="复制图片到剪贴板"
          >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-zinc-400 group-hover:text-zinc-200 transition-colors" />}
            <span className="text-sm font-medium">{copied ? '已复制' : '复制图片'}</span>
          </button>
          
          <button
            onClick={handleExportSvg}
            disabled={isExporting}
            className="px-4 py-3.5 bg-zinc-800/80 hover:bg-zinc-700/80 disabled:opacity-50 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer backdrop-blur-md"
            title="下载矢量 SVG"
          >
            <ImageIcon size={20} />
          </button>
        </div>
      </div>

      <div className="text-center text-[11px] text-zinc-500/80 font-medium tracking-wide">
        基于 Rust + Typst WASM 引擎渲染 <span className="mx-1.5 opacity-50">·</span> 2x Retina 高清输出 <span className="mx-1.5 opacity-50">·</span> 自动排版与标点避头尾
      </div>
    </div>
  )
}
