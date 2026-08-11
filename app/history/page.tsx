import { getHistory } from '../lib/feed'
import ArticleCard from '../components/ArticleCard'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日  星期${weekdays[d.getDay()]}`
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10)
}

export default function HistoryPage() {
  const days = getHistory()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)', background: 'rgba(15,15,19,0.85)' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>GAME</span>
              <span className="text-xl font-black tracking-tight text-white">HOT</span>
            </a>
            <a href="/games" className="text-sm font-medium transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>游戏库</a>
            <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>历史</span>
          </div>
          <a href="/" className="text-xs" style={{ color: 'var(--muted)' }}>← 返回今日</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">历史日报</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>共 {days.length} 天记录</p>
        </div>

        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent2), transparent)' }} />

        <div className="flex flex-col gap-12">
          {days.map(day => (
            <section key={day.date}>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-base font-semibold text-white">{formatDate(day.date)}</h2>
                {isToday(day.date) && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,68,68,0.12)', color: 'var(--accent)' }}>今日</span>
                )}
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{day.articles.length} 条</span>
              </div>
              <div className="flex flex-col gap-3">
                {day.articles.map((article, i) => (
                  <ArticleCard key={article.url} article={article} rank={i + 1} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pb-8 text-center text-xs" style={{ color: 'var(--muted)' }}>
          <p>数据每天 18:30 更新 · 由 AI 自动生成</p>
        </div>
      </main>
    </div>
  )
}
