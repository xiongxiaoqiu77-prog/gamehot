export interface Game {
  name: string
  desc: string
}

export interface Article {
  id: string
  title: string
  summary: string
  url: string
  source: string
  category: string
  score: number
  published_at: string
  games: Game[]
  translated_content?: string
  original_content?: string
}

export interface Feed {
  updated: string
  generated_at: string
  articles: Article[]
}

export interface HistoryDay {
  date: string
  articles: Article[]
}

export interface HistoryFeed {
  dates: HistoryDay[]
}
