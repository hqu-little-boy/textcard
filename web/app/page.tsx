import Editor from '@/components/Editor'
import { Zap, Monitor, Feather } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-10 xl:p-12 relative z-10">
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 pb-1">
              TextCard
            </h1>
          </div>
          
          <p className="text-zinc-400 text-lg mb-6 font-medium tracking-wide">
            将文字变成精致的社交卡片
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Badge icon={<Feather size={14} />} text="Typst 排版引擎" />
            <Badge icon={<Monitor size={14} />} text="Retina 高清输出" />
            <Badge icon={<Zap size={14} />} text="矢量 SVG 导出" />
          </div>
        </header>

        {/* Subtle Animated Divider */}
        <div className="h-[1px] w-full mb-10 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        
        <Editor />
      </div>
    </main>
  )
}

function Badge({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md shadow-sm text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:border-zinc-700">
      <span className="text-indigo-400">{icon}</span>
      {text}
    </div>
  )
}
