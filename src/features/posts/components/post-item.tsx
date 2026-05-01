'use client'

import { useState } from 'react'
import { CommentDisplay } from '@/src/features/engagement/components'
import { ViewDisplay } from '@/src/features/engagement/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { useRouter, Link } from '@/i18n/routing'
import { GlassCard } from '@/src/shared/components'
import { cn } from '@/src/shared/utils'
import { ArrowRight, Calendar, Clock, Folder, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PostItemProps {
  post: PostSummaryWithViews
}

export function PostItem({ post }: PostItemProps) {
  const t = useTranslations('Common')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const tagColors = [
    'bg-secondary text-secondary-foreground border-border',
    'bg-primary text-primary-foreground border-border',
    'bg-accent text-accent-foreground border-border',
  ]

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
          'border-2 border-border/10 p-8 transition-all duration-300',
          'group-hover:bg-secondary/5',
          'hover:border-primary',
          loading && 'pointer-events-none opacity-80',
        )}
      >
        <article className="flex flex-col space-y-4">
          <div
            className="
        flex flex-wrap items-center gap-4 text-xs font-black tracking-widest
        text-muted-foreground uppercase
      "
          >
            <time
              dateTime={post.date}
              className="
          flex items-center gap-1.5 rounded-md border border-border/5 bg-muted
          px-2 py-1
        "
            >
              <Calendar className="size-4" />
              {post.date}
            </time>
            <span
              className="
         flex items-center gap-1.5 rounded-md border border-border/5 bg-muted
         px-2 py-1
       "
            >
              <Clock className="size-4" />
              {t('readingTime', { minutes: readingTime })}
            </span>
            <ViewDisplay views={post.views} />
            <CommentDisplay comments={post.comments} />
            {post.category && (
              <span
                className="
          flex items-center gap-1.5 rounded-md border border-primary/10
          bg-primary/10 px-2 py-1 text-primary
        "
              >
                <Folder className="size-4" />
                {post.category}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2
              className="
         flex items-center justify-between text-3xl font-black tracking-tight
         transition-colors
         group-hover:text-primary
       "
            >
              {post.title}
              <ArrowRight
                className="
          h-6 w-6 -translate-x-4 text-primary opacity-0 transition-all
          group-hover:translate-x-0 group-hover:opacity-100
        "
              />
            </h2>
            <p
              className="
         line-clamp-2 border-l-4 border-muted pl-4 text-lg/relaxed font-medium
         text-muted-foreground italic
       "
            >
              {post.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag, tIdx) => (
              <span
                key={tag}
                className={cn(
                  `
            inline-flex items-center rounded-lg border-2 px-3 py-1 text-[10px]
            font-black tracking-tight uppercase
            shadow-[2px_2px_0px_var(--border)] transition-all
            group-hover:translate-px
            group-hover:shadow-none
          `,
                  tagColors[tIdx % tagColors.length],
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </article>
      </GlassCard>

      {loading && (
        <div className="bg-card/60 absolute inset-0 z-20 flex items-center justify-center rounded-[--radius] backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-black tracking-widest text-muted-foreground uppercase">Loading</span>
          </div>
        </div>
      )}
    </Link>
  )
}
