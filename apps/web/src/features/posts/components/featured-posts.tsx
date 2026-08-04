import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useTranslations } from '@/src/i18n/client'
import { ChevronRight } from 'lucide-react'
import { PostItem } from './post-item'

interface FeaturedPostsProps {
  posts: PostSummaryWithViews[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  const t = useTranslations('HomePage.featuredPosts')

  return (
    <section>
      <div className="section-head">
        <span className="section-title">{t('title')}</span>
        <div className="section-line"></div>
        <Link href="/posts" className="inline-flex items-center gap-0.5 text-sm font-medium text-primary no-underline">
          {t('viewAll')}
          <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="featured-grid">
        {posts.map((post, idx) => (
          <PostItem key={post.slug} post={post} idx={idx} />
        ))}
      </div>
    </section>
  )
}
