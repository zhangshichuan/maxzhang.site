'use client'

import { FadeIn } from '@/components/motion-wrapper'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function HomeHero() {
	return (
		<section className="relative flex flex-col items-start gap-8 pt-10 md:pt-20 lg:pt-32">
			{/* 浮动勋章 */}
			<div className="absolute -top-4 right-10 hidden lg:block rotate-12">
				<div className="relative group">
					<div className="absolute inset-0 bg-accent rounded-2xl group-hover:rotate-6 transition-transform duration-500 shadow-[4px_4px_0px_#000]"></div>
					<div className="relative bg-secondary border-2 border-border p-4 rounded-2xl flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-primary animate-pulse" />
						<span className="font-black text-sm uppercase tracking-widest">Available for Hire</span>
					</div>
				</div>
			</div>

			<FadeIn className="flex flex-col gap-4">
				<h1 className="text-4xl font-black tracking-tight sm:text-6xl xl:text-8xl/none text-foreground leading-[1.2]">
					Hi, I&apos;m{' '}
					<span className="inline-block bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent pb-3.5">
						Max Zhang
					</span>
					.
				</h1>
				<p className="max-w-180 text-muted-foreground md:text-2xl font-medium leading-relaxed">
					Build with Purpose. Power with AI.
				</p>
			</FadeIn>

			<FadeIn className="flex flex-wrap gap-6" delay={0.2}>
				<Link href="/posts">
					<Button size="xl" className="font-black text-lg cursor-pointer bg-primary">
						阅读文章 <ArrowRight className="ml-2 h-5 w-5" />
					</Button>
				</Link>
				<Link href="/about">
					<Button
						variant="outline"
						size="xl"
						className="font-black text-lg cursor-pointer border-2 border-border shadow-[6px_6px_0px_var(--muted)]"
					>
						关于我
					</Button>
				</Link>
			</FadeIn>
		</section>
	)
}
