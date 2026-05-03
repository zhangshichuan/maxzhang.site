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

  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [selectedTag, setSelectedTag] = useState(() => searchParams.get('tag') || '')
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || '')

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
    if (!query && !selectedTag && !selectedCategory) {
      return []
    }

    let results = posts

    if (query) {
      const fuseResults = fuse.search(query)
      results = fuseResults.map((result) => result.item)
    }

    if (selectedTag) {
      results = results.filter((post) => post.tags.includes(selectedTag))
    }

    if (selectedCategory) {
      results = results.filter((post) => post.category === selectedCategory)
    }

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? '' : tag))
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? '' : category))
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedTag('')
    setSelectedCategory('')
  }

  const clearTag = () => {
    setSelectedTag('')
  }

  const clearCategory = () => {
    setSelectedCategory('')
  }

  const hasFilters = Boolean(query || selectedTag || selectedCategory)

  return (
    <div className="space-y-8">
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground/50" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder={t('placeholder')}
          className="w-full rounded-md border border-border/60 bg-card py-3 pr-4 pl-10 font-serif text-base transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* 分类和标签 */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-foreground">{t('category')}</h3>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-sans text-xs font-medium tracking-wide transition-colors focus:outline-none ${
                  selectedCategory === category
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border/40 bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-foreground">{t('tag')}</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-sans text-xs font-medium tracking-wide transition-colors focus:outline-none ${
                  selectedTag === tag
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border/40 bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 当前筛选条件 */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
          <span className="font-serif text-sm text-muted-foreground">{t('currentFilter')}:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 rounded-sm border border-primary/20 bg-primary/5 px-2 py-1 font-sans text-xs font-medium text-primary">
              {t('category')}: {selectedCategory}
              <button onClick={clearCategory} className="ml-1 hover:text-primary/70">
                <X className="size-3" />
              </button>
            </span>
          )}
          {selectedTag && (
            <span className="inline-flex items-center gap-1 rounded-sm border border-primary/20 bg-primary/5 px-2 py-1 font-sans text-xs font-medium text-primary">
              {t('tag')}: {selectedTag}
              <button onClick={clearTag} className="ml-1 hover:text-primary/70">
                <X className="size-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="font-serif text-xs text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-primary"
          >
            {t('clearAll')}
          </button>
        </div>
      )}

      {/* 搜索结果状态 */}
      {hasFilters && (
        <div className="font-serif text-sm text-muted-foreground italic">
          {t('found', { count: filteredPosts.length })}
        </div>
      )}

      {/* 文章列表 */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <PostItem key={post.slug} post={post} />
        ))}

        {hasFilters && filteredPosts.length === 0 && (
          <div className="py-20 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/20" />
            <p className="font-serif text-lg text-muted-foreground italic">{t('noResults')}</p>
            <button
              onClick={clearFilters}
              className="mt-4 font-serif text-sm text-primary underline decoration-dotted underline-offset-4 hover:text-primary/80"
            >
              {t('clearFilters')}
            </button>
          </div>
        )}

        {!hasFilters && (
          <div className="py-20 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/10" />
            <p className="font-serif text-lg text-muted-foreground italic">{t('startSearch')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
