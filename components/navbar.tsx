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
		<header className="sticky top-0 z-50 w-full bg-background/80">
			<div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-6">
				{/* Logo */}
				<div className="mr-8 flex">
					<Link href="/" className="mr-8 flex items-center space-x-2">
						<span className="font-bold text-xl tracking-tighter">Max Zhang</span>
					</Link>

					{/* Desktop Nav - 药丸风格激活态 */}
					<nav className="hidden md:flex items-center gap-2 text-sm font-medium">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									'px-4 py-1.5 rounded-full transition-all duration-300',
									pathname === item.path
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
								)}
							>
								{item.name}
							</Link>
						))}
					</nav>
				</div>

				{/* Right Actions */}
				<div className="flex flex-1 items-center justify-end space-x-1">
					<Link href="/search">
						<div className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary">
							<Search className="h-4 w-4" />
							<span className="sr-only">Search</span>
						</div>
					</Link>

					<nav className="flex items-center space-x-1">
						<Link href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
							<div className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary">
								<Github className="h-4 w-4" />
								<span className="sr-only">GitHub</span>
							</div>
						</Link>
						<div className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary">
							<ThemeToggle className="h-9 w-9 cursor-pointer border-0 shadow-none hover:bg-transparent" />
						</div>

						{/* Mobile Menu Toggle */}
						<button
							className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
						</button>
					</nav>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden bg-background shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
					<div className="container py-4 space-y-1 px-6">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									'block px-4 py-3 text-sm font-medium transition-colors rounded-xl',
									pathname === item.path
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-secondary',
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
