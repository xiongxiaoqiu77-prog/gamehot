import type { Article } from '../types'

const CATEGORY_COLORS: Record<string, string> = {
  '新游资讯': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  '深度拆解': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  '行业动态': 'bg-green-500/10 text-green-300 border-green-500/20',
  '商业分析': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  '设计研究': 'bg-pink-500/10 text-pink-300 border-pink-500/20',
}

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: i < score
              ? `hsl(${10 + i * 8}, 90%, 60%)`
              : 'rgba(255,255,255,0.1)',
          }}
        />
      ))}
    </div>
  )
}

function sourceIcon(source: string) {
  if (source.startsWith('微信')) return '💬'
  if (source.includes('podcast') || source.includes('播客') || source.includes('小宇宙')) return '🎙'
  return '📰'
}

export default function ArticleCard({ article, rank }: { article: Article; rank: number }) {
  const categoryColor = CATEGORY_COLORS[article.category] ?? 'bg-white/5 text-white/50 border-white/10'
  const isTop3 = rank <= 3
  const pub = new Date(article.published_at)
  const timeStr = `${pub.getHours().toString().padStart(2,'0')}:${pub.getMinutes().toString().padStart(2,'0')}`

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: isTop3 ? 'linear-gradient(135deg, #1e1a2a, #1a1a22)' : 'var(--surface)',
        borderColor: isTop3 ? 'rgba(255,68,68,0.25)' : 'var(--border)',
        boxShadow: isTop3 ? '0 0 0 1px rgba(255,68,68,0.08) inset' : 'none',
      }}
    >
      {/* top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* rank badge */}
          <span
            className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isTop3
                ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                : 'rgba(255,255,255,0.08)',
              color: isTop3 ? '#fff' : 'var(--muted)',
            }}
          >
            {rank}
          </span>

          {article.category && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColor}`}>
              {article.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 text-xs" style={{ color: 'var(--muted)' }}>
          <span>{sourceIcon(article.source)}</span>
          <span className="truncate max-w-28">{article.source.replace('微信-', '')}</span>
          <span>·</span>
          <span>{timeStr}</span>
        </div>
      </div>

      {/* title */}
      <h3
        className="font-semibold leading-snug mb-2 group-hover:text-white transition-colors"
        style={{ color: isTop3 ? '#f0f0f5' : '#d0d0e0', fontSize: '0.95rem' }}
      >
        {article.title}
      </h3>

      {/* description */}
      {article.description && (
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
          {article.description}
        </p>
      )}

      {/* bottom: score */}
      <div className="flex items-center justify-between">
        <ScoreDots score={article.score} />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          热度 {article.score}
        </span>
      </div>
    </a>
  )
}
