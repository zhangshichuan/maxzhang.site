'use client'

import { useState } from 'react'
import { CommentDisplay } from '@/src/features/engagement/components'
import { ViewDisplay } from '@/src/features/engagement/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { useRouter, Link } from '@/i18n/routing'
import { GlassCard } from '@/src/shared/components'
import { cn } from '@/src/shared/utils'
import { Calendar, Clock, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PostItemProps {
  post: PostSummaryWithViews
}

export function PostItem({ post }: PostItemProps) {
  const t = useTranslations('Common')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const readingTime = Math.ceil(post.readTime.minutes)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setLoading(true)
    router.push(`/posts/${post.slug}`)
  }

  return (
    <Link href={`/posts/${post.slug}`} onClick={handleClick} className="group relative block cursor-pointer">
      <GlassCard
        hoverEffect={!loading}
        className={cn(
          'border-l-[3px] border-l-primary/30 p-6 transition-all duration-300',
          'group-hover:border-l-primary',
          loading && 'pointer-events-none opacity-80',
        )}
      >
        <article className="flex flex-col space-y-3">
          {/* 元信息行 */}
          <div className="flex flex-wrap items-center gap-4 font-sans text-xs tracking-wide text-muted-foreground">
            <time dateTime={post.date} className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {post.date}
            </time>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {t('readingTime', { minutes: readingTime })}
            </span>
            <ViewDisplay views={post.views} />
            <CommentDisplay comments={post.comments} />
            {post.category && (
              <span className="flex items-center gap-1 rounded-sm bg-muted/50 px-2 py-0.5 text-primary">
                {post.category}
              </span>
            )}
          </div>

          {/* 标题与摘要 */}
          <div className="space-y-2">
            <h2 className="font-serif text-2xl/snug font-bold tracking-tight transition-colors group-hover:text-primary">
              {post.title}
            </h2>
            <p className="line-clamp-2 border-l-2 border-border/40 pl-4 font-serif text-base/relaxed text-muted-foreground italic">
              {post.summary}
            </p>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-sm border border-border/40 bg-muted/30 px-2 py-0.5 font-sans text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </article>
      </GlassCard>

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[--radius] bg-card/60 backdrop-blur-[1px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </Link>
  )
}
