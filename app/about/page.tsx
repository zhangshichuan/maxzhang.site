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
			<div className="flex flex-col md:flex-row gap-10 items-start mb-16">
				{/* Avatar Placeholder */}
				<div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-secondary flex items-center justify-center shrink-0 border-4 border-background shadow-xl">
					<Image src={Avatar} alt="Max Zhang" className="rounded-full" />
				</div>

				<div className="space-y-6 flex-1">
					<div>
						<h1 className="text-4xl font-bold tracking-tight mb-2">Max Zhang</h1>
						<p className="text-xl text-muted-foreground flex items-center gap-2">
							<Briefcase className="h-4 w-4" /> Software Engineer
						</p>
						<p className="text-muted-foreground flex items-center gap-2 mt-1">
							<MapPin className="h-4 w-4" /> Chengdu, China
						</p>
					</div>

					<p className="text-lg leading-relaxed">
						Hi! I am actively expanding my knowledge in system architecture and low-level programming with Rust, while
						exploring the decentralized future on Solana.
					</p>

					<div className="flex gap-4">
						<Link href="https://github.com/zhangshichuan" target="_blank">
							<Button variant="outline" size="sm" className="gap-2">
								<Github className="h-4 w-4" /> GitHub
							</Button>
						</Link>
						<Link href="mailto:zsc.guru@icloud.com">
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
			</div>

			<div className="grid gap-12 md:grid-cols-[2fr_1fr]">
				{/* Main Content */}
				<div className="space-y-12">
					{/* Experience */}
					<section>
						<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
							<Briefcase className="h-6 w-6" /> 工作经历
						</h2>
						<div className="space-y-8 relative border-l border-border ml-3 pl-8">
							<div className="relative">
								<span className="absolute -left-9.75 top-1 h-5 w-5 rounded-full border border-background bg-primary" />
								<h3 className="font-bold text-lg">Senior Frontend Engineer</h3>
								<p className="text-muted-foreground">Tech Corp Inc. • 2023 - Present</p>
								<p className="mt-2 text-muted-foreground">
									Leading the frontend team, migrating legacy apps to Next.js, and improving performance.
								</p>
							</div>
							<div className="relative">
								<span className="absolute -left-9.75 top-1 h-5 w-5 rounded-full border border-background bg-muted-foreground" />
								<h3 className="font-bold text-lg">Software Developer</h3>
								<p className="text-muted-foreground">Startup Studio • 2021 - 2023</p>
								<p className="mt-2 text-muted-foreground">
									Full-stack development using React and Node.js. Built 3 MVPs from scratch.
								</p>
							</div>
						</div>
					</section>

					{/* Education */}
					<section>
						<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
							<GraduationCap className="h-6 w-6" /> 教育经历
						</h2>
						<div className="space-y-8 relative border-l border-border ml-3 pl-8">
							<div className="relative">
								<span className="absolute -left-9.75 top-1 h-5 w-5 rounded-full border border-background bg-muted-foreground" />
								<h3 className="font-bold text-lg">Northern Arizona University • 2025 - 2026</h3>
								<p className="text-muted-foreground">Master&apos;s degree，MCIT</p>
							</div>
						</div>
					</section>
				</div>

				{/* Sidebar: Skills */}
				<div className="space-y-8">
					<section className="rounded-xl border bg-card p-6 shadow-sm">
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
									className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20"
								>
									{skill}
								</span>
							))}
						</div>
					</section>

					<section className="rounded-xl border bg-card p-6 shadow-sm">
						<h3 className="font-bold text-lg mb-4">我感兴趣的</h3>
						<ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
							<li>Open Source</li>
							<li>UI/UX Design</li>
							<li>Web Performance</li>
							<li>Artificial Intelligence</li>
						</ul>
					</section>
				</div>
			</div>
		</div>
	)
}
