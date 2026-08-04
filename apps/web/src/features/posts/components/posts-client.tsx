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
      <h1 className="page-title">{t('title')}</h1>
      <p className="page-subtitle">{t('description')}</p>

      <div className="posts-layout">
        <div className="search-results">
          {posts.map((post, idx) => (
            <PostItem key={post.slug} post={post} idx={idx} />
          ))}
          {posts.length === 0 && <div className="empty-state">{t('noPosts')}</div>}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="sidebar-panel">
            <h3 className="sidebar-title">{t('categories')}</h3>
            <div className="sidebar-list">
              {allCategories.map((category) => {
                const href = `/search?category=${encodeURIComponent(category)}`
                return (
                  <Link key={category} href={href} className="sidebar-link">
                    <Folder className="size-3.5 text-primary" />
                    {category}
                  </Link>
                )
              })}
              {allCategories.length === 0 && <span className="text-xs text-muted-foreground">{t('noCategories')}</span>}
            </div>
          </div>

          <div className="sidebar-panel">
            <h3 className="sidebar-title">{t('tags')}</h3>
            <div className="chip-row">
              {allTags.map((tag) => {
                const href = `/search?tag=${encodeURIComponent(tag)}`
                return (
                  <Link key={tag} href={href} className="chip">
                    {tag}
                  </Link>
                )
              })}
              {allTags.length === 0 && <span className="text-xs text-muted-foreground">{t('noTags')}</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
