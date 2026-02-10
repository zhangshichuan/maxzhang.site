import { GlassCard } from '@/components/glass-card'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-wrapper'
import { Button } from '@/components/ui/button'
import { Briefcase, Github, GraduationCap, Linkedin, Mail, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Avatar from './avatar.jpg'

export const metadata = {
	title: '关于我 - Max Zhang',
	description: 'About Max Zhang - Software Engineer',
}

export default function AboutPage() {
	return (
		<div className="container max-w-4xl mx-auto px-4 py-10">
			{/* Header / Intro */}
			<FadeIn className="flex flex-col md:flex-row gap-10 items-start mb-16">
				{/* Avatar Placeholder */}
				<div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-secondary flex items-center justify-center shrink-0 border-4 border-white/20 shadow-xl overflow-hidden relative group">
					<div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
					<Image src={Avatar} alt="Max Zhang" className="rounded-full object-cover" />
				</div>

				<div className="space-y-6 flex-1">
					<div>
						<h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground drop-shadow-sm">Max Zhang</h1>
						<p className="text-xl text-muted-foreground flex items-center gap-2">
							<Briefcase className="h-4 w-4" /> Software Engineer
						</p>
						<p className="text-muted-foreground flex items-center gap-2 mt-1">
							<MapPin className="h-4 w-4" /> Chengdu, China
						</p>
					</div>

					<p className="text-lg leading-relaxed text-foreground/90">
						Hi! I am actively expanding my knowledge in system architecture and low-level programming with Rust, while
						exploring the decentralized future on Solana.
					</p>

					<div className="flex gap-4">
						<Link href="https://github.com/zhangshichuan" target="_blank">
							<Button
								variant="outline"
								size="sm"
								className="gap-2 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10"
							>
								<Github className="h-4 w-4" /> GitHub
							</Button>
						</Link>
						<Link href="mailto:zsc.guru@icloud.com">
							<Button
								variant="outline"
								size="sm"
								className="gap-2 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10"
							>
								<Mail className="h-4 w-4" /> Email
							</Button>
						</Link>
						<Link href="https://www.linkedin.com/in/maxzhang1010" target="_blank">
							<Button
								variant="outline"
								size="sm"
								className="gap-2 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10"
							>
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
						<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
							<Briefcase className="h-6 w-6 text-primary" /> 工作经历
						</h2>
						<GlassCard className="p-8 space-y-8" hoverEffect={false}>
							<div className="relative border-l border-white/10 pl-8 space-y-8">
								<div className="relative">
									<span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border border-white/20 bg-primary ring-4 ring-background/50" />
									<h3 className="font-bold text-lg">Senior Frontend Engineer</h3>
									<p className="text-muted-foreground text-sm">Tech Corp Inc. • 2023 - Present</p>
									<p className="mt-2 text-foreground/80">
										Leading the frontend team, migrating legacy apps to Next.js, and improving performance.
									</p>
								</div>
								<div className="relative">
									<span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border border-white/20 bg-muted-foreground ring-4 ring-background/50" />
									<h3 className="font-bold text-lg">Software Developer</h3>
									<p className="text-muted-foreground text-sm">Startup Studio • 2021 - 2023</p>
									<p className="mt-2 text-foreground/80">
										Full-stack development using React and Node.js. Built 3 MVPs from scratch.
									</p>
								</div>
							</div>
						</GlassCard>
					</StaggerItem>

					{/* Education */}
					<StaggerItem>
						<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
							<GraduationCap className="h-6 w-6 text-primary" /> 教育经历
						</h2>
						<GlassCard className="p-8" hoverEffect={false}>
							<div className="relative border-l border-white/10 pl-8 space-y-8">
								<div className="relative">
									<span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border border-white/20 bg-muted-foreground ring-4 ring-background/50" />
									<h3 className="font-bold text-lg">Northern Arizona University • 2025 - 2026</h3>
									<p className="text-muted-foreground">Master&apos;s degree，MCIT</p>
								</div>
							</div>
						</GlassCard>
					</StaggerItem>
				</StaggerContainer>

				{/* Sidebar: Skills */}
				<StaggerContainer className="space-y-8" delay={0.4}>
					<StaggerItem>
						<GlassCard className="p-6">
							<h3 className="font-bold text-lg mb-4">技术栈</h3>
							<div className="flex flex-wrap gap-2">
								{[
									'JavaScript',
									'TypeScript',
									'React',
									'Next.js',
									'Node.js',
									'Tailwind CSS',
									'Docker',
									'PostgreSQL',
									'Git',
								].map((skill) => (
									<span
										key={skill}
										className="inline-flex items-center rounded-md border border-white/10 px-2.5 py-0.5 text-xs font-semibold transition-colors bg-white/5 text-foreground hover:bg-white/10"
									>
										{skill}
									</span>
								))}
							</div>
						</GlassCard>
					</StaggerItem>

					<StaggerItem>
						<GlassCard className="p-6">
							<h3 className="font-bold text-lg mb-4">我感兴趣的</h3>
							<ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
								<li>Open Source</li>
								<li>UI/UX Design</li>
								<li>Web Performance</li>
								<li>Artificial Intelligence</li>
							</ul>
						</GlassCard>
					</StaggerItem>
				</StaggerContainer>
			</div>
		</div>
	)
}
