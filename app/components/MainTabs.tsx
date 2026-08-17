'use client'
import { useState, useEffect, useCallback } from 'react'
import type { RealtimeFeed } from '../types'
import type { GameEntry } from '../lib/feed'

const REALTIME_URL = 'https://raw.githubusercontent.com/xiongxiaoqiu77-prog/gamehot-data/main/realtime-feed.json'

// ── 工具 ──────────────────────────────────────────────────────────────────────

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const CATEGORY_COLORS: Record<string, string> = {
  '深度拆解': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  '行业资讯': 'bg-green-500/10 text-green-300 border-green-500/20',
  '泛游戏':   'bg-white/5 text-white/40 border-white/10',
}

function sourceIcon(source: string) {
  if (source.startsWith('微信')) return '💬'
  if (source.includes('播客') || source.includes('小宇宙')) return '🎙'
  return '📰'
}

function groupByDate(articles: RealtimeFeed['articles']) {
  const map = new Map<string, typeof articles>()
  for (const a of articles) {
    const d = a.published_at ? a.published_at.slice(0, 10) : a.fetched_at.slice(0, 10)
    if (!map.has(d)) map.set(d, [])
    map.get(d)!.push(a)
  }
  map.forEach(v => v.sort((a, b) => {
    const ta = a.published_at || a.fetched_at
    const tb = b.published_at || b.fetched_at
    return tb.localeCompare(ta)
  }))
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

// ── 投票 ──────────────────────────────────────────────────────────────────────

function useVotes() {
  const [votes, setVotes] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem('article-votes')
      if (stored) setVotes(JSON.parse(stored))
    } catch {}
  }, [])

  const vote = useCallback((id: string) => {
    setVotes(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 }
      try { localStorage.setItem('article-votes', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  return { votes, vote }
}

// ── 文章卡片（时间线用）──────────────────────────────────────────────────────

function TimelineCard({
  a, isLast, votes, onVote,
}: {
  a: RealtimeFeed['articles'][number]
  isLast: boolean
  votes: Record<string, number>
  onVote: (id: string) => void
}) {
  const pub = a.published_at ? new Date(a.published_at) : new Date(a.fetched_at)
  const timeStr = `${pub.getHours().toString().padStart(2, '0')}:${pub.getMinutes().toString().padStart(2, '0')}`
  const catColor = CATEGORY_COLORS[a.category] ?? 'bg-white/5 text-white/40 border-white/10'
  const userVotes = votes[a.id] || 0

  return (
    <div className="flex gap-4">
      {/* 时间轴 */}
      <div className="flex flex-col items-center" style={{ width: 44, minWidth: 44 }}>
        <span className="text-xs font-mono leading-none mt-1" style={{ color: 'var(--muted)' }}>{timeStr}</span>
        <div className="w-px flex-1 mt-1.5" style={{ background: isLast ? 'transparent' : 'var(--border)', minHeight: 16 }} />
      </div>

      {/* 卡片 */}
      <div className="flex-1 mb-2 min-w-0">
        <a
          href={`/realtime?id=${a.id}`}
          className="group block rounded-xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{sourceIcon(a.source)}</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{a.source.replace('微信-', '')}</span>
            </div>
            {a.category && (
              <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${catColor}`}>{a.category}</span>
            )}
          </div>
          <h3 className="text-sm font-medium leading-snug mb-1.5 group-hover:text-white transition-colors" style={{ color: '#d8d8e8' }}>
            {a.title}
          </h3>
          {a.zh_desc && (
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>{a.zh_desc}</p>
          )}
        </a>
        {/* 投票按钮 */}
        <div className="flex justify-end mt-1 pr-1">
          <button
            onClick={() => onVote(a.id)}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-all hover:opacity-80"
            style={{
              background: userVotes > 0 ? 'rgba(255,68,68,0.12)' : 'transparent',
              borderColor: userVotes > 0 ? 'rgba(255,68,68,0.3)' : 'var(--border)',
              color: userVotes > 0 ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            <span>👍</span>
            {userVotes > 0 && <span>{userVotes}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 时间线列表（深度拆解 & 行业资讯 共用）────────────────────────────────────

const PAGE_SIZE = 30

function TimelineTab({
  articles, loading, votes, onVote,
}: {
  articles: RealtimeFeed['articles']
  loading: boolean
  votes: Record<string, number>
  onVote: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  if (loading) {
    return <div className="text-center py-20 text-sm" style={{ color: 'var(--muted)' }}>加载中…</div>
  }
  if (articles.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
        <p className="text-3xl mb-3">📡</p>
        <p className="text-sm">暂无内容</p>
      </div>
    )
  }

  const q = query.trim().toLowerCase()
  const filtered = articles.filter(a => {
    if (!q) return true
    return a.title.toLowerCase().includes(q) || (a.zh_desc || '').toLowerCase().includes(q)
  })
  const paged = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount
  const groups = groupByDate(paged)

  return (
    <div className="flex flex-col gap-4">
      {/* 搜索框 */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>🔍</span>
        <input
          type="text"
          placeholder="搜索标题或摘要…"
          value={query}
          onChange={e => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE) }}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border"
          style={{ background: 'var(--surface)', borderColor: query ? 'var(--accent)' : 'var(--border)', color: 'var(--fg)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>✕</button>
        )}
      </div>

      <div className="text-xs" style={{ color: 'var(--muted)' }}>{filtered.length} 条</div>

      {paged.length === 0 && (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--muted)' }}>没有找到匹配的内容</div>
      )}

      <div className="flex flex-col gap-8">
        {groups.map(([date, items]) => {
          const d = new Date(date + 'T00:00:00')
          return (
            <section key={date}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-base font-bold text-white">{d.getMonth() + 1} 月 {d.getDate()} 日</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}>
                  星期{WEEKDAYS[d.getDay()]}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{items.length} 条</span>
              </div>
              <div className="flex flex-col">
                {items.map((a, idx) => (
                  <TimelineCard key={a.url} a={a} isLast={idx === items.length - 1} votes={votes} onVote={onVote} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {hasMore && (
        <div className="text-center pt-2 pb-6">
          <button
            onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-full text-sm border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--surface)' }}
          >
            加载更多 · 还有 {filtered.length - visibleCount} 条
          </button>
        </div>
      )}
    </div>
  )
}

// ── 精选 Tab（深度拆解按评分排序）────────────────────────────────────────────

function PicksTab({
  articles, loading, votes, onVote,
}: {
  articles: RealtimeFeed['articles']
  loading: boolean
  votes: Record<string, number>
  onVote: (id: string) => void
}) {
  if (loading) {
    return <div className="text-center py-20 text-sm" style={{ color: 'var(--muted)' }}>加载中…</div>
  }

  const sorted = [...articles].sort((a, b) => {
    const sa = (a.score || 0) + (votes[a.id] || 0)
    const sb = (b.score || 0) + (votes[b.id] || 0)
    return sb - sa
  })

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs" style={{ color: 'var(--muted)' }}>按评分排序，👍 可提升排名</p>
      {sorted.map((a, i) => {
        const totalScore = (a.score || 0) + (votes[a.id] || 0)
        const userVotes = votes[a.id] || 0
        return (
          <div key={a.url} className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <a href={`/realtime?id=${a.id}`} className="group block p-4 hover:bg-white/[0.02] transition-all">
              <div className="flex items-start gap-3">
                {/* 排名 */}
                <span className="text-sm font-bold shrink-0 w-6 text-center mt-0.5"
                      style={{ color: i < 3 ? 'var(--accent)' : 'var(--muted)' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{sourceIcon(a.source)}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{a.source.replace('微信-', '')}</span>
                    <span className="text-xs ml-auto shrink-0 px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,68,68,0.1)', color: 'var(--accent)' }}>
                      ★ {totalScore}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium leading-snug group-hover:text-white transition-colors" style={{ color: '#d8d8e8' }}>
                    {a.title}
                  </h3>
                  {a.zh_desc && (
                    <p className="text-xs leading-relaxed line-clamp-2 mt-1.5" style={{ color: 'var(--muted)' }}>{a.zh_desc}</p>
                  )}
                </div>
              </div>
            </a>
            {/* 投票 */}
            <div className="flex justify-end px-4 pb-3">
              <button
                onClick={() => onVote(a.id)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all hover:opacity-80"
                style={{
                  background: userVotes > 0 ? 'rgba(255,68,68,0.12)' : 'transparent',
                  borderColor: userVotes > 0 ? 'rgba(255,68,68,0.3)' : 'var(--border)',
                  color: userVotes > 0 ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                <span>👍</span>
                <span>{userVotes > 0 ? `+${userVotes}` : '支持'}</span>
              </button>
            </div>
          </div>
        )
      })}
      {sorted.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>暂无内容</p>
      )}
    </div>
  )
}

// ── 游戏榜 Tab ────────────────────────────────────────────────────────────────

function GamesTab({ games, metas }: { games: GameEntry[]; metas: Record<string, { icon?: string } | null> }) {
  const { toGameSlug } = require('../lib/feed') as { toGameSlug: (s: string) => string }

  return (
    <div className="flex flex-col gap-3">
      {games.slice(0, 30).map((g, i) => {
        const meta = metas[g.name]
        const slug = toGameSlug(g.name)
        return (
          <a
            key={g.name}
            href={`/games/${slug}`}
            className="group rounded-2xl p-4 border flex items-center gap-3 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <span className="text-xs w-5 shrink-0 text-center font-bold" style={{ color: 'var(--muted)' }}>{i + 1}</span>
            {meta?.icon ? (
              <img src={meta.icon} alt={g.name} width={40} height={40} className="rounded-xl shrink-0" style={{ width: 40, height: 40, objectFit: 'cover' }} />
            ) : (
              <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-base" style={{ background: 'rgba(255,255,255,0.05)' }}>🎮</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{g.name}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>{g.desc}</p>
            </div>
            <div className="shrink-0 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,68,68,0.1)', color: 'var(--accent)' }}>
              {g.count} 次
            </div>
          </a>
        )
      })}
      {games.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>暂无数据</p>
      )}
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────────────────────────

type Tab = 'teardown' | 'news' | 'picks' | 'games'

const TABS: { id: Tab; label: string }[] = [
  { id: 'teardown', label: '深度拆解' },
  { id: 'news',     label: '行业资讯' },
  { id: 'picks',    label: '精选' },
  { id: 'games',    label: '游戏榜' },
]

export default function MainTabs({
  games,
  gamesMeta,
}: {
  feed?: unknown
  historyDays?: unknown[]
  games: GameEntry[]
  gamesMeta: Record<string, { icon?: string } | null>
}) {
  const [active, setActive] = useState<Tab>('teardown')
  const [realtimeFeed, setRealtimeFeed] = useState<RealtimeFeed>({ updated_at: '', articles: [] })
  const [loading, setLoading] = useState(true)
  const { votes, vote } = useVotes()

  useEffect(() => {
    fetch(`${REALTIME_URL}?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((data: RealtimeFeed) => { setRealtimeFeed(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const allArticles = realtimeFeed.articles ?? []
  const teardownArticles = allArticles.filter(a => a.category === '深度拆解')
  const newsArticles = allArticles.filter(a => a.category === '行业资讯')

  const counts: Record<Tab, number | null> = {
    teardown: teardownArticles.length || null,
    news: newsArticles.length || null,
    picks: teardownArticles.length || null,
    games: null,
  }

  return (
    <>
      {/* Tab 栏 */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl" style={{ background: 'var(--surface)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: active === t.id ? 'rgba(255,68,68,0.15)' : 'transparent',
              color: active === t.id ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            {t.label}
            {counts[t.id] !== null && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: active === t.id ? 'rgba(255,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                             color: active === t.id ? 'var(--accent)' : 'var(--muted)' }}>
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {active === 'teardown' && <TimelineTab articles={teardownArticles} loading={loading} votes={votes} onVote={vote} />}
      {active === 'news'     && <TimelineTab articles={newsArticles}     loading={loading} votes={votes} onVote={vote} />}
      {active === 'picks'    && <PicksTab    articles={teardownArticles} loading={loading} votes={votes} onVote={vote} />}
      {active === 'games'    && <GamesTab games={games} metas={gamesMeta} />}
    </>
  )
}
