import { getGames, getFeed } from '../lib/feed'
import type { GameEntry } from '../lib/feed'

function HeatBar({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="w-1 h-1 rounded-full" style={{
          background: i < score ? `hsl(${10 + i * 8}, 90%, 60%)` : 'rgba(255,255,255,0.08)',
        }} />
      ))}
    </div>
  )
}

function GameCard({ game }: { game: GameEntry }) {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* 游戏名 + 提及次数 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="font-semibold text-white text-base leading-snug">{game.name}</h2>
        {game.count > 1 && (
          <span
            className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(255,68,68,0.12)', color: 'var(--accent)' }}
          >
            {game.count} 次提及
          </span>
        )}
      </div>

      {/* 一句话介绍 */}
      {game.desc && (
        <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
          {game.desc}
        </p>
      )}

      {/* 热度 */}
      <div className="flex items-center gap-2 mb-4">
        <HeatBar score={game.maxScore} />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          热度 {game.maxScore}
        </span>
      </div>

      {/* 关联文章 */}
      <div className="flex flex-col gap-2">
        {game.articles.map(a => {
          const isWeChat = a.source.startsWith('微信')
          const href = (!isWeChat && a.id) ? `/article/${a.id}` : a.url
          return (
            <a
              key={a.url}
              href={href}
              target={isWeChat ? '_blank' : '_self'}
              rel={isWeChat ? 'noopener noreferrer' : undefined}
              className="flex items-start gap-2 group"
            >
              <span className="text-xs mt-0.5 shrink-0" style={{ color: 'var(--accent2)' }}>→</span>
              <span
                className="text-xs leading-relaxed group-hover:text-white transition-colors"
                style={{ color: '#a0a0c0' }}
              >
                {a.title}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default function GamesPage() {
  const games = getGames()
  const feed = getFeed()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* 顶栏 */}
      <header className="sticky top-0 z-10 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)', background: 'rgba(15,15,19,0.85)' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>GAME</span>
              <span className="text-xl font-black tracking-tight text-white">HOT</span>
            </a>
            <span className="text-sm font-medium text-white">游戏库</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>更新于 {feed.updated}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-baseline gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">提及游戏</h1>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>{games.length} 款</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            从近期日报文章中提取，按提及频次排序
          </p>
        </div>

        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent2), transparent)' }} />

        {games.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
            <p className="text-4xl mb-4">🎮</p>
            <p>今日数据更新后将自动显示</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {games.map(g => <GameCard key={g.name} game={g} />)}
          </div>
        )}
      </main>
    </div>
  )
}
