'use client'

import { GlassCard } from '@/components/glass-card'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'
import { Button } from '@/components/ui/button'
import { Briefcase, Github, GraduationCap, Linkedin, Mail, MapPin } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import Avatar from './avatar.jpg'
import { useTranslations } from 'next-intl'

export default function AboutPage() {
	const t = useTranslations('AboutPage')

	return (
		<div className="container max-w-4xl mx-auto px-4 py-10">
			{/* Header / Intro */}
			<FadeIn className="flex flex-col md:flex-row gap-10 items-start mb-16">
				{/* Avatar Placeholder */}
				<div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-secondary flex items-center justify-center shrink-0 border-4 border-border shadow-[8px_8px_0px_var(--primary)] overflow-hidden relative group transition-transform hover:scale-105">
					<div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
					<Image src={Avatar} alt="Max Zhang" className="rounded-full object-cover" />
				</div>

				<div className="space-y-6 flex-1">
					<div>
						<h1 className="text-5xl font-black tracking-tight mb-2 text-foreground">Max Zhang</h1>
						<p className="text-xl text-primary font-bold flex items-center gap-2">
							<Briefcase className="h-5 w-5" /> {t('role')}
						</p>
						<p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
							<MapPin className="h-4 w-4" /> {t('location')}
						</p>
					</div>

					<p className="text-xl leading-relaxed text-foreground/90 font-medium">
						{t.rich('description', {
							primary: (chunks) => <span className="text-primary font-black">{chunks}</span>,
							accent: (chunks) => <span className="text-accent font-black">{chunks}</span>,
							secondary: (chunks) => (
								<span className="text-secondary font-black underline decoration-secondary/30 decoration-4 underline-offset-4">
									{chunks}
								</span>
							),
						})}
					</p>

					<div className="flex flex-wrap gap-4">
						<Link href="https://github.com/zhangshichuan" target="_blank">
							<Button variant="outline" size="sm" className="gap-2">
								<Github className="h-4 w-4" /> GitHub
							</Button>
						</Link>
						<Link href="mailto:zsc.guru@qq.com">
							<Button variant="outline" size="sm" className="gap-2">
								<Mail className="h-4 w-4" /> Email
							</Button>
						</Link>
						<Link href="https://www.linkedin.com/in/maxzhang1010" target="_blank">
							<Button variant="outline" size="sm" className="gap-2">
								<Linkedin className="h-4 w-4" /> LinkedIn
							</Button>
						</Link>
					</div>
				</div>
			</FadeIn>

			<div className="grid gap-12 md:grid-cols-[2fr_1fr]">
				{/* Main Content */}
				<StaggerContainer className="space-y-12" delay={0.2}>
					{/* Experience */}
					<StaggerItem>
						<h2 className="text-3xl font-black mb-8 flex items-center gap-3">
							<Briefcase className="h-8 w-8 text-primary" /> {t('workExperience')}
						</h2>
						<GlassCard className="p-8 space-y-8" hoverEffect={false}>
							<div className="relative border-l-4 border-border/30 pl-8 space-y-12">
								{t.raw('experience').map((exp: any, index: number) => (
									<div key={index} className="relative">
										<span
											className={`absolute -left-9.5 top-1 h-6 w-6 rounded-full border-4 border-background shadow-[2px_2px_0px_#000] ${index === 0 ? 'bg-primary' : 'bg-secondary'}`}
										/>
										<div className="flex flex-col mb-2">
											<h3 className="font-black text-xl text-foreground">
												{exp.role} • {exp.company}
											</h3>
											<p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">
												{exp.department} • {exp.period}
											</p>
										</div>
										<div className="flex flex-wrap gap-2 my-3">
											{exp.tags.map((tag: string) => (
												<span
													key={tag}
													className={`px-3 py-1 rounded-lg text-xs font-black border-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] ${index === 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary-foreground border-secondary/20'}`}
												>
													{tag}
												</span>
											))}
										</div>
										<ul className="mt-4 text-foreground/80 font-medium text-base space-y-3 list-disc list-outside ml-4">
											{exp.points.map((point: string, pIdx: number) => (
												<li key={pIdx}>{point}</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</GlassCard>
					</StaggerItem>

					{/* Education */}
					<StaggerItem>
						<h2 className="text-3xl font-black mb-8 flex items-center gap-3">
							<GraduationCap className="h-8 w-8 text-accent" /> {t('education')}
						</h2>
						<GlassCard className="p-8" hoverEffect={false}>
							<div className="relative border-l-4 border-border/30 pl-8 space-y-8">
								{t.raw('educationList').map((edu: any, index: number) => (
									<div key={index} className="relative">
										<span className="absolute -left-9.5 top-1 h-6 w-6 rounded-full border-4 border-background bg-accent shadow-[2px_2px_0px_#000]" />
										<h3 className="font-black text-xl text-foreground">
											{edu.school} • {edu.period}
										</h3>
										<p className="text-muted-foreground font-bold uppercase tracking-wider">{edu.degree}</p>
									</div>
								))}
							</div>
						</GlassCard>
					</StaggerItem>
				</StaggerContainer>

				{/* Sidebar: Skills */}
				<StaggerContainer className="space-y-8" delay={0.4}>
					<StaggerItem>
						<GlassCard className="p-6">
							<h3 className="font-black text-xl mb-6 flex items-center gap-2">{t('techStack')}</h3>
							<div className="flex flex-wrap gap-2">
								{[
									'TypeScript',
									'Node.js',
									'React',
									'Vue.js',
									'Next.js',
									'NestJS',
									'Tailwind CSS',
									'Framer Motion',
									'Docker',
									'PostgreSQL',
									'K3s',
									'Redis',
									'Prisma',
									'Zod',
									'tRPC',
									'ELK Stack',
									'Prometheus',
									'Grafana',
									'Rust',
									'BullMQ',
									'Artillery',
									'Sentry',
									'Fabric.js',
								].map((skill) => (
									<span
										key={skill}
										className="inline-flex items-center rounded-xl border-2 border-border px-3 py-1.5 text-xs font-black transition-all bg-card text-foreground shadow-[2px_2px_0px_var(--border)] hover:translate-x-px hover:translate-y-px hover:shadow-none"
									>
										{skill}
									</span>
								))}
							</div>
						</GlassCard>
					</StaggerItem>

					<StaggerItem>
						<GlassCard className="p-6">
							<h3 className="font-black text-xl mb-6 flex items-center gap-2">{t('interests')}</h3>
							<ul className="space-y-3 text-base font-bold text-muted-foreground">
								{t.raw('interestList').map((interest: string, index: number) => (
									<li key={index} className="flex items-center gap-2">
										<span
											className={`h-2 w-2 rounded-full ${index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-accent' : 'bg-secondary'}`}
										/>{' '}
										{interest}
									</li>
								))}
							</ul>
						</GlassCard>
					</StaggerItem>
				</StaggerContainer>
			</div>
		</div>
	)
}
