import type { Metadata } from 'next'
import { Inter, Noto_Serif_SC, Noto_Sans_SC } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSerif = Noto_Serif_SC({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-serif' })
const notoSans = Noto_Sans_SC({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'TextCard - 文字作品卡片生成器',
  description: 'Generate beautiful image cards from text using a Rust WASM backend (Typst).',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${notoSerif.variable} ${notoSans.variable} bg-zinc-950 text-zinc-50 min-h-screen font-sans`}>
        {children}
      </body>
    </html>
  )
}
