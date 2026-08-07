export interface Game {
  name: string
  desc: string
}

export interface Article {
  title: string
  summary: string
  url: string
  source: string
  category: string
  score: number
  published_at: string
  games: Game[]
}

export interface Feed {
  updated: string
  generated_at: string
  articles: Article[]
}
