import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { useTranslations } from '@/src/i18n/client'
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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="page-title">{t('title')}</h1>
      </div>

      <div className="search-field-wrap">
        <Search
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
            color: 'var(--label-tertiary)',
          }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('placeholder')}
          className="search-field"
          style={{ paddingLeft: 44 }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="search-clear" aria-label={t('clearAll')}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      <div className="search-layout">
        <div>
          <div className="sidebar-title" style={{ marginBottom: 10 }}>
            {t('category')}
          </div>
          <div className="chip-row">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory((prev) => (prev === category ? '' : category))}
                className={`filter-chip ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="sidebar-title" style={{ marginBottom: 10 }}>
            {t('tag')}
          </div>
          <div className="chip-row">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag((prev) => (prev === tag ? '' : tag))}
                className={`filter-chip ${selectedTag === tag ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: 'var(--separator)' }}>
          <span style={{ fontSize: 12, color: 'var(--label-secondary)' }}>{t('currentFilter')}:</span>
          {selectedCategory && (
            <span className="chip chip-accent">
              {t('category')}: {selectedCategory}
            </span>
          )}
          {selectedTag && (
            <span className="chip chip-accent">
              {t('tag')}: {selectedTag}
            </span>
          )}
          <button
            onClick={clearFilters}
            className="cursor-pointer border-none bg-transparent text-sm text-primary underline"
          >
            {t('clearAll')}
          </button>
        </div>
      )}

      {hasFilters && (
        <div style={{ fontSize: 13, color: 'var(--label-secondary)' }}>
          {t('found', { count: filteredPosts.length })}
        </div>
      )}

      <div className="search-results">
        {filteredPosts.map((post, idx) => (
          <PostItem key={post.slug} post={post} idx={idx} />
        ))}

        {hasFilters && filteredPosts.length === 0 && (
          <div className="empty-state">
            <Search style={{ width: 32, height: 32, margin: '0 auto 16px', color: 'var(--label-tertiary)' }} />
            <p>{t('noResults')}</p>
            <button
              onClick={clearFilters}
              className="mt-4 cursor-pointer border-none bg-transparent text-sm text-primary underline"
            >
              {t('clearFilters')}
            </button>
          </div>
        )}

        {!hasFilters && (
          <div className="empty-state">
            <Search style={{ width: 32, height: 32, margin: '0 auto 16px', color: 'var(--label-tertiary)' }} />
            <p>{t('startSearch')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
