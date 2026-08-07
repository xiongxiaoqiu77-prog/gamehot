import type { Feed } from '../types'
import feedData from '../data/feed.json'

export function getFeed(): Feed {
  return feedData as Feed
}
