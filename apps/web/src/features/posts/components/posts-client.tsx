import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useTranslations } from '@/src/i18n/client'
import { Folder } from 'lucide-react'

interface PostsClientProps {
  posts: PostSummaryWithViews[]
  allTags: string[]
  allCategories: string[]
}

export function PostsClient({ posts, allTags, allCategories }: PostsClientProps) {
  const t = useTranslations('PostsPage')

  return (
    <div>
      <h1 className="page-title">[Article library]</h1>
      <div className="sec-head">
        <span className="bracket">[All articles]</span>
        <div className="line"></div>
      </div>

      <div className="posts-layout">
        <div
          className="proj-grid"
          style={{ gridTemplateColumns: '1fr', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {posts.map((post, idx) => (
            <PostItem key={post.slug} post={post} idx={idx} />
          ))}
          {posts.length === 0 && <div className="empty-state">{t('noPosts')}</div>}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glitch-panel">
            <h3>{t('categories')}</h3>
            {allCategories.map((category) => {
              const href = `/search?category=${encodeURIComponent(category)}`
              return (
                <Link key={category} href={href} className="glitch-link">
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
                  <Link key={tag} href={href} className="glitch-filter-btn">
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
