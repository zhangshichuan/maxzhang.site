'use client'

import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link } from '@/i18n/routing'

interface PostItemProps {
  post: PostSummaryWithViews
  idx?: number
}

export function PostItem({ post, idx }: PostItemProps) {
  const readingTime = Math.ceil(post.readTime.minutes)

  return (
    <Link href={`/posts/${post.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="proj">
        <div className="idx">{String((idx ?? 0) + 1).padStart(2, '0')}</div>
        <h3>{post.title}</h3>
        <p>
          {post.date} · {readingTime} min read
        </p>
        <p style={{ marginTop: 8 }}>{post.summary}</p>
        <div className="tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
