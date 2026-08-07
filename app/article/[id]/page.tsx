import { notFound } from 'next/navigation'
import { getFeed, getArticleById } from '../../lib/feed'
import type { Game } from '../../types'

export function generateStaticParams() {
  return getFeed().articles
    .filter(a => a.id)
    .map(a => ({ id: a.id }))
}

function sourceIcon(source: string) {
  if (source.startsWith('微信')) return '💬'
  if (source.includes('播客') || source.includes('小宇宙')) return '🎙'
  return '📰'
}

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
          background: i < score ? `hsl(${10 + i * 8}, 90%, 60%)` : 'rgba(255,255,255,0.1)',
        }} />
      ))}
    </div>
  )
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = getArticleById(id)
  if (!article) notFound()

  const pub = new Date(article.published_at)
  const dateStr = `${pub.getFullYear()}年${pub.getMonth() + 1}月${pub.getDate()}日 ${pub.getHours().toString().padStart(2, '0')}:${pub.getMinutes().toString().padStart(2, '0')}`
  const isWeChat = article.source.startsWith('微信')
  const hasTranslation = !isWeChat && !!article.translated_content

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* 顶栏 */}
      <header className="sticky top-0 z-10 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)', background: 'rgba(15,15,19,0.85)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>GAME</span>
            <span className="text-xl font-black tracking-tight text-white">HOT</span>
          </a>
          <a href="/" className="text-sm" style={{ color: 'var(--muted)' }}>← 返回列表</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 分类 + 来源 */}
        <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--muted)' }}>
          {article.category && (
            <span className="px-2 py-0.5 rounded-full border text-xs" style={{ borderColor: 'rgba(255,68,68,0.2)', color: '#ff8c8c', background: 'rgba(255,68,68,0.08)' }}>
              {article.category}
            </span>
          )}
          <span>{sourceIcon(article.source)} {article.source.replace('微信-', '')}</span>
          <span>·</span>
          <span>{dateStr}</span>
        </div>

        {/* 标题 */}
        <h1 className="text-2xl font-bold text-white leading-snug mb-6">{article.title}</h1>

        {/* 热度 */}
        <div className="flex items-center gap-3 mb-8">
          <ScoreDots score={article.score} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>热度 {article.score}</span>
        </div>

        {/* AI 导读 */}
        {article.summary && (
          <section className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--accent)' }}>AI 导读</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#c0c0d8' }}>{article.summary}</p>
          </section>
        )}

        {/* 提及游戏 */}
        {article.games?.length > 0 && (
          <section className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'var(--accent2)' }}>提及游戏</h2>
            <div className="flex flex-col gap-3">
              {article.games.map((g: Game) => (
                <div key={g.name} className="flex items-baseline gap-3">
                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(255,140,66,0.12)', color: 'var(--accent2)' }}>
                    🎮 {g.name}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--muted)' }}>{g.desc}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 翻译正文（仅国外文章） */}
        {hasTranslation && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>译文全文</h2>
            <div className="text-sm leading-8 whitespace-pre-wrap" style={{ color: '#b0b0c8' }}>
              {article.translated_content}
            </div>
          </section>
        )}

        {/* 查看原文 */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: 'rgba(255,68,68,0.12)', color: 'var(--accent)', border: '1px solid rgba(255,68,68,0.2)' }}
        >
          查看原文 →
        </a>
      </main>
    </div>
  )
}
