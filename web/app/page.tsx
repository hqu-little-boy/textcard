import Editor from '@/components/Editor'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-7xl">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight mb-2">TextCard</h1>
          <p className="text-zinc-400 text-lg">文字作品卡片生成器</p>
        </header>
        
        <Editor />
      </div>
    </main>
  )
}
