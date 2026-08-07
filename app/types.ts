export interface Article {
  title: string
  description: string
  url: string
  source: string
  category: string
  score: number
  published_at: string
}

export interface Feed {
  updated: string
  generated_at: string
  articles: Article[]
}
