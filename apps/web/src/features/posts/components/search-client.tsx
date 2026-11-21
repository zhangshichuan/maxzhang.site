import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { useLocale, useTranslations } from '@/src/i18n/client'
import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface SearchClientProps {
  posts: PostSummaryWithViews[]
  initialSearch: {
    q: string
    tag: string
    category: string
  }
}

export function SearchClient({ posts, initialSearch }: SearchClientProps) {
  const t = useTranslations('SearchPage')
  const locale = useLocale()

  const [query, setQuery] = useState(initialSearch.q)
  const [selectedTag, setSelectedTag] = useState(initialSearch.tag)
  const [selectedCategory, setSelectedCategory] = useState(initialSearch.category)

  const fuse = useMemo(() => {
    return new Fuse(posts, {
      keys: ['title', 'summary', 'tags', 'category'],
      threshold: 0.3,
      includeScore: true,
    })
  }, [posts])

  const { allTags, allCategories } = useMemo(() => {
    const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()
    const categories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).sort()
    return { allTags: tags, allCategories: categories }
  }, [posts])

  const filteredPosts = useMemo(() => {
    if (!query && !selectedTag && !selectedCategory) return []
    let results = posts
    if (query) {
      const fuseResults = fuse.search(query)
      results = fuseResults.map((result) => result.item)
    }
    if (selectedTag) results = results.filter((post) => post.tags.includes(selectedTag))
    if (selectedCategory) results = results.filter((post) => post.category === selectedCategory)
    return results
  }, [posts, query, selectedTag, selectedCategory, fuse])

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (selectedTag) params.set('tag', selectedTag)
      if (selectedCategory) params.set('category', selectedCategory)
      const queryString = params.toString()
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname
      window.history.replaceState(null, '', newUrl)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, selectedTag, selectedCategory])

  const clearFilters = () => {
    setQuery('')
    setSelectedTag('')
    setSelectedCategory('')
  }
  const hasFilters = Boolean(query || selectedTag || selectedCategory)

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

      <section className="ni-section" aria-labelledby="ni-search-filters">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">01</span>
          <h2 id="ni-search-filters">{t('currentFilter')}</h2>
        </header>

        <div className="ni-filter-grid">
          <div>
            <p className="ni-filter-label">
              <span>{t('category')}</span>
              <b>{String(allCategories.length).padStart(2, '0')}</b>
            </p>
            <div className="ni-chips">
              {allCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory((prev) => (prev === category ? '' : category))}
                  aria-pressed={selectedCategory === category}
                  className="ni-chip"
                >
                  {category}
                </button>
              ))}
              {allCategories.length === 0 && <span className="ni-page-note">—</span>}
            </div>
          </div>

          <div>
            <p className="ni-filter-label">
              <span>{t('tag')}</span>
              <b>{String(allTags.length).padStart(2, '0')}</b>
            </p>
            <div className="ni-chips">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag((prev) => (prev === tag ? '' : tag))}
                  aria-pressed={selectedTag === tag}
                  className="ni-chip"
                >
                  {tag}
                </button>
              ))}
              {allTags.length === 0 && <span className="ni-page-note">—</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="ni-section" aria-labelledby="ni-search-results">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">02</span>
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
              {selectedCategory && (
                <button type="button" onClick={() => setSelectedCategory('')} className="ni-active-filter">
                  {t('category')}: {selectedCategory}
                  <X aria-hidden="true" className="size-3" />
                </button>
              )}
              {selectedTag && (
                <button type="button" onClick={() => setSelectedTag('')} className="ni-active-filter">
                  {t('tag')}: {selectedTag}
                  <X aria-hidden="true" className="size-3" />
                </button>
              )}
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
