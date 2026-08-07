import type { Feed } from '../types'

const FEED_URL =
  'https://raw.githubusercontent.com/xiongxiaoqiu77-prog/game-digest/main/feed.json'

export async function getFeed(): Promise<Feed> {
  const res = await fetch(FEED_URL, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Failed to fetch feed: ${res.status}`)
  return res.json()
}
