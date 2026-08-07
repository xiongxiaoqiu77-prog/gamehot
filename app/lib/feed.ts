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
  return withIds(feedData as Feed)
}

export function getArticleById(id: string): Article | undefined {
  return getFeed().articles.find(a => a.id === id)
}
