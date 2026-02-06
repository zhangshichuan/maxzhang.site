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
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
				{/* Logo */}
				<div className="mr-4 flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						<span className="font-bold sm:inline-block">Max Zhang</span>
					</Link>

					{/* Desktop Nav */}
					<nav className="hidden md:flex items-center gap-6 text-sm">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									'transition-colors hover:text-foreground/80',
									pathname === item.path ? 'text-foreground font-medium' : 'text-foreground/60',
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
						<div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
							<Search className="h-4 w-4" />
							<span className="sr-only">Search</span>
						</div>
					</Link>

					<nav className="flex items-center space-x-2">
						<Link href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
							<div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
								<Github className="h-4 w-4" />
								<span className="sr-only">GitHub</span>
							</div>
						</Link>
						<ThemeToggle />

						{/* Mobile Menu Toggle */}
						<button
							className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
						</button>
					</nav>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-b border-border/40 bg-background">
					<div className="container py-4 space-y-1">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									'block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md',
									pathname === item.path ? 'bg-accent text-accent-foreground' : 'text-foreground/60',
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
