'use client'

import { GlassCard } from '@/components/glass-card'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'
import { PostItem } from '@/components/post-item'
import { Link } from '@/i18n/routing'
import { PostSummary } from '@/lib/posts'
import { ArrowRight, Folder } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PostsClientProps {
	posts: PostSummary[]
	allTags: string[]
	allCategories: string[]
	locale: string
}

export function PostsClient({ posts, allTags, allCategories, locale }: PostsClientProps) {
	const t = useTranslations('PostsPage')

	return (
		<div className="container mx-auto max-w-screen-2xl px-4 py-10">
			{/* 页面标题区域 */}
			<FadeIn
				className="
     mb-12 flex flex-col items-start gap-4 border-b-4 border-border pb-12
   "
			>
				<h1
					className="
      text-5xl font-black tracking-tight
      sm:text-6xl
    "
				>
					{t('title')}
				</h1>
				<p className="text-xl font-medium text-muted-foreground">{t('description')}</p>
			</FadeIn>

			{/* 主内容区域 */}
			<div
				className="
     grid gap-12
     sm:grid-cols-1
     lg:grid-cols-[2fr_1fr]
   "
			>
				{/* 左侧：文章列表 */}
				<StaggerContainer className="space-y-10" delay={0.2}>
					{posts.map((post) => (
						<StaggerItem key={post.slug}>
							<PostItem post={post} locale={locale} />
						</StaggerItem>
					))}
					{posts.length === 0 && (
						<GlassCard className="p-12 text-center">
							<p className="text-xl font-bold text-muted-foreground">{t('noPosts')}</p>
						</GlassCard>
					)}
				</StaggerContainer>

				{/* 右侧：侧边栏 */}
				<aside className="space-y-10">
					<FadeIn
						className="
       sticky top-24 hidden space-y-10
       lg:block
     "
						delay={0.4}
					>
						{/* 热门分类模块 */}
						<GlassCard className="p-8">
							<h3 className="mb-6 flex items-center gap-2 text-xl font-black">{t('categories')}</h3>
							<div className="flex flex-col gap-3">
								{allCategories.map((category) => (
									<Link
										key={category}
										href={`/search?category=${encodeURIComponent(category)}`}
										className="
            flex items-center justify-between rounded-xl border-2
            border-transparent p-3 text-base font-bold transition-all
            hover:border-border hover:bg-secondary/20 hover:text-primary
          "
									>
										<span className="flex items-center gap-3">
											<Folder className="h-5 w-5 text-primary" />
											{category}
										</span>
										<ArrowRight
											className="
            size-4 opacity-0 transition-opacity
            group-hover:opacity-100
          "
										/>
									</Link>
								))}
								{allCategories.length === 0 && (
									<p
										className="
          text-sm font-medium text-muted-foreground italic
        "
									>
										{t('noCategories')}
									</p>
								)}
							</div>
						</GlassCard>

						{/* 热门标签模块 */}
						<GlassCard className="p-8">
							<h3 className="mb-6 flex items-center gap-2 text-xl font-black">{t('tags')}</h3>
							<div className="flex flex-wrap gap-3">
								{allTags.map((tag) => (
									<Link
										key={tag}
										href={`/search?tag=${encodeURIComponent(tag)}`}
										className="
            bg-card inline-flex items-center rounded-xl border-2 border-border
            px-4 py-1.5 text-xs font-black text-foreground
            shadow-[3px_3px_0px_var(--border)] transition-all
            hover:translate-x-px hover:translate-y-px hover:shadow-none
          "
									>
										{tag}
									</Link>
								))}
								{allTags.length === 0 && (
									<p
										className="
          text-sm font-medium text-muted-foreground italic
        "
									>
										{t('noTags')}
									</p>
								)}
							</div>
						</GlassCard>
					</FadeIn>
				</aside>
			</div>
		</div>
	)
}
