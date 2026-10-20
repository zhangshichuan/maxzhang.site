import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useTranslations } from '@/src/i18n/client'
import { BookOpen, Eye, MessageCircle } from 'lucide-react'

interface PostItemProps {
  post: PostSummaryWithViews
  idx?: number
  variant?: 'default' | 'paper'
}

export function PostItem({ post, idx, variant = 'default' }: PostItemProps) {
  const t = useTranslations('PostsPage')
  const readingTime = Math.ceil(post.readTime.minutes)

  if (variant === 'paper') {
    const index = idx !== undefined ? String(idx + 1).padStart(2, '0') : null

    return (
      <Link href={`/posts/${post.slug}`} className="pp-post">
        <span className="pp-post-index" aria-hidden="true">
          {index ?? '—'}
        </span>
        <div className="pp-post-body">
          <h3 className="pp-post-title">{post.title}</h3>
          <div className="pp-post-meta">
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
            {post.aiAssisted && <span className="pp-post-ai">{t('aiAssisted')}</span>}
          </div>
          <p className="pp-post-summary">{post.summary}</p>
          <div className="pp-post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="pp-post-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <span className="pp-post-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
    )
  }

  return (
    <Link href={`/posts/${post.slug}`} className="post-card">
      <h3 className="post-card-title">{post.title}</h3>
      <div className="post-card-meta">
        <span>{post.date}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <BookOpen className="size-3.5" />
          {readingTime} min
        </span>
        {typeof post.views === 'number' && (
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5" />
            {post.views}
          </span>
        )}
        {typeof post.comments === 'number' && (
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3.5" />
            {post.comments}
          </span>
        )}
        {idx !== undefined && <span>#{String(idx + 1).padStart(2, '0')}</span>}
      </div>
      <p className="post-card-summary">{post.summary}</p>
      <div className="chip-row post-card-footer">
        {post.tags.map((tag) => (
          <span key={tag} className="chip chip-accent">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
