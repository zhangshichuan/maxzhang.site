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
							<div className="relative border-l border-white/10 pl-8 space-y-12">
								<div className="relative">
									<span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border border-white/20 bg-primary ring-4 ring-background/50" />
									<div className="flex flex-col mb-1">
										<h3 className="font-bold text-lg">前端主管 • 成都睿晟天和传媒科技有限公司</h3>
										<p className="text-muted-foreground text-sm">产品研发部 • 2021.02 - 2025.12</p>
									</div>
									<div className="flex flex-wrap gap-1.5 my-2">
										{['React', 'Next.js', 'Node.js', 'Prisma', 'PostgreSQL', 'Zod'].map((tag) => (
											<span
												key={tag}
												className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
											>
												{tag}
											</span>
										))}
									</div>
									<ul className="mt-3 text-foreground/80 text-sm space-y-2 list-disc list-outside ml-4">
										<li>主导广告业务数字化平台从 0 到 1 的建设与落地，实现（业财法）流程线上化与智能化</li>
										<li>参与跨境电商业务系统搭建与实施，推动业务从无到有的全流程落地</li>
										<li>
											负责 AI 混剪及广告批量投放系统的设计与开发，提升广告投放效率与自动化水平，打通从 AI
											素材制作，素材评级和管理，广告搭建，批量投放，数据回溯等全流程循环
										</li>
										<li>AI 平面素材生成，AI 视频混剪、集成美图 AI 工具，TTS 服务、官网、小程序</li>
										<li>
											各类跨部门、跨公司协作，从追过程到拿结果。基础设施建设（监控、脚手架、AI），团建组织、年会节目、抽奖程序等
										</li>
									</ul>
								</div>

								<div className="relative">
									<span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border border-white/20 bg-muted-foreground ring-4 ring-background/50" />
									<div className="flex flex-col mb-1">
										<h3 className="font-bold text-lg">前端架构师 • 成都魔方元科技有限公司</h3>
										<p className="text-muted-foreground text-sm">产品研发部 • 2020.01 - 2021.01</p>
									</div>
									<div className="flex flex-wrap gap-1.5 my-2">
										{['TypeScript', 'Linux', 'Vue', 'Node.js', 'PHP7', 'React'].map((tag) => (
											<span
												key={tag}
												className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-muted-foreground border border-white/10"
											>
												{tag}
											</span>
										))}
									</div>
									<ul className="mt-3 text-foreground/80 text-sm space-y-2 list-disc list-outside ml-4">
										<li>跨国内外多团队、多语种沟通和协作，完成技术需求沟通到落地实现</li>
										<li>维护和迭代 20+ 周期超 10 年的前端（jQuery/原生混合 JSBridge/Vue/聊天室）后端（Node.js/PHP）项目</li>
									</ul>
								</div>

								<div className="relative">
									<span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border border-white/20 bg-muted-foreground ring-4 ring-background/50" />
									<div className="flex flex-col mb-1">
										<h3 className="font-bold text-lg">前端开发工程师 • 成都众人安科技有限责任公司</h3>
										<p className="text-muted-foreground text-sm">产品研发部 • 2018.05 - 2019.12</p>
									</div>
									<div className="flex flex-wrap gap-1.5 my-2">
										{['Vue', 'TypeScript'].map((tag) => (
											<span
												key={tag}
												className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-muted-foreground border border-white/10"
											>
												{tag}
											</span>
										))}
									</div>
									<ul className="mt-3 text-foreground/80 text-sm space-y-2 list-disc list-outside ml-4">
										<li>BD 保单管家 PC 、公众号 H5 从 0 到 1 的开发</li>
										<li>参与需求沟通（直面客户），给客户做线下产品宣讲（3 次 50 人以上）</li>
									</ul>
								</div>

								<div className="relative">
									<span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border border-white/20 bg-muted-foreground ring-4 ring-background/50" />
									<div className="flex flex-col mb-1">
										<h3 className="font-bold text-lg">全栈工程师 • 成都数联医信科技有限公司</h3>
										<p className="text-muted-foreground text-sm">产品研发 • 2016.03 - 2018.05</p>
									</div>
									<div className="flex flex-wrap gap-1.5 my-2">
										{['PostgreSQL', 'Vue', 'PHP7', 'Linux', 'AWS'].map((tag) => (
											<span
												key={tag}
												className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-muted-foreground border border-white/10"
											>
												{tag}
											</span>
										))}
									</div>
									<ul className="mt-3 text-foreground/80 text-sm space-y-2 list-disc list-outside ml-4">
										<li>
											国内各医院设备数据清洗 /
											转发，主导医信云服资源服务从前端到后端全流程（PC/H5/小程序上传到 AWS S3，分类、入库）
										</li>
										<li>通过编译 C 语言模块使 PHP7 支持 SMB 协议从而完成医院内网 Windows 日志转发到 Linux 系统的工作</li>
										<li>总计 10 个大 4 实习生历时 10 个月完成从实习到指导毕业设计到转正为正式员工全过程</li>
										<li>在产品宣讲会前按质按时完成医信云服 2.0, 助力公司完成由红杉资本领投的 5000 万美元 A 轮融资</li>
										<li>跨部门紧密的协作 / 信任关系</li>
									</ul>
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
