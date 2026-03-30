'use client'

import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { GlassCard } from '@/components/glass-card'
import { cn } from '@/lib/utils'
import { PostSummaryWithViews } from '@/lib/posts'
import { useTranslations } from 'next-intl'

import { ViewDisplay } from '@/components/view-display'
import { CommentDisplay } from '@/components/comment-display'

interface FeaturedPostsProps {
  posts: PostSummaryWithViews[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  const t = useTranslations('HomePage.featuredPosts')
  const tagColors = [
    'bg-secondary text-secondary-foreground border-border',
    'bg-primary text-primary-foreground border-border',
    'bg-accent text-accent-foreground border-border',
    'bg-blue-400 text-white border-border',
    'bg-emerald-400 text-white border-border',
  ]

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
          className="
      group flex items-center gap-2 text-sm font-black tracking-widest
      text-primary uppercase transition-colors
      hover:text-accent
    "
        >
          {t('viewAll')} {/* HomePage/featuredPosts/viewAll 查看全部 */}{' '}
          <ArrowRight
            className="
       size-4 transition-transform
       group-hover:translate-x-1
     "
          />
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
            <Link href={`/posts/${post.slug}`} className="group block h-full">
              <GlassCard className="flex h-full flex-col justify-between space-y-6 p-8">
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
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  )
}
