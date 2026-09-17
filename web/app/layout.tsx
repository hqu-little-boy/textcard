import type { Metadata } from 'next'
import { Inter, Noto_Serif_SC, Noto_Sans_SC } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSerif = Noto_Serif_SC({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-serif' })
const notoSans = Noto_Sans_SC({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'TextCard - 将文字变成精致的社交卡片',
  description: 'Generate beautiful image cards from text using a Rust WASM backend (Typst).',
  openGraph: {
    title: 'TextCard - 将文字变成精致的社交卡片',
    description: 'Premium text-to-image card generator powered by Typst WASM',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${notoSerif.variable} ${notoSans.variable} bg-zinc-950 text-zinc-50 min-h-screen font-sans antialiased relative overflow-x-hidden`}>
        {/* Animated Gradient Mesh Background */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950"></div>
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
        <div className="fixed inset-0 z-[-1] noise-overlay"></div>
        
        {children}
      </body>
    </html>
  )
}
