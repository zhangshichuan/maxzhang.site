'use client'

import { useState } from 'react'
import { CommentDisplay } from '@/src/features/engagement/components'
import { ViewDisplay } from '@/src/features/engagement/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { ArrowRight, Calendar, Clock, Loader2 } from 'lucide-react'
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

  const tagColors = [
    'bg-secondary text-secondary-foreground border-border',
    'bg-primary text-primary-foreground border-border',
    'bg-accent text-accent-foreground border-border',
    'bg-blue-400 text-white border-border',
    'bg-emerald-400 text-white border-border',
  ]

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
          'flex h-full flex-col justify-between space-y-6 p-8',
          loading && 'pointer-events-none opacity-80',
        )}
      >
        <div className="space-y-4">
          <div
            className="
        flex flex-wrap items-center gap-3 text-xs font-bold tracking-widest
        text-muted-foreground uppercase
      "
          >
            <span
              className="
          flex items-center gap-1.5 rounded-md bg-muted px-2 py-1
        "
            >
              <Calendar className="size-3.5" />
              {post.date}
            </span>
            <span
              className="
          flex items-center gap-1.5 rounded-md bg-muted px-2 py-1
        "
            >
              <Clock className="size-3.5" />
              {post.readTime.text}
            </span>
            <ViewDisplay views={post.views} />
            <CommentDisplay comments={post.comments} />
          </div>
          <h3
            className="
         line-clamp-2 text-2xl/tight font-black transition-colors
         group-hover:text-primary
       "
          >
            {post.title}
          </h3>
          <p
            className="
         line-clamp-3 leading-relaxed font-medium text-muted-foreground
       "
          >
            {post.summary}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-4">
          {post.tags.map((tag, tIdx) => (
            <span
              key={tag}
              className={cn(
                `
            inline-flex items-center rounded-lg border-2 px-3 py-1 text-xs
            font-black tracking-tight uppercase
            shadow-[2px_2px_0px_rgba(0,0,0,1)]
          `,
                tagColors[(idx + tIdx) % tagColors.length],
              )}
            >
              {tag}
            </span>
          ))}
        </div>
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
    <section className="space-y-10">
      <FadeIn
        className="
     flex items-end justify-between border-b-4 border-border pb-4
   "
        delay={0.4}
      >
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">
            {t('title')} {/* HomePage/featuredPosts/title 最新文章 */}
          </h2>
          <p className="font-medium text-muted-foreground">
            {t('description')} {/* HomePage/featuredPosts/description 探索技术与创意的边界 */}
          </p>
        </div>
        <Link
          href="/posts"
          onClick={handleViewAll}
          className="
      group flex items-center gap-2 text-sm font-black tracking-widest
      text-primary uppercase transition-colors
      hover:text-accent
    "
        >
          {t('viewAll')} {/* HomePage/featuredPosts/viewAll 查看全部 */}{' '}
          {viewAllLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight
              className="
       size-4 transition-transform
       group-hover:translate-x-1
     "
            />
          )}
        </Link>
      </FadeIn>

      <StaggerContainer
        className="
     grid gap-8
     sm:grid-cols-2
     lg:grid-cols-3
   "
        delay={0.5}
      >
        {posts.map((post, idx) => (
          <StaggerItem key={post.slug}>
            <FeaturedCard post={post} idx={idx} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}
