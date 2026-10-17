import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useTranslations } from '@/src/i18n/client'
import { PostItem } from './post-item'

interface FeaturedPostsProps {
  posts: PostSummaryWithViews[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  const t = useTranslations('HomePage.featuredPosts')

  return (
    <section>
      <div className="nx-block-head">
        <div className="nx-block-left">
          <span className="nx-block-index">01 — {t('title')}</span>
          <span className="nx-block-side">{t('description')}</span>
        </div>
        <Link href="/posts" className="nx-more">
          {t('viewAll')} →
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
