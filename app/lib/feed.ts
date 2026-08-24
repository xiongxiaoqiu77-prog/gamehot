import type { Feed, Article, HistoryFeed, HistoryDay } from '../types'
import feedData from '../data/feed.json'
import historyData from '../data/history-feed.json'
import gamesMeta from '../data/games-meta.json'

function md5Short(url: string): string {
  // 简单哈希，与 digest.py 的 _article_id 保持一致
  let h = 0
  for (let i = 0; i < url.length; i++) {
    h = (Math.imul(31, h) + url.charCodeAt(i)) >>> 0
  }
  return h.toString(16).padStart(8, '0').slice(0, 10)
}

function withIds(feed: Feed): Feed {
  return {
    ...feed,
    articles: feed.articles.map(a => ({
      ...a,
      id: a.id || md5Short(a.url),
    })),
  }
}

export function getFeed(): Feed {
  return withIds(feedData as unknown as Feed)
}

export function getHistory(): HistoryDay[] {
  const h = historyData as unknown as HistoryFeed
  return h.dates.map(day => ({
    ...day,
    articles: day.articles.map(a => ({ ...a, id: a.id || md5Short(a.url) })),
  }))
}

export function getAllArticles(): Article[] {
  const todayIds = new Set(getFeed().articles.map(a => a.id))
  const historyArticles = getHistory()
    .flatMap(d => d.articles)
    .filter(a => !todayIds.has(a.id))
  return [...getFeed().articles, ...historyArticles]
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find(a => a.id === id)
}

export interface GameMeta {
  name: string
  icon: string
  description: string
  screenshots: string[]
  store_url: string
  store: string
}

export function toGameSlug(name: string): string {
  return name.toLowerCase().replace(/[^\w一-鿿]+/g, '-').replace(/^-|-$/g, '')
}

export function getGameMeta(name: string): GameMeta | null {
  return (gamesMeta as Record<string, GameMeta | null>)[name] ?? null
}

export function getAllGamesMeta(): Record<string, GameMeta | null> {
  return gamesMeta as Record<string, GameMeta | null>
}

export interface GameArticleRef {
  title: string
  url: string
  source: string
  id: string
}

export interface GameEntry {
  name: string
  desc: string
  count: number
  maxScore: number
  articles: GameArticleRef[]
}

export function getGames(): GameEntry[] {
  const map = new Map<string, GameEntry>()

  for (const article of getAllArticles()) {
    for (const g of article.games ?? []) {
      if (!g.name) continue
      const existing = map.get(g.name)
      const ref: GameArticleRef = { title: article.title, url: article.url, source: article.source, id: article.id }
      if (existing) {
        existing.count++
        existing.maxScore = Math.max(existing.maxScore, article.score)
        existing.articles.push(ref)
        if (g.desc) existing.desc = g.desc
      } else {
        map.set(g.name, {
          name: g.name,
          desc: g.desc || '',
          count: 1,
          maxScore: article.score,
          articles: [ref],
        })
      }
    }
  }

  // 按提及次数 → 最高热度排序
  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || b.maxScore - a.maxScore
  )
}
