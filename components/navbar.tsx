'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Github, Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

const navItems = [
	{ name: '首页', path: '/' },
	{ name: '文章', path: '/posts' },
	{ name: '关于', path: '/about' },
]

export function Navbar() {
	const pathname = usePathname()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

	return (
		<header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/10 dark:bg-black/10 backdrop-blur-md supports-backdrop-filter:bg-white/5">
			<div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4">
				{/* Logo */}
				<div className="mr-4 flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						<span className="font-bold sm:inline-block text-lg tracking-tight">Max Zhang</span>
					</Link>

					{/* Desktop Nav */}
					<nav className="hidden md:flex items-center gap-1 text-sm">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									'px-4 py-2 rounded-full transition-all duration-300',
									pathname === item.path
										? 'bg-white/10 dark:bg-white/10 text-foreground font-medium shadow-sm ring-1 ring-white/10'
										: 'text-foreground/70 hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5',
								)}
							>
								{item.name}
							</Link>
						))}
					</nav>
				</div>

				{/* Right Actions */}
				<div className="flex flex-1 items-center justify-end space-x-2">
					{/* Search Icon (Desktop) */}
					<Link href="/search">
						<div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-sm transition-colors hover:bg-white/20 hover:text-accent-foreground backdrop-blur-sm">
							<Search className="h-4 w-4" />
							<span className="sr-only">Search</span>
						</div>
					</Link>

					<nav className="flex items-center space-x-2">
						<Link href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
							<div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-sm transition-colors hover:bg-white/20 hover:text-accent-foreground backdrop-blur-sm">
								<Github className="h-4 w-4" />
								<span className="sr-only">GitHub</span>
							</div>
						</Link>
						<div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-sm transition-colors hover:bg-white/20 hover:text-accent-foreground backdrop-blur-sm">
							<ThemeToggle className="cursor-pointer border-0 shadow-none hover:bg-transparent" />
						</div>

						{/* Mobile Menu Toggle */}
						<button
							className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-sm transition-colors hover:bg-white/20 hover:text-accent-foreground backdrop-blur-sm"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
						</button>
					</nav>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-b border-white/10 bg-background/80 backdrop-blur-xl">
					<div className="container py-4 space-y-2 px-4">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									'block px-4 py-3 text-sm font-medium transition-colors rounded-xl',
									pathname === item.path
										? 'bg-primary/10 text-primary border border-primary/20'
										: 'text-foreground/70 hover:bg-white/5',
								)}
								onClick={() => setIsMobileMenuOpen(false)}
							>
								{item.name}
							</Link>
						))}
					</div>
				</div>
			)}
		</header>
	)
}
