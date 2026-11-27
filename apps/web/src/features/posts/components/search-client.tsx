import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { useLocale, useTranslations } from '@/src/i18n/client'
import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface SearchClientProps {
  posts: PostSummaryWithViews[]
  initialSearch: {
    q?: string
  }
}

export function SearchClient({ posts, initialSearch }: SearchClientProps) {
  const t = useTranslations('SearchPage')
  const locale = useLocale()

  const [query, setQuery] = useState(initialSearch.q ?? '')

  const fuse = useMemo(() => {
    return new Fuse(posts, {
      keys: ['title', 'summary'],
      threshold: 0.3,
      includeScore: true,
    })
  }, [posts])

  const filteredPosts = useMemo(() => {
    if (!query) return []
    return fuse.search(query).map((result) => result.item)
  }, [query, fuse])

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      const queryString = params.toString()
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname
      window.history.replaceState(null, '', newUrl)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const clearFilters = () => {
    setQuery('')
  }
  const hasFilters = Boolean(query)

  return (
    <div className="ni-page">
      <header className="ni-page-head">
        <p className="ni-kicker ni-mono ni-page-kicker">{locale === 'zh' ? '索引 005 / 搜索' : 'Index 005 / Search'}</p>
        <div className="ni-page-head-grid">
          <h1 className="ni-page-title">{t('title')}</h1>
          <form className="ni-search-form" role="search" onSubmit={(event) => event.preventDefault()}>
            <Search className="ni-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('placeholder')}
              aria-label={t('title')}
              autoComplete="off"
              spellCheck={false}
              className="ni-search-input"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="ni-search-clear" aria-label={t('clearAll')}>
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </form>
        </div>
      </header>

      <section className="ni-section" aria-labelledby="ni-search-results">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">01</span>
          <h2 id="ni-search-results">{t('results')}</h2>
          <span className="ni-section-link" aria-hidden="true">
            {String(filteredPosts.length).padStart(2, '0')}
          </span>
        </header>

        {hasFilters && (
          <div className="ni-status">
            <p className="ni-status-count" aria-live="polite">
              {t('found', { count: filteredPosts.length })}
            </p>
            <div className="ni-active-filters">
              <button type="button" onClick={clearFilters} className="ni-clear">
                {t('clearAll')}
              </button>
            </div>
          </div>
        )}

        <div className="ni-list">
          {hasFilters ? (
            filteredPosts.length > 0 ? (
              filteredPosts.map((post, idx) => <PostItem key={post.slug} post={post} idx={idx} />)
            ) : (
              <div className="ni-empty">
                <span className="ni-empty-code">000 / No match</span>
                <p className="ni-empty-title">{t('noResults')}</p>
                <button type="button" onClick={clearFilters} className="ni-btn">
                  {t('clearFilters')}
                </button>
              </div>
            )
          ) : (
            <div className="ni-empty">
              <span className="ni-empty-code">000 / Query</span>
              <p className="ni-empty-title">{t('startSearch')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
