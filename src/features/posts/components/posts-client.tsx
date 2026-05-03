'use client'

import { useState } from 'react'
import { PostItem } from '@/src/features/posts/components'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useRouter } from '@/i18n/routing'
import { GlassCard } from '@/src/shared/components'
import { FadeIn, StaggerContainer, StaggerItem } from '@/src/shared/components'
import { Folder, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PostsClientProps {
  posts: PostSummaryWithViews[]
  allTags: string[]
  allCategories: string[]
}

export function PostsClient({ posts, allTags, allCategories }: PostsClientProps) {
  const t = useTranslations('PostsPage')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setLoading(true)
    router.push(href)
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-6 py-10 md:px-8">
      {/* 页面标题 */}
      <FadeIn className="mb-12 flex flex-col items-start gap-3 border-b border-border/40 pb-8">
        <p className="font-sans text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">{t('title')}</p>
        <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl">{t('title')}</h1>
        <p className="font-serif text-lg text-muted-foreground italic">{t('description')}</p>
      </FadeIn>

      {/* 主内容区域 */}
      <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
        {/* 左侧：文章列表 */}
        <StaggerContainer className="space-y-6" delay={0.2}>
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <PostItem post={post} />
            </StaggerItem>
          ))}
          {posts.length === 0 && (
            <GlassCard className="p-12 text-center">
              <p className="font-serif text-lg text-muted-foreground italic">{t('noPosts')}</p>
            </GlassCard>
          )}
        </StaggerContainer>

        {/* 右侧：侧边栏 */}
        <aside className="space-y-8">
          <FadeIn className="sticky top-24 hidden space-y-8 lg:block" delay={0.4}>
            {/* 分类模块 */}
            <div className="relative">
              <GlassCard className="p-6" hoverEffect={false}>
                <h3 className="mb-5 font-serif text-lg font-bold tracking-tight">{t('categories')}</h3>
                <div className="flex flex-col gap-1">
                  {allCategories.map((category) => {
                    const href = `/search?category=${encodeURIComponent(category)}`
                    return (
                      <Link
                        key={category}
                        href={href}
                        onClick={(e) => handleNavigate(e, href)}
                        className="group flex cursor-pointer items-center justify-between rounded-sm px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50"
                      >
                        <span className="flex items-center gap-2.5">
                          <Folder className="size-4 text-primary/60" />
                          <span className="font-serif">{category}</span>
                        </span>
                      </Link>
                    )
                  })}
                  {allCategories.length === 0 && (
                    <p className="px-3 py-2 font-serif text-sm text-muted-foreground italic">{t('noCategories')}</p>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* 标签模块 */}
            <div className="relative">
              <GlassCard className="p-6" hoverEffect={false}>
                <h3 className="mb-5 font-serif text-lg font-bold tracking-tight">{t('tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const href = `/search?tag=${encodeURIComponent(tag)}`
                    return (
                      <Link
                        key={tag}
                        href={href}
                        onClick={(e) => handleNavigate(e, href)}
                        className="inline-flex cursor-pointer items-center rounded-sm border border-border/40 bg-card px-3 py-1 font-sans text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        {tag}
                      </Link>
                    )
                  })}
                  {allTags.length === 0 && (
                    <p className="font-serif text-sm text-muted-foreground italic">{t('noTags')}</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </FadeIn>
        </aside>
      </div>
    </div>
  )
}
