'use client'

import { FadeIn } from '@/components/motion-wrapper'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export function HomeHero() {
	const t = useTranslations('HomePage.hero')

	return (
		<section
			className="
    relative flex flex-col items-start gap-8 pt-10
    md:pt-20
    lg:pt-32
  "
		>
			{/* 浮动勋章 */}
			<div
				className="
     absolute -top-4 right-10 hidden rotate-12
     lg:block
   "
			>
				<div className="group relative">
					<div
						className="
       absolute inset-0 rounded-2xl bg-accent shadow-[4px_4px_0px_#000]
       transition-transform duration-500
       group-hover:rotate-6
     "
					></div>
					<div
						className="
       relative flex items-center gap-2 rounded-2xl border-2 border-border
       bg-secondary p-4
     "
					>
						<Sparkles className="h-5 w-5 animate-pulse text-primary" />
						<span className="text-sm font-black tracking-widest uppercase">Available for Hire</span>
					</div>
				</div>
			</div>

			<FadeIn className="flex max-w-full flex-col gap-4">
				<h1
					className="
      max-w-full text-4xl leading-[1.2] font-black tracking-tight text-foreground
      sm:text-6xl
      xl:text-8xl/none
    "
				>
					Hi, I&apos;m{' '}
					<span
						className="
       inline-block bg-linear-to-r from-primary via-accent to-secondary
       bg-clip-text pb-3.5 text-transparent
     "
					>
						Max Zhang
					</span>
				</h1>
				<p
					className="
      max-w-180 leading-relaxed font-medium text-muted-foreground
      md:text-2xl
    "
				>
					Build with Purpose. Power with AI.
				</p>
			</FadeIn>

			<FadeIn className="flex flex-wrap gap-6" delay={0.2}>
				<Link href="/posts">
					<Button size="xl" className="cursor-pointer bg-primary text-lg font-black">
						{t('readArticles')} {/* HomePage/hero/readArticles 阅读文章 */} <ArrowRight className="ml-2 h-5 w-5" />
					</Button>
				</Link>
				<Link href="/about">
					<Button
						variant="outline"
						size="xl"
						className="
        cursor-pointer border-2 border-border text-lg font-black
        shadow-[6px_6px_0px_var(--muted)]
      "
					>
						{t('aboutMe')} {/* HomePage/hero/aboutMe 关于我 */}
					</Button>
				</Link>
			</FadeIn>
		</section>
	)
}
