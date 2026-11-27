import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { useLocale, useTranslations } from '@/src/i18n/client'

interface PostsClientProps {
  posts: PostSummaryWithViews[]
}

export function PostsClient({ posts }: PostsClientProps) {
  const t = useTranslations('PostsPage')
  const locale = useLocale()
  const latest = posts[0]?.date ?? '—'

  return (
    <div className="ni-page">
      <header className="ni-page-head">
        <p className="ni-kicker ni-mono ni-page-kicker">
          {locale === 'zh' ? '人员档案 004 / 写作' : 'Personnel file 004 / Writing'}
        </p>
        <div className="ni-page-head-grid">
          <h1 className="ni-page-title">{t('title')}</h1>
          <div className="ni-page-aside">
            <p className="ni-page-desc">{t('description')}</p>
            <p className="ni-page-note">{t('note')}</p>
          </div>
        </div>
      </header>

      <section className="ni-metrics ni-metrics--pair" aria-label={t('metrics.entries')}>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>{t('metrics.entries')}</span>
            <i aria-hidden="true">01</i>
          </div>
          <span className="ni-metric-value">{String(posts.length).padStart(2, '0')}</span>
          <span className="ni-metric-note">{t('metrics.entriesNote')}</span>
        </div>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>{t('metrics.latest')}</span>
            <i aria-hidden="true">02</i>
          </div>
          <span className="ni-metric-value ni-metric-value--date">{latest}</span>
          <span className="ni-metric-note">{t('metrics.latestNote')}</span>
        </div>
      </section>

      <section className="ni-section">
        <div className="ni-list">
          {posts.map((post, idx) => (
            <PostItem key={post.slug} post={post} idx={idx} />
          ))}
          {posts.length === 0 && (
            <div className="ni-empty">
              <span className="ni-empty-code">000 / Empty</span>
              <p className="ni-empty-title">{t('noPosts')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
