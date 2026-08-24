'use client'
import { useState, useEffect, use } from 'react'
import { getGames, getGameMeta, toGameSlug } from '../../lib/feed'
import type { GameEntry } from '../../lib/feed'
import type { RealtimeFeed, RealtimeArticle } from '../../types'

const REALTIME_URL = 'https://raw.githubusercontent.com/xiongxiaoqiu77-prog/gamehot-data/main/realtime-feed.json'

function sourceIcon(source: string) {
  if (source.startsWith('微信')) return '💬'
  if (source.includes('播客') || source.includes('小宇宙')) return '🎙'
  return '📰'
}

export default function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [game, setGame] = useState<GameEntry | null | undefined>(undefined)
  const meta = game ? getGameMeta(game.name) : null

  useEffect(() => {
    // 先从静态 feed 找
    const staticGames = getGames()
    const found = staticGames.find(g => toGameSlug(g.name) === slug)
    if (found) { setGame(found); return }

    // 静态没有则从实时 feed 合并
    fetch(`${REALTIME_URL}?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((data: RealtimeFeed) => {
        const map = new Map<string, GameEntry>()
        for (const a of data.articles) {
          for (const g of a.games ?? []) {
            if (!g.name) continue
            const s = toGameSlug(g.name)
            const existing = map.get(s)
            if (existing) {
              existing.count++
              existing.maxScore = Math.max(existing.maxScore, a.score)
              if (g.desc) existing.desc = g.desc
              existing.articles.push({ title: a.title, url: a.url, source: a.source, id: a.id })
            } else {
              map.set(s, {
                name: g.name,
                desc: g.desc || '',
                count: 1,
                maxScore: a.score,
                articles: [{ title: a.title, url: a.url, source: a.source, id: a.id }],
              })
            }
          }
        }
        const rt = map.get(slug)
        setGame(rt ?? null)
      })
      .catch(() => setGame(null))
  }, [slug])

  if (game === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>加载中…</p>
      </div>
    )
  }

  if (game === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-3xl mb-3">🎮</p>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>找不到该游戏</p>
          <a href="/games" className="text-sm" style={{ color: 'var(--accent)' }}>← 游戏库</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)', background: 'rgba(15,15,19,0.85)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>GAME</span>
              <span className="text-xl font-black tracking-tight text-white">HOT</span>
            </a>
          </div>
          <a href="/games" className="text-sm" style={{ color: 'var(--muted)' }}>← 游戏库</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex gap-5 mb-8">
          {meta?.icon ? (
            <img
              src={meta.icon}
              alt={game.name}
              width={88}
              height={88}
              className="rounded-2xl shrink-0"
              style={{ width: 88, height: 88, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="shrink-0 rounded-2xl flex items-center justify-center text-3xl"
              style={{ width: 88, height: 88, background: 'rgba(255,255,255,0.05)' }}
            >
              🎮
            </div>
          )}
          <div className="flex flex-col justify-center gap-2">
            <h1 className="text-2xl font-bold text-white leading-tight">{game.name}</h1>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
              <span>提及 {game.count} 次</span>
              <span>·</span>
              <span>最高热度 {game.maxScore}</span>
              {meta?.store_url && (
                <>
                  <span>·</span>
                  <a
                    href={meta.store_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    style={{ color: 'var(--accent)' }}
                  >
                    App Store →
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {game.desc && (
          <section className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--accent)' }}>简介</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#c0c0d8' }}>{game.desc}</p>
          </section>
        )}

        {meta?.description && (
          <section className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--accent2)' }}>App Store 介绍</h2>
            <p className="text-sm leading-7 whitespace-pre-wrap" style={{ color: '#b0b0c8' }}>
              {meta.description.slice(0, 600)}{meta.description.length > 600 ? '…' : ''}
            </p>
          </section>
        )}

        {meta?.screenshots && meta.screenshots.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>截图</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {meta.screenshots.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`截图 ${i + 1}`}
                  className="rounded-xl shrink-0"
                  style={{ height: 320, width: 'auto', objectFit: 'cover' }}
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>相关文章</h2>
          <div className="flex flex-col gap-3">
            {game.articles.map(a => {
              const isWeChat = a.source.startsWith('微信')
              const href = (!isWeChat && a.id) ? `/article/${a.id}` : a.url
              return (
                <a
                  key={a.url}
                  href={href}
                  target={isWeChat ? '_blank' : '_self'}
                  rel={isWeChat ? 'noopener noreferrer' : undefined}
                  className="rounded-xl p-4 border flex items-start gap-3 group transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <span className="text-base shrink-0">{sourceIcon(a.source)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug mb-1 group-hover:text-white transition-colors" style={{ color: '#d0d0e8' }}>
                      {a.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {a.source.replace('微信-', '')}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
