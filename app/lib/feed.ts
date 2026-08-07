import type { Feed, Article } from '../types'
import feedData from '../data/feed.json'

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

export function getArticleById(id: string): Article | undefined {
  return getFeed().articles.find(a => a.id === id)
}

export interface GameEntry {
  name: string
  desc: string          // 最近一次出现的介绍
  count: number         // 被提及次数
  maxScore: number      // 关联文章最高热度
  articles: Article[]   // 关联文章列表
}

export function getGames(): GameEntry[] {
  const map = new Map<string, GameEntry>()

  for (const article of getFeed().articles) {
    for (const g of article.games ?? []) {
      if (!g.name) continue
      const existing = map.get(g.name)
      if (existing) {
        existing.count++
        existing.maxScore = Math.max(existing.maxScore, article.score)
        existing.articles.push(article)
        if (g.desc) existing.desc = g.desc
      } else {
        map.set(g.name, {
          name: g.name,
          desc: g.desc || '',
          count: 1,
          maxScore: article.score,
          articles: [article],
        })
      }
    }
  }

  // 按提及次数 → 最高热度排序
  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || b.maxScore - a.maxScore
  )
}
