import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useTranslations } from '@/src/i18n/client'
import Fuse from 'fuse.js'
import { BookOpen, Eye, MessageCircle, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import '@/src/styles/paper-search.css'

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
  const tPosts = useTranslations('PostsPage')

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
    <div className="se-page">
      <header className="se-head">
        <p className="se-eyebrow">
          <span className="se-tick" aria-hidden="true" />
          MAX ZHANG<span className="se-slash">/</span>SEARCH
        </p>
        <div className="se-head-grid">
          <h1 className="se-title">{t('title')}</h1>
          <form className="se-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <Search className="se-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('placeholder')}
              aria-label={t('title')}
              autoComplete="off"
              spellCheck={false}
              className="se-input"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="se-clear-btn" aria-label={t('clearAll')}>
                <X aria-hidden="true" />
              </button>
            )}
          </form>
        </div>
      </header>

      <section className="se-filters" aria-label={t('currentFilter')}>
        <div className="se-filter">
          <div className="se-filter-head">
            <span className="se-tick" aria-hidden="true" />
            <p className="se-filter-label">{t('category')}</p>
            <span className="se-filter-count">{String(allCategories.length).padStart(2, '0')}</span>
          </div>
          <div className="se-chips">
            {allCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory((prev) => (prev === category ? '' : category))}
                aria-pressed={selectedCategory === category}
                className={`se-chip${selectedCategory === category ? ' is-active' : ''}`}
              >
                {category}
              </button>
            ))}
            {allCategories.length === 0 && <span className="se-chips-empty">—</span>}
          </div>
        </div>

        <div className="se-filter">
          <div className="se-filter-head">
            <span className="se-tick" aria-hidden="true" />
            <p className="se-filter-label">{t('tag')}</p>
            <span className="se-filter-count">{String(allTags.length).padStart(2, '0')}</span>
          </div>
          <div className="se-chips">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag((prev) => (prev === tag ? '' : tag))}
                aria-pressed={selectedTag === tag}
                className={`se-chip${selectedTag === tag ? ' is-active' : ''}`}
              >
                {tag}
              </button>
            ))}
            {allTags.length === 0 && <span className="se-chips-empty">—</span>}
          </div>
        </div>
      </section>

      {hasFilters && (
        <div className="se-status">
          <p className="se-found" aria-live="polite">
            {t('found', { count: filteredPosts.length })}
          </p>
          <div className="se-active">
            <span className="se-active-label">{t('currentFilter')}</span>
            {selectedCategory && (
              <button type="button" onClick={() => setSelectedCategory('')} className="se-active-chip">
                {t('category')}: {selectedCategory}
                <X aria-hidden="true" />
              </button>
            )}
            {selectedTag && (
              <button type="button" onClick={() => setSelectedTag('')} className="se-active-chip">
                {t('tag')}: {selectedTag}
                <X aria-hidden="true" />
              </button>
            )}
            <button type="button" onClick={clearFilters} className="se-clear-all">
              {t('clearAll')}
            </button>
          </div>
        </div>
      )}

      <div className="se-results">
        {hasFilters ? (
          filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => {
              const readingTime = Math.ceil(post.readTime.minutes)
              return (
                <Link key={post.slug} href={`/posts/${post.slug}`} className="se-result">
                  <span className="se-result-index" aria-hidden="true">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="se-result-main">
                    <h2 className="se-result-title">{post.title}</h2>
                    <div className="se-result-meta">
                      <span>{post.date}</span>
                      <span>
                        <BookOpen aria-hidden="true" />
                        {readingTime} min
                      </span>
                      {typeof post.views === 'number' && (
                        <span>
                          <Eye aria-hidden="true" />
                          {post.views}
                        </span>
                      )}
                      {typeof post.comments === 'number' && (
                        <span>
                          <MessageCircle aria-hidden="true" />
                          {post.comments}
                        </span>
                      )}
                      {post.aiAssisted && <span className="se-result-ai">{tPosts('aiAssisted')}</span>}
                    </div>
                    <p className="se-result-summary">{post.summary}</p>
                    <div className="se-result-tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="se-result-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="se-result-arrow" aria-hidden="true">
                    鈫?                  </span>
                </Link>
              )
            })
          ) : (
            <div className="se-empty">
              <span className="se-empty-mark" aria-hidden="true">
                <Search />
              </span>
              <p className="se-empty-text">{t('noResults')}</p>
              <button type="button" onClick={clearFilters} className="se-empty-clear">
                {t('clearFilters')}
              </button>
            </div>
          )
        ) : (
          <div className="se-empty">
            <span className="se-empty-mark" aria-hidden="true">
              <Search />
            </span>
            <p className="se-empty-text">{t('startSearch')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
