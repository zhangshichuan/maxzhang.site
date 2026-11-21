import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'

interface PostsClientProps {
  posts: PostSummaryWithViews[]
  allTags: string[]
  allCategories: string[]
}

interface WritingSeries {
  title: string
  body: string
}

export function PostsClient({ posts, allTags, allCategories }: PostsClientProps) {
  const t = useTranslations('PostsPage')
  const locale = useLocale()
  const series = t.raw<WritingSeries[]>('series') ?? []
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

      <section className="ni-metrics" aria-label={t('metrics.entries')}>
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
            <span>{t('metrics.categories')}</span>
            <i aria-hidden="true">02</i>
          </div>
          <span className="ni-metric-value">{String(allCategories.length).padStart(2, '0')}</span>
          <span className="ni-metric-note">{t('metrics.categoriesNote')}</span>
        </div>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>{t('metrics.tags')}</span>
            <i aria-hidden="true">03</i>
          </div>
          <span className="ni-metric-value">{String(allTags.length).padStart(2, '0')}</span>
          <span className="ni-metric-note">{t('metrics.tagsNote')}</span>
        </div>
        <div className="ni-metric">
          <div className="ni-metric-label ni-mono">
            <span>{t('metrics.latest')}</span>
            <i aria-hidden="true">04</i>
          </div>
          <span className="ni-metric-value ni-metric-value--date">{latest}</span>
          <span className="ni-metric-note">{t('metrics.latestNote')}</span>
        </div>
      </section>

      {series.length > 0 && (
        <section className="ni-section" aria-labelledby="ni-series-title">
          <header className="ni-section-head">
            <span className="ni-index ni-mono">01</span>
            <h2 id="ni-series-title">{t('seriesTitle')}</h2>
            <span className="ni-section-link" aria-hidden="true">
              {String(series.length).padStart(2, '0')} {t('metrics.entries')}
            </span>
          </header>

          <div className="ni-method">
            {series.map((item, index) => (
              <div className="ni-method-step" key={item.title}>
                <span className="ni-index ni-mono" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="ni-section" aria-labelledby="ni-index-title">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">02</span>
          <h2 id="ni-index-title">{t('indexTitle')}</h2>
          <span className="ni-section-link" aria-hidden="true">
            {String(posts.length).padStart(2, '0')} {t('metrics.entries')}
          </span>
        </header>

        <div className="ni-filter-grid">
          <div>
            <p className="ni-filter-label">
              <span>{t('categories')}</span>
              <b>{String(allCategories.length).padStart(2, '0')}</b>
            </p>
            <div className="ni-chips">
              {allCategories.map((category) => (
                <Link key={category} href={`/search?category=${encodeURIComponent(category)}`} className="ni-chip">
                  {category}
                </Link>
              ))}
              {allCategories.length === 0 && <span className="ni-page-note">{t('noCategories')}</span>}
            </div>
          </div>

          <div>
            <p className="ni-filter-label">
              <span>{t('tags')}</span>
              <b>{String(allTags.length).padStart(2, '0')}</b>
            </p>
            <div className="ni-chips">
              {allTags.map((tag) => (
                <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`} className="ni-chip">
                  {tag}
                </Link>
              ))}
              {allTags.length === 0 && <span className="ni-page-note">{t('noTags')}</span>}
            </div>
          </div>
        </div>

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
