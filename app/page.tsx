import { getFeed, getRealtimeFeed, getHistory, getGames, getAllGamesMeta } from './lib/feed'
import MainTabs from './components/MainTabs'

export default function Home() {
  const feed         = getFeed()
  const realtimeFeed = getRealtimeFeed()
  const historyDays  = getHistory()
  const games        = getGames()
  const gamesMeta    = getAllGamesMeta()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-md border-b"
              style={{ borderColor: 'var(--border)', background: 'rgba(15,15,19,0.85)' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>GAME</span>
            <span className="text-xl font-black tracking-tight text-white">HOT</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {realtimeFeed.updated_at
              ? `更新于 ${new Date(realtimeFeed.updated_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
              : feed.updated}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <MainTabs
          feed={feed}
          realtimeFeed={realtimeFeed}
          historyDays={historyDays}
          games={games}
          gamesMeta={gamesMeta as Record<string, { icon?: string } | null>}
        />
      </main>
    </div>
  )
}
