import { getFeed } from './lib/feed'
import ArticleCard from './components/ArticleCard'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${y} 年 ${m} 月 ${day} 日  星期${weekdays[d.getDay()]}`
}

export default async function Home() {
  const feed = await getFeed()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* header */}
      <header className="sticky top-0 z-10 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)', background: 'rgba(15,15,19,0.85)' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>GAME</span>
            <span className="text-xl font-black tracking-tight text-white">HOT</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold ml-1" style={{ background: 'rgba(255,68,68,0.15)', color: 'var(--accent)' }}>每日热点</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>{formatDate(feed.updated)}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* hero */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">今日游戏热点</h1>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>{feed.articles.length} 条精选</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            AI 从微信公众号、行业媒体、播客中筛选，按热度排序
          </p>
        </div>

        {/* divider line */}
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent2), transparent)' }} />

        {/* articles */}
        <div className="flex flex-col gap-4">
          {feed.articles.map((article, i) => (
            <ArticleCard key={article.url} article={article} rank={i + 1} />
          ))}
        </div>

        {/* footer */}
        <div className="mt-16 pb-8 text-center text-xs" style={{ color: 'var(--muted)' }}>
          <p>数据每天 18:30 更新 · 由 AI 自动生成</p>
        </div>
      </main>
    </div>
  )
}
