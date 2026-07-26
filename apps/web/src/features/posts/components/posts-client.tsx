'use client'

import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useRouter } from '@/i18n/routing'
import { Folder } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PostsClientProps {
  posts: PostSummaryWithViews[]
  allTags: string[]
  allCategories: string[]
}

export function PostsClient({ posts, allTags, allCategories }: PostsClientProps) {
  const t = useTranslations('PostsPage')
  const router = useRouter()

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    router.push(href)
  }

  return (
    <div>
      <div className="page-title">[Article library]</div>
      <div className="sec-head">
        <span className="bracket">[All articles]</span>
        <div className="line"></div>
      </div>

      <div className="posts-layout">
        <div
          className="proj-grid"
          style={{ gridTemplateColumns: '1fr', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {posts.map((post) => (
            <PostItem key={post.slug} post={post} />
          ))}
          {posts.length === 0 && <div className="empty-state">{t('noPosts')}</div>}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glitch-panel">
            <h3>{t('categories')}</h3>
            {allCategories.map((category) => {
              const href = `/search?category=${encodeURIComponent(category)}`
              return (
                <Link
                  key={category}
                  href={href}
                  prefetch={false}
                  onClick={(e) => handleNavigate(e, href)}
                  className="glitch-link"
                >
                  <Folder style={{ width: 14, height: 14, color: 'var(--cyan)' }} />
                  {category}
                </Link>
              )
            })}
          </div>

          <div className="glitch-panel">
            <h3>{t('tags')}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allTags.map((tag) => {
                const href = `/search?tag=${encodeURIComponent(tag)}`
                return (
                  <Link
                    key={tag}
                    href={href}
                    prefetch={false}
                    onClick={(e) => handleNavigate(e, href)}
                    className="glitch-filter-btn"
                  >
                    {tag}
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
