'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Github, Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { motion } from 'framer-motion'

const navItems = [
	{ name: '首页', path: '/' },
	{ name: '文章', path: '/posts' },
	{ name: '关于', path: '/about' },
]

export function Navbar() {
	const pathname = usePathname()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

	return (
		<header className="sticky top-0 z-50 w-full border-b-2 border-border/10 bg-background/95 backdrop-blur-md">
			<div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-6">
				{/* Logo */}
				<div className="mr-8 flex">
					<Link href="/" className="mr-8 flex items-center space-x-2">
						<motion.span 
							whileHover={{ scale: 1.05, rotate: -2 }}
							className="inline-block font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-primary to-accent pb-1"
						>
							Max Zhang
						</motion.span>
					</Link>

					{/* Desktop Nav - 动感药丸风格 */}
					<nav className="hidden md:flex items-center gap-3 text-sm font-bold">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									'relative px-4 py-2 rounded-full transition-all duration-300 overflow-hidden',
									pathname === item.path
										? 'text-primary-foreground shadow-[var(--shadow-pop)] bg-primary'
										: 'text-muted-foreground hover:text-foreground hover:bg-secondary/20',
								)}
							>
								{item.name}
							</Link>
						))}
					</nav>
				</div>

				{/* Right Actions */}
				<div className="flex flex-1 items-center justify-end space-x-2">
					<Link href="/search">
						<motion.div 
							whileHover={{ scale: 1.1, rotate: 5 }}
							className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border/10 transition-colors hover:border-primary/50 hover:bg-secondary/20"
						>
							<Search className="h-5 w-5" />
							<span className="sr-only">Search</span>
						</motion.div>
					</Link>

					<nav className="flex items-center space-x-2">
						<Link href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
							<motion.div 
								whileHover={{ scale: 1.1, rotate: -5 }}
								className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border/10 transition-colors hover:border-primary/50 hover:bg-secondary/20"
							>
								<Github className="h-5 w-5" />
								<span className="sr-only">GitHub</span>
							</motion.div>
						</Link>
						
						<ThemeToggle className="h-10 w-10 cursor-pointer border-2 border-border/10 bg-background shadow-none hover:border-primary/50" />

						{/* Mobile Menu Toggle */}
						<motion.button
							whileTap={{ scale: 0.9 }}
							className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border/10 transition-colors hover:bg-secondary"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</motion.button>
					</nav>
				</div>
			</div>

			{/* Mobile Menu - 抽屉动画提升能量感 */}
			{isMobileMenuOpen && (
				<motion.div 
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="md:hidden bg-background border-b-4 border-border shadow-xl"
				>
					<div className="container py-6 space-y-2 px-6">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									'block px-6 py-4 text-base font-black transition-all rounded-2xl border-2 border-transparent',
									pathname === item.path
										? 'bg-primary text-primary-foreground border-border shadow-[4px_4px_0px_#1a1a1a]'
										: 'text-muted-foreground hover:bg-secondary/30 hover:border-border/10',
								)}
								onClick={() => setIsMobileMenuOpen(false)}
							>
								{item.name}
							</Link>
						))}
					</div>
				</motion.div>
			)}
		</header>
	)
}
