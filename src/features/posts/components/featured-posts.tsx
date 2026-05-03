'use client'

import { useState } from 'react'
import { CommentDisplay } from '@/src/features/engagement/components'
import { ViewDisplay } from '@/src/features/engagement/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Calendar, Clock, Loader2 } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { cn } from '@/src/shared/utils'
import { GlassCard } from '@/src/shared/components'
import { FadeIn, StaggerContainer, StaggerItem } from '@/src/shared/components'
import { useTranslations } from 'next-intl'

interface FeaturedPostsProps {
  posts: PostSummaryWithViews[]
}

function FeaturedCard({ post, idx }: { post: PostSummaryWithViews; idx: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const accentColors = ['border-l-primary', 'border-l-secondary', 'border-l-accent']

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setLoading(true)
    router.push(`/posts/${post.slug}`)
  }

  return (
    <Link href={`/posts/${post.slug}`} onClick={handleClick} className="group relative block h-full cursor-pointer">
      <GlassCard
        hoverEffect={!loading}
        className={cn(
          'flex h-full flex-col justify-between space-y-5 border-l-[3px] p-6',
          accentColors[idx % accentColors.length],
          loading && 'pointer-events-none opacity-80',
        )}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs tracking-wide text-muted-foreground">
            <span className="flex items-center gap-1.5 font-sans">
              <Calendar className="size-3.5" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5 font-sans">
              <Clock className="size-3.5" />
              {post.readTime.text}
            </span>
            <ViewDisplay views={post.views} />
            <CommentDisplay comments={post.comments} />
          </div>
          <h3 className="line-clamp-2 font-serif text-xl/snug font-bold transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="line-clamp-3 font-serif text-sm/relaxed text-muted-foreground">{post.summary}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-sm border border-border/60 bg-muted/50 px-2 py-0.5 font-sans text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      </GlassCard>

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[--radius] bg-card/60 backdrop-blur-[1px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </Link>
  )
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  const t = useTranslations('HomePage.featuredPosts')
  const router = useRouter()
  const [viewAllLoading, setViewAllLoading] = useState(false)

  const handleViewAll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setViewAllLoading(true)
    router.push('/posts')
  }

  return (
    <section className="space-y-8">
      <FadeIn className="flex items-end justify-between border-b border-border/40 pb-3" delay={0.4}>
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="font-serif text-sm text-muted-foreground italic">{t('description')}</p>
        </div>
        <Link
          href="/posts"
          onClick={handleViewAll}
          className="group flex items-center gap-1.5 font-sans text-xs font-medium tracking-wider text-primary uppercase transition-colors hover:text-accent"
        >
          {t('viewAll')}
          {viewAllLoading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          )}
        </Link>
      </FadeIn>

      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" delay={0.5}>
        {posts.map((post, idx) => (
          <StaggerItem key={post.slug}>
            <FeaturedCard post={post} idx={idx} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}
