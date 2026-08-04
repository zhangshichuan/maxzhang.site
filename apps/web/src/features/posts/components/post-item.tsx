import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link } from '@/src/i18n/client'
import { BookOpen, Eye, MessageCircle } from 'lucide-react'

interface PostItemProps {
  post: PostSummaryWithViews
  idx?: number
}

export function PostItem({ post, idx }: PostItemProps) {
  const readingTime = Math.ceil(post.readTime.minutes)

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
