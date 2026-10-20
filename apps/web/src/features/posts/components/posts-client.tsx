import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useTranslations } from '@/src/i18n/client'
import '@/src/styles/paper-posts.css'

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
  const series = t.raw<WritingSeries[]>('series') ?? []

  return (
    <div className="pp-page pp-posts">
      <header className="pp-head">
        <p className="pp-eyebrow">
          <span className="pp-tick" aria-hidden="true" />
          MAX ZHANG<span className="pp-slash">/</span>WRITING
        </p>
        <div className="pp-head-grid">
          <h1 className="pp-title">{t('title')}</h1>
          <div className="pp-head-aside">
            <p className="pp-head-desc">{t('description')}</p>
            <p className="pp-head-note">{t('note')}</p>
          </div>
        </div>
      </header>

      {series.length > 0 && (
        <section className="pp-series" aria-labelledby="pp-series-title">
          <div className="pp-section-head">
            <p className="pp-label" id="pp-series-title">
              <span className="pp-tick" aria-hidden="true" />
              {t('seriesTitle')}
            </p>
            <span className="pp-section-no">{String(series.length).padStart(2, '0')}</span>
          </div>
          <div className="pp-series-grid">
            {series.map((item, index) => (
              <article key={item.title} className="pp-series-item">
                <span className="pp-series-no">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="pp-series-title">{item.title}</h2>
                <p className="pp-series-body">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="pp-layout">
        <section className="pp-results" aria-label={t('title')}>
          {posts.map((post, idx) => (
            <PostItem key={post.slug} post={post} idx={idx} variant="paper" />
          ))}
          {posts.length === 0 && <div className="pp-empty">{t('noPosts')}</div>}
        </section>

        <aside className="pp-side">
          <div className="pp-side-block">
            <div className="pp-section-head">
              <p className="pp-label">{t('categories')}</p>
              <span className="pp-section-no">{String(allCategories.length).padStart(2, '0')}</span>
            </div>
            <ul className="pp-cat-list">
              {allCategories.map((category) => {
                const href = `/search?category=${encodeURIComponent(category)}`
                return (
                  <li key={category}>
                    <Link href={href} className="pp-cat-link">
                      <span>{category}</span>
                      <span className="pp-cat-mark" aria-hidden="true">
                        ↗
                      </span>
                    </Link>
                  </li>
                )
              })}
              {allCategories.length === 0 && <li className="pp-side-empty">{t('noCategories')}</li>}
            </ul>
          </div>

          <div className="pp-side-block">
            <div className="pp-section-head">
              <p className="pp-label">{t('tags')}</p>
              <span className="pp-section-no">{String(allTags.length).padStart(2, '0')}</span>
            </div>
            <div className="pp-tag-row">
              {allTags.map((tag) => {
                const href = `/search?tag=${encodeURIComponent(tag)}`
                return (
                  <Link key={tag} href={href} className="pp-chip">
                    {tag}
                  </Link>
                )
              })}
              {allTags.length === 0 && <span className="pp-side-empty">{t('noTags')}</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
