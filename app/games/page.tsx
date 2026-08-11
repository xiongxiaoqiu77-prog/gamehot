import { getGames, getFeed, getGameMeta, toGameSlug } from '../lib/feed'
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
  const meta = getGameMeta(game.name)
  const slug = toGameSlug(game.name)

  return (
    <a
      href={`/games/${slug}`}
      className="group rounded-2xl p-4 border flex gap-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Icon */}
      {meta?.icon ? (
        <img
          src={meta.icon}
          alt={game.name}
          width={52}
          height={52}
          className="rounded-xl shrink-0 object-cover"
          style={{ width: 52, height: 52 }}
        />
      ) : (
        <div
          className="shrink-0 rounded-xl flex items-center justify-center text-xl"
          style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.05)' }}
        >
          🎮
        </div>
      )}

      {/* 右侧信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-semibold text-white text-sm leading-snug group-hover:text-white transition-colors truncate">
            {game.name}
          </h2>
          {game.count > 1 && (
            <span
              className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(255,68,68,0.12)', color: 'var(--accent)' }}
            >
              {game.count} 次
            </span>
          )}
        </div>

        <p className="text-xs mb-2 leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>
          {game.desc || '暂无介绍'}
        </p>

        <div className="flex items-center gap-2">
          <HeatBar score={game.maxScore} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            热度 {game.maxScore}
          </span>
        </div>
      </div>
    </a>
  )
}

export default function GamesPage() {
  const games = getGames()
  const feed = getFeed()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
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
            <h1 className="text-2xl font-bold text-white">游戏库</h1>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>{games.length} 款</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            从历史日报文章中提取，按提及频次排序
          </p>
        </div>

        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent2), transparent)' }} />

        {games.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
            <p className="text-4xl mb-4">🎮</p>
            <p>今日数据更新后将自动显示</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {games.map(g => <GameCard key={g.name} game={g} />)}
          </div>
        )}
      </main>
    </div>
  )
}
