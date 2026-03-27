import { GlassCard } from '@/components/glass-card'
import { PostSummaryWithViews } from '@/lib/posts'
import { cn } from '@/lib/utils'
import { ArrowRight, Calendar, Clock, Folder } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

import { ViewDisplay } from '@/components/view-display'

interface PostItemProps {
	post: PostSummaryWithViews
}

export function PostItem({ post }: PostItemProps) {
	const t = useTranslations('Common')
	const tagColors = [
		'bg-secondary text-secondary-foreground border-border',
		'bg-primary text-primary-foreground border-border',
		'bg-accent text-accent-foreground border-border',
	]

	// Format reading time
	const readingTime = Math.ceil(post.readTime.minutes)

	return (
		<Link href={`/posts/${post.slug}`} className="group block">
			<GlassCard className="
     border-2 border-border/10 p-8 transition-all duration-300
     group-hover:bg-secondary/5
     hover:border-primary
   ">
				<article className="flex flex-col space-y-4">
					<div className="
       flex flex-wrap items-center gap-4 text-xs font-black tracking-widest
       text-muted-foreground uppercase
     ">
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
						<span className="
        flex items-center gap-1.5 rounded-md border border-border/5 bg-muted
        px-2 py-1
      ">
							<Clock className="size-4" />
							{t('readingTime', { minutes: readingTime })}
						</span>
						<ViewDisplay views={post.views} />
						{post.category && (
							<span className="
         flex items-center gap-1.5 rounded-md border border-primary/10
         bg-primary/10 px-2 py-1 text-primary
       ">
								<Folder className="size-4" />
								{post.category}
							</span>
						)}
					</div>

					<div className="space-y-2">
						<h2 className="
        flex items-center justify-between text-3xl font-black tracking-tight
        transition-colors
        group-hover:text-primary
      ">
							{post.title}
							<ArrowRight className="
         h-6 w-6 -translate-x-4 text-primary opacity-0 transition-all
         group-hover:translate-x-0 group-hover:opacity-100
       " />
						</h2>
						<p className="
        line-clamp-2 border-l-4 border-muted pl-4 text-lg/relaxed font-medium
        text-muted-foreground italic
      ">
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
		</Link>
	)
}
