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
      // 策略 1 (推荐规范): 传入 Promise<Blob> 给 ClipboardItem
      // 在用户点击手势当前事件循环同步调用 navigator.clipboard.write，避免异步耗时后丢失激活焦点
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

      // 策略 2: 等待渲染完毕后尝试再次写入
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

      // 策略 3: 终极降级保障
      // 若因浏览器窗口失焦 (Document is not focused) 或权限策略导致剪贴板被拦截，
      // 自动无缝转为下载高清 PNG 文件，不让用户操作落空
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

        setErrorMsg('浏览器安全策略限制了后台写入剪贴板（窗口未聚焦），已为您自动保存下载高清 PNG 文件！')
        setTimeout(() => setErrorMsg(null), 5000)
      } catch (dlErr) {
        setErrorMsg('复制到剪贴板失败，请直接点击左侧「下载高清 PNG」保存图片。')
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="mt-6 border-t border-zinc-800 pt-5">
      {errorMsg && (
        <div className="mb-3 p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-center gap-2 text-xs text-amber-200">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleExportPng}
          disabled={isExporting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm cursor-pointer"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          <span>{isExporting ? '排版生成中...' : '下载高清 PNG'}</span>
        </button>

        <button
          onClick={handleExportSvg}
          disabled={isExporting}
          className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          title="下载矢量 SVG"
        >
          <ImageIcon size={18} />
          <span className="text-xs font-medium hidden sm:inline">SVG</span>
        </button>

        <button
          onClick={handleCopyClipboard}
          disabled={isExporting}
          className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          title="复制到剪贴板"
        >
          {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
          <span className="text-xs font-medium hidden sm:inline">{copied ? '已复制' : '复制'}</span>
        </button>
      </div>

      <div className="mt-2 text-center text-[11px] text-zinc-500">
        基于 Rust + Typst WASM 引擎渲染 · 2x Retina 高清输出 · 自动排版与标点避头尾
      </div>
    </div>
  )
}
