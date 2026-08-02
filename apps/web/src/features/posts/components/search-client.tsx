'use client'

import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

interface SearchClientProps {
  posts: PostSummaryWithViews[]
}

export function SearchClient({ posts }: SearchClientProps) {
  const searchParams = useSearchParams()
  const t = useTranslations('SearchPage')

  const [query, setQuery] = useState(() => searchParams?.get('q') || '')
  const [selectedTag, setSelectedTag] = useState(() => searchParams?.get('tag') || '')
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams?.get('category') || '')

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="sec-head">
        <span className="bracket">[Search]</span>
        <div className="line"></div>
      </div>

      <div style={{ position: 'relative' }}>
        <Search
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
            color: 'rgba(255,255,255,.2)',
          }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('placeholder')}
          className="glitch-input"
          style={{ paddingLeft: 44 }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: 'rgba(255,255,255,.4)',
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      <div className="search-layout">
        <div>
          <div className="page-title" style={{ marginBottom: 12 }}>
            {t('category')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory((prev) => (prev === category ? '' : category))}
                className={`glitch-filter-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="page-title" style={{ marginBottom: 12 }}>
            {t('tag')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag((prev) => (prev === tag ? '' : tag))}
                className={`glitch-filter-btn ${selectedTag === tag ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderTop: '1px solid rgba(255,255,255,.05)',
            paddingTop: 16,
          }}
        >
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{t('currentFilter')}:</span>
          {selectedCategory && (
            <span
              style={{
                fontSize: 10,
                color: 'var(--cyan)',
                border: '1px solid rgba(0,229,255,.2)',
                padding: '3px 10px',
                textTransform: 'uppercase',
              }}
            >
              {t('category')}: {selectedCategory}
            </span>
          )}
          {selectedTag && (
            <span
              style={{
                fontSize: 10,
                color: 'var(--cyan)',
                border: '1px solid rgba(0,229,255,.2)',
                padding: '3px 10px',
                textTransform: 'uppercase',
              }}
            >
              {t('tag')}: {selectedTag}
            </span>
          )}
          <button
            onClick={clearFilters}
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {t('clearAll')}
          </button>
        </div>
      )}

      {hasFilters && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{t('found', { count: filteredPosts.length })}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredPosts.map((post) => (
          <PostItem key={post.slug} post={post} />
        ))}

        {hasFilters && filteredPosts.length === 0 && (
          <div className="empty-state">
            <Search style={{ width: 32, height: 32, margin: '0 auto 16px', color: 'rgba(255,255,255,.05)' }} />
            <p>{t('noResults')}</p>
            <button
              onClick={clearFilters}
              style={{
                marginTop: 16,
                fontSize: 12,
                color: 'var(--cyan)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {t('clearFilters')}
            </button>
          </div>
        )}

        {!hasFilters && (
          <div className="empty-state">
            <Search style={{ width: 32, height: 32, margin: '0 auto 16px', color: 'rgba(255,255,255,.05)' }} />
            <p>{t('startSearch')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
