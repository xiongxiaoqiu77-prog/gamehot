'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import type { RealtimeArticle, RealtimeFeed } from '../types'

const REALTIME_URL = 'https://raw.githubusercontent.com/xiongxiaoqiu77-prog/gamehot-data/main/realtime-feed.json'

function sourceIcon(source: string) {
  if (source.startsWith('微信')) return '💬'
  if (source.includes('播客') || source.includes('小宇宙')) return '🎙'
  return '📰'
}

// 去掉行内所有 markdown 链接，返回纯文本长度
function plainTextLen(line: string): number {
  return line.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/!?\[.*?\]/g, '').trim().length
}

function cleanContent(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []

  for (const raw of lines) {
    const line = raw.trim()

    // 跳过常见 CMS/站点 UI 残留文本
    if (/^Search for:/i.test(line) || /^Skip to (content|main)/i.test(line)) continue

    // 跳过含链接且纯文字极少的行（导航菜单、tag 列表、作者链接等）
    const hasLink = /\]\(https?:\/\//.test(line) || /\]\(#/.test(line)
    if (hasLink) {
      const pt = plainTextLen(line)
      // 纯文字内容 < 40 字符视为导航/标签噪音，丢弃
      if (pt < 40) continue
    }

    // mailto: 链接变纯文本
    out.push(raw.replace(/\[([^\]]+)\]\(mailto:[^)]+\)/g, '$1'))
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function ArticleDetail() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''

  const [article, setArticle] = useState<RealtimeArticle | null>(null)
  const [content, setContent] = useState('')
  const [contentLoading, setContentLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // 从 realtime feed 里找文章
  useEffect(() => {
    if (!id) { setNotFound(true); return }
    fetch(REALTIME_URL)
      .then(r => r.json())
      .then((data: RealtimeFeed) => {
        const found = data.articles.find(a => a.id === id)
        if (found) setArticle(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
  }, [id])

  // 非微信文章：通过 Jina Reader 拉取原文
  useEffect(() => {
    if (!article || article.source.startsWith('微信')) return
    setContentLoading(true)
    fetch(`https://r.jina.ai/${article.url}`, {
      headers: { Accept: 'text/plain' },
    })
      .then(r => r.text())
      .then(text => {
        // Jina 返回错误时（404 等）直接放弃展示原文
        if (/Warning: Target URL returned error/i.test(text)) {
          setContentLoading(false)
          return
        }
        // 去掉 Jina 的 metadata 头
        let body = text.replace(/^[\s\S]*?Markdown Content:\s*/i, '').trim()
        body = cleanContent(body)
        setContent((body || text).slice(0, 8000))
        setContentLoading(false)
      })
      .catch(() => setContentLoading(false))
  }, [article])

  if (notFound) {
    return (
      <div className="text-center py-32" style={{ color: 'var(--muted)' }}>
        <p className="text-3xl mb-3">🔍</p>
        <p className="text-sm">找不到该文章</p>
        <a href="/" className="text-sm mt-4 inline-block" style={{ color: 'var(--accent)' }}>← 返回首页</a>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center py-32" style={{ color: 'var(--muted)' }}>
        <p className="text-sm">加载中…</p>
      </div>
    )
  }

  const pub = article.published_at ? new Date(article.published_at) : new Date(article.fetched_at)
  const dateStr = `${pub.getFullYear()} 年 ${pub.getMonth() + 1} 月 ${pub.getDate()} 日  ${pub.getHours().toString().padStart(2, '0')}:${pub.getMinutes().toString().padStart(2, '0')}`
  const isWeChat = article.source.startsWith('微信')

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* 分类 + 来源 */}
      <div className="flex items-center gap-2 mb-4 text-sm flex-wrap" style={{ color: 'var(--muted)' }}>
        {article.category && (
          <span className="px-2 py-0.5 rounded-full border text-xs" style={{ borderColor: 'rgba(255,68,68,0.2)', color: '#ff8c8c', background: 'rgba(255,68,68,0.08)' }}>
            {article.category}
          </span>
        )}
        <span>{sourceIcon(article.source)} {article.source.replace('微信-', '')}</span>
        <span>·</span>
        <span>{dateStr}</span>
      </div>

      {/* 标题 */}
      <h1 className="text-2xl font-bold text-white leading-snug mb-8">{article.title}</h1>

      {/* AI 导读 */}
      {article.zh_desc && (
        <section className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--accent)' }}>AI 导读</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#c0c0d8' }}>{article.zh_desc}</p>
        </section>
      )}

      {/* 提及游戏 */}
      {article.games && article.games.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>提及游戏</h2>
          <div className="flex flex-col gap-2">
            {article.games.map((g, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="text-base mt-0.5">🎮</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{g.name}</p>
                  {g.desc && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{g.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 原文内容（非微信） */}
      {!isWeChat && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>原文</h2>
          {contentLoading && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>加载原文中…</p>
          )}
          {!contentLoading && content && (
            <div className="text-sm leading-8 prose-content" style={{ color: '#b0b0c8' }}>
              <ReactMarkdown
                components={{
                  h1: ({children}) => <h1 className="text-xl font-bold text-white mt-6 mb-3">{children}</h1>,
                  h2: ({children}) => <h2 className="text-lg font-bold text-white mt-5 mb-2">{children}</h2>,
                  h3: ({children}) => <h3 className="text-base font-semibold text-white mt-4 mb-2">{children}</h3>,
                  p:  ({children}) => <p className="mb-4 leading-8">{children}</p>,
                  a:  ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }} className="underline">{children}</a>,
                  ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="leading-7">{children}</li>,
                  img: () => null,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
          {!contentLoading && !content && (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>原文加载失败，请点击下方按钮查看。</p>
          )}
        </section>
      )}

      {/* 查看原文 */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
        style={{ background: 'rgba(255,68,68,0.12)', color: 'var(--accent)', border: '1px solid rgba(255,68,68,0.2)' }}
      >
        查看原文 →
      </a>
    </main>
  )
}

export default function RealtimeArticlePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)', background: 'rgba(15,15,19,0.85)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>GAME</span>
            <span className="text-xl font-black tracking-tight text-white">HOT</span>
          </a>
          <a href="/" className="text-sm" style={{ color: 'var(--muted)' }}>← 返回列表</a>
        </div>
      </header>
      <Suspense fallback={<div className="text-center py-32 text-sm" style={{ color: 'var(--muted)' }}>加载中…</div>}>
        <ArticleDetail />
      </Suspense>
    </div>
  )
}
