'use client'

import { GlassCard } from '@/components/glass-card'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'
import { Button } from '@/components/ui/button'
import { Briefcase, Github, GraduationCap, Linkedin, Mail, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Avatar from './avatar.jpg'

export default function AboutPage() {
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
							<Briefcase className="h-5 w-5" /> Software Engineer
						</p>
						<p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
							<MapPin className="h-4 w-4" /> Chengdu, China
						</p>
					</div>

					<p className="text-xl leading-relaxed text-foreground/90 font-medium">
						Hi! I&apos;m a Full-stack Architect obsessed with crafting high-performance systems using{' '}
						<span className="text-primary font-black">Node.js</span> &{' '}
						<span className="text-primary font-black">TypeScript</span>. I orchestrate{' '}
						<span className="text-accent font-black">Docker</span> & <span className="text-accent font-black">K3s</span>{' '}
						for elite <span className="text-accent font-black">DevOps</span> workflows, scale complex data with{' '}
						<span className="text-secondary-foreground font-black underline decoration-secondary decoration-4">
							PostgreSQL
						</span>{' '}
						&{' '}
						<span className="text-secondary-foreground font-black underline decoration-secondary decoration-4">MQ</span>
						, and explore the limits of performance with <span className="text-primary font-black">Rust</span>—all while
						ensuring system observability through <span className="text-accent font-black">ELK</span> and advanced{' '}
						<span className="text-accent font-black">Monitoring</span>.
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
							<Briefcase className="h-8 w-8 text-primary" /> 工作经历
						</h2>
						<GlassCard className="p-8 space-y-8" hoverEffect={false}>
							<div className="relative border-l-4 border-border/30 pl-8 space-y-12">
								<div className="relative">
									<span className="absolute -left-[38px] top-1 h-6 w-6 rounded-full border-4 border-background bg-primary shadow-[2px_2px_0px_#000]" />
									<div className="flex flex-col mb-2">
										<h3 className="font-black text-xl text-foreground">前端主管 • 成都睿晟天和传媒科技有限公司</h3>
										<p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">
											产品研发部 • 2021.02 - 2025.12
										</p>
									</div>
									<div className="flex flex-wrap gap-2 my-3">
										{['React', 'Next.js', 'Node.js', 'Prisma', 'PostgreSQL', 'Zod'].map((tag) => (
											<span
												key={tag}
												className="px-3 py-1 rounded-lg text-xs font-black bg-primary/10 text-primary border-2 border-primary/20 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
											>
												{tag}
											</span>
										))}
									</div>
									<ul className="mt-4 text-foreground/80 font-medium text-base space-y-3 list-disc list-outside ml-4">
										<li>主导广告业务数字化平台从 0 到 1 的建设与落地，实现（业财法）流程线上化与智能化</li>
										<li>参与跨境电商业务系统搭建与实施，推动业务从无到有的全流程落地</li>
										<li>
											负责 AI 混剪及广告批量投放系统的设计与开发，提升广告投放效率与自动化水平，打通从 AI
											素材制作，素材评级 and 管理，广告搭建，批量投放，数据回溯等全流程循环
										</li>
										<li>AI 平面素材生成，AI 视频混剪、集成美图 AI 工具，TTS 服务、官网、小程序</li>
										<li>
											各类跨部门、跨公司协作，从追过程到拿结果。基础设施建设（监控、脚手架、AI），团建组织、年会节目、抽奖程序等
										</li>
									</ul>
								</div>

								<div className="relative">
									<span className="absolute -left-[38px] top-1 h-6 w-6 rounded-full border-4 border-background bg-secondary shadow-[2px_2px_0px_#000]" />
									<div className="flex flex-col mb-2">
										<h3 className="font-black text-xl text-foreground">前端架构师 • 成都魔方元科技有限公司</h3>
										<p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">
											产品研发部 • 2020.01 - 2021.01
										</p>
									</div>
									<div className="flex flex-wrap gap-2 my-3">
										{['TypeScript', 'Linux', 'Vue', 'Node.js', 'PHP7', 'React'].map((tag) => (
											<span
												key={tag}
												className="px-3 py-1 rounded-lg text-xs font-black bg-secondary/10 text-secondary-foreground border-2 border-secondary/20 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
											>
												{tag}
											</span>
										))}
									</div>
									<ul className="mt-4 text-foreground/80 font-medium text-base space-y-3 list-disc list-outside ml-4">
										<li>跨国内外多团队、多语种沟通和协作，完成技术需求沟通到落地实现</li>
										<li>
											维护和迭代 20+ 周期超 10 年的前端（jQuery/原生混合 JSBridge/Vue/聊天室）后端（Node.js/PHP）项目
										</li>
									</ul>
								</div>
							</div>
						</GlassCard>
					</StaggerItem>

					{/* Education */}
					<StaggerItem>
						<h2 className="text-3xl font-black mb-8 flex items-center gap-3">
							<GraduationCap className="h-8 w-8 text-accent" /> 教育经历
						</h2>
						<GlassCard className="p-8" hoverEffect={false}>
							<div className="relative border-l-4 border-border/30 pl-8 space-y-8">
								<div className="relative">
									<span className="absolute -left-[38px] top-1 h-6 w-6 rounded-full border-4 border-background bg-accent shadow-[2px_2px_0px_#000]" />
									<h3 className="font-black text-xl text-foreground">Northern Arizona University • 2025 - 2026</h3>
									<p className="text-muted-foreground font-bold uppercase tracking-wider">Master&apos;s degree，MCIT</p>
								</div>
							</div>
						</GlassCard>
					</StaggerItem>
				</StaggerContainer>

				{/* Sidebar: Skills */}
				<StaggerContainer className="space-y-8" delay={0.4}>
					<StaggerItem>
						<GlassCard className="p-6">
							<h3 className="font-black text-xl mb-6 flex items-center gap-2">技术栈</h3>
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
										className="inline-flex items-center rounded-xl border-2 border-border px-3 py-1.5 text-xs font-black transition-all bg-card text-foreground shadow-[2px_2px_0px_var(--border)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
									>
										{skill}
									</span>
								))}
							</div>
						</GlassCard>
					</StaggerItem>

					<StaggerItem>
						<GlassCard className="p-6">
							<h3 className="font-black text-xl mb-6 flex items-center gap-2">兴趣点</h3>
							<ul className="space-y-3 text-base font-bold text-muted-foreground">
								<li className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-primary" /> Open Source
								</li>
								<li className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-accent" /> UI/UX Design
								</li>
								<li className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-secondary" /> Full Stack Development
								</li>
								<li className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-primary" /> Artificial Intelligence
								</li>
							</ul>
						</GlassCard>
					</StaggerItem>
				</StaggerContainer>
			</div>
		</div>
	)
}
