import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useTranslations } from '@/src/i18n/client'
import { BookOpen, Eye, MessageCircle } from 'lucide-react'

interface PostItemProps {
  post: PostSummaryWithViews
  idx?: number
}

export function PostItem({ post, idx }: PostItemProps) {
  const t = useTranslations('PostsPage')
  const readingTime = Math.ceil(post.readTime.minutes)
  const index = idx !== undefined ? String(idx + 1).padStart(2, '0') : '—'

  return (
    <Link href={`/posts/${post.slug}`} className="ni-entry">
      <span className="ni-entry-index ni-mono" aria-hidden="true">
        {index}
      </span>
      <div>
        <div className="ni-entry-head">
          <h3 className="ni-entry-title">{post.title}</h3>
        </div>
        <p className="ni-entry-summary">{post.summary}</p>
        <div className="ni-entry-meta">
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
          {post.aiAssisted && <span>{t('aiAssisted')}</span>}
        </div>
      </div>
      <span className="ni-entry-arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  )
}
