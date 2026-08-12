'use client'
import { useState, useEffect } from 'react'
import type { Feed, RealtimeFeed, HistoryDay } from '../types'
import type { GameEntry } from '../lib/feed'
import ArticleCard from './ArticleCard'

const REALTIME_URL = 'https://raw.githubusercontent.com/xiongxiaoqiu77-prog/gamehot-data/main/realtime-feed.json'

// ── 工具 ──────────────────────────────────────────────────────────────────────

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

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  return `${Math.floor(h / 24)} 天前`
}

function ScorePip({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="w-1 h-1 rounded-full" style={{
          background: i < score ? `hsl(${10 + i * 8},90%,60%)` : 'rgba(255,255,255,0.08)',
        }} />
      ))}
    </div>
  )
}

// ── 全部动态 Tab ───────────────────────────────────────────────────────────────

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function groupByDate(articles: RealtimeFeed['articles']) {
  const map = new Map<string, typeof articles>()
  for (const a of articles) {
    const d = a.published_at ? a.published_at.slice(0, 10) : a.fetched_at.slice(0, 10)
    if (!map.has(d)) map.set(d, [])
    map.get(d)!.push(a)
  }
  // 每组内按时间降序
  map.forEach(v => v.sort((a, b) => {
    const ta = a.published_at || a.fetched_at
    const tb = b.published_at || b.fetched_at
    return tb.localeCompare(ta)
  }))
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

const ALL_CATEGORIES = ['行业资讯', '深度拆解', '泛游戏']

const PAGE_SIZE = 30

function RealtimeTab({ feed, loading }: { feed: RealtimeFeed; loading: boolean }) {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const allArticles = feed.articles ?? []

  if (loading) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
        <p className="text-sm">加载中…</p>
      </div>
    )
  }

  if (allArticles.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
        <p className="text-3xl mb-3">📡</p>
        <p className="text-sm">实时数据将在 30 分钟内开始更新</p>
      </div>
    )
  }

  const q = query.trim().toLowerCase()
  const filtered = allArticles.filter(a => {
    if (activeCat && a.category !== activeCat) return false
    if (q && !a.title.toLowerCase().includes(q) && !(a.zh_desc || '').toLowerCase().includes(q)) return false
    return true
  })
  const articles = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  const groups = groupByDate(articles)

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
          style={{
            background: 'var(--surface)',
            borderColor: query ? 'var(--accent)' : 'var(--border)',
            color: 'var(--fg)',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: 'var(--muted)' }}>✕</button>
        )}
      </div>

      {/* 分类筛选 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setActiveCat(null); setVisibleCount(PAGE_SIZE) }}
          className="text-xs px-3 py-1 rounded-full border transition-all"
          style={{
            background: activeCat === null ? 'rgba(255,68,68,0.15)' : 'transparent',
            borderColor: activeCat === null ? 'var(--accent)' : 'var(--border)',
            color: activeCat === null ? 'var(--accent)' : 'var(--muted)',
          }}>全部</button>
        {ALL_CATEGORIES.map(cat => (
          <button key={cat}
            onClick={() => { setActiveCat(activeCat === cat ? null : cat); setVisibleCount(PAGE_SIZE) }}
            className="text-xs px-3 py-1 rounded-full border transition-all"
            style={{
              background: activeCat === cat ? 'rgba(255,68,68,0.15)' : 'transparent',
              borderColor: activeCat === cat ? 'var(--accent)' : 'var(--border)',
              color: activeCat === cat ? 'var(--accent)' : 'var(--muted)',
            }}>{cat}</button>
        ))}
        <span className="text-xs self-center ml-1" style={{ color: 'var(--muted)' }}>
          {filtered.length} 条
        </span>
      </div>

      {/* 无结果 */}
      {articles.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
          <p className="text-sm">没有找到匹配的内容</p>
        </div>
      )}

      {/* 时间线 */}
      <div className="flex flex-col gap-8">
      {groups.map(([date, items]) => {
        const d = new Date(date + 'T00:00:00')
        const dayLabel = `${d.getMonth() + 1} 月 ${d.getDate()} 日`
        const weekLabel = `星期${WEEKDAYS[d.getDay()]}`

        return (
          <section key={date}>
            {/* 日期区块头 */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">{dayLabel}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}>
                  {weekLabel}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{items.length} 条</span>
            </div>

            {/* 时间线条目 */}
            <div className="flex flex-col">
              {items.map((a, idx) => {
                const pub = a.published_at ? new Date(a.published_at) : new Date(a.fetched_at)
                const timeStr = `${pub.getHours().toString().padStart(2, '0')}:${pub.getMinutes().toString().padStart(2, '0')}`
                const catColor = CATEGORY_COLORS[a.category] ?? 'bg-white/5 text-white/40 border-white/10'
                const isLast = idx === items.length - 1

                return (
                  <div key={a.url} className="flex gap-4">
                    {/* 左侧时间轴 */}
                    <div className="flex flex-col items-center" style={{ width: 44, minWidth: 44 }}>
                      <span className="text-xs font-mono leading-none mt-1" style={{ color: 'var(--muted)' }}>
                        {timeStr}
                      </span>
                      <div className="w-px flex-1 mt-1.5" style={{ background: isLast ? 'transparent' : 'var(--border)', minHeight: 16 }} />
                    </div>

                    {/* 右侧卡片 */}
                    <a
                      href={`/realtime?id=${a.id}`}
                      className="group flex-1 rounded-xl p-3.5 border mb-2 transition-all duration-200 hover:-translate-y-0.5 min-w-0"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>{sourceIcon(a.source)}</span>
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>
                            {a.source.replace('微信-', '')}
                          </span>
                        </div>
                        {a.category && (
                          <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${catColor}`}>
                            {a.category}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-medium leading-snug mb-1.5 group-hover:text-white transition-colors"
                          style={{ color: '#d8d8e8' }}>
                        {a.title}
                      </h3>

                      {a.zh_desc && (
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>
                          {a.zh_desc}
                        </p>
                      )}
                    </a>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
      </div>

      {/* 加载更多 */}
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

// ── 今日日报 Tab ───────────────────────────────────────────────────────────────

function DigestTab({ feed }: { feed: Feed }) {
  return (
    <div className="flex flex-col gap-4">
      {feed.articles.map((article, i) => (
        <ArticleCard key={article.url} article={article} rank={i + 1} />
      ))}
    </div>
  )
}

// ── 日报历史 Tab ──────────────────────────────────────────────────────────────

function HistoryTab({ days }: { days: HistoryDay[] }) {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="flex flex-col gap-3">
      {days.slice(0, 30).map(day => {
        const d = new Date(day.date + 'T00:00:00')
        const label = `${d.getMonth() + 1} 月 ${d.getDate()} 日  星期${weekdays[d.getDay()]}`
        return (
          <a
            key={day.date}
            href="/history"
            className="group rounded-2xl p-4 border flex items-center justify-between transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-sm font-medium text-white group-hover:text-white">{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {day.articles.length} 篇精选 · {day.articles.slice(0, 2).map(a => a.title).join('、')}
                {day.articles.length > 2 ? '…' : ''}
              </p>
            </div>
            <span className="text-xs shrink-0 ml-3" style={{ color: 'var(--muted)' }}>→</span>
          </a>
        )
      })}
      {days.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>
          日报生成后将在此显示
        </p>
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
            <span className="text-xs w-5 shrink-0 text-center font-bold" style={{ color: 'var(--muted)' }}>
              {i + 1}
            </span>
            {meta?.icon ? (
              <img src={meta.icon} alt={g.name} width={40} height={40}
                   className="rounded-xl shrink-0" style={{ width: 40, height: 40, objectFit: 'cover' }} />
            ) : (
              <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-base"
                   style={{ background: 'rgba(255,255,255,0.05)' }}>🎮</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{g.name}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>{g.desc}</p>
            </div>
            <div className="shrink-0 text-xs px-2 py-0.5 rounded-full"
                 style={{ background: 'rgba(255,68,68,0.1)', color: 'var(--accent)' }}>
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

type Tab = 'realtime' | 'digest' | 'history' | 'games'

const TABS: { id: Tab; label: string }[] = [
  { id: 'realtime', label: '全部动态' },
  { id: 'digest',   label: '今日日报' },
  { id: 'history',  label: '日报历史' },
  { id: 'games',    label: '游戏榜' },
]

export default function MainTabs({
  feed,
  historyDays,
  games,
  gamesMeta,
}: {
  feed: Feed
  historyDays: HistoryDay[]
  games: GameEntry[]
  gamesMeta: Record<string, { icon?: string } | null>
}) {
  const [active, setActive] = useState<Tab>('realtime')
  const [realtimeFeed, setRealtimeFeed] = useState<RealtimeFeed>({ updated_at: '', articles: [] })
  const [realtimeLoading, setRealtimeLoading] = useState(true)

  useEffect(() => {
    fetch(REALTIME_URL)
      .then(r => r.json())
      .then((data: RealtimeFeed) => { setRealtimeFeed(data); setRealtimeLoading(false) })
      .catch(() => setRealtimeLoading(false))
  }, [])

  const counts: Record<Tab, number | null> = {
    realtime: realtimeFeed.articles?.length ?? 0,
    digest: feed.articles.length,
    history: historyDays.length,
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
            {counts[t.id] !== null && counts[t.id]! > 0 && (
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
      {active === 'realtime' && <RealtimeTab feed={realtimeFeed} loading={realtimeLoading} />}
      {active === 'digest'   && <DigestTab feed={feed} />}
      {active === 'history'  && <HistoryTab days={historyDays} />}
      {active === 'games'    && <GamesTab games={games} metas={gamesMeta} />}
    </>
  )
}
