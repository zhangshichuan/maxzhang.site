'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Github, Menu, Search, X, Languages } from 'lucide-react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useTranslations, useLocale } from 'next-intl'
import * as React from 'react'

export function Navbar() {
	const t = useTranslations('Common.nav')
	const locale = useLocale()
	const pathname = usePathname()
	const router = useRouter()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

	const navItems = [
		{ name: t('home'), path: '/' },
		{ name: t('posts'), path: '/posts' },
		{ name: t('about'), path: '/about' },
	]

	const toggleLanguage = () => {
		const nextLocale = locale === 'zh' ? 'en' : 'zh'
		router.replace(pathname, { locale: nextLocale })
	}

	return (
		<header className="
    sticky top-0 z-50 w-full border-b-2 border-border/10 bg-background/95
    backdrop-blur-md
  ">
			<div className="
     container mx-auto flex h-16 max-w-screen-2xl items-center px-6
   ">
				{/* Logo */}
				<div className="mr-8 flex">
					<Link href="/" className="mr-8 flex shrink-0 items-center space-x-2">
						<motion.span
							whileHover={{ scale: 1.05, rotate: -2 }}
							className="
         inline-block bg-linear-to-r from-primary to-accent bg-clip-text pb-1
         text-2xl font-black tracking-tighter whitespace-nowrap text-transparent
       "
						>
							Max Zhang
						</motion.span>
					</Link>

					{/* Desktop Nav - 动感药丸风格 */}
					<nav className="
       hidden items-center gap-3 text-sm font-bold
       md:flex
     ">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									`
           relative overflow-hidden rounded-full px-4 py-2 transition-all
           duration-300
         `,
									pathname === item.path
										? 'bg-primary text-primary-foreground shadow-(--shadow-pop)'
										: `
            text-muted-foreground
            hover:bg-secondary/20 hover:text-foreground
          `,
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
							className="
         inline-flex h-10 w-10 items-center justify-center rounded-full border-2
         border-border/10 transition-colors
         hover:border-primary/50 hover:bg-secondary/20
       "
						>
							<Search className="h-5 w-5" />
							<span className="sr-only">Search</span>
						</motion.div>
					</Link>

					<nav className="flex items-center space-x-2">
						<motion.button
							whileHover={{ scale: 1.1, rotate: 12 }}
							whileTap={{ scale: 0.9 }}
							onClick={toggleLanguage}
							className="
         inline-flex h-10 w-10 items-center justify-center rounded-full border-2
         border-border/10 transition-colors
         hover:border-primary/50 hover:bg-secondary/20
       "
							title={t('switchLanguage')}
						>
							<Languages className="h-5 w-5" />
							<span className="sr-only">Language</span>
						</motion.button>

						<Link href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
							<motion.div
								whileHover={{ scale: 1.1, rotate: -5 }}
								className="
          inline-flex h-10 w-10 items-center justify-center rounded-full
          border-2 border-border/10 transition-colors
          hover:border-primary/50 hover:bg-secondary/20
        "
							>
								<Github className="h-5 w-5" />
								<span className="sr-only">GitHub</span>
							</motion.div>
						</Link>

						<ThemeToggle className="
        h-10 w-10 cursor-pointer border-2 border-border/10 bg-background
        shadow-none
        hover:border-primary/50
      " />

						{/* Mobile Menu Toggle */}
						<motion.button
							whileTap={{ scale: 0.9 }}
							className="
         inline-flex h-10 w-10 items-center justify-center rounded-full border-2
         border-border/10 transition-colors
         hover:bg-secondary
         md:hidden
       "
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
					className="
       border-b-4 border-border bg-background shadow-xl
       md:hidden
     "
				>
					<div className="container space-y-2 px-6 py-6">
						{navItems.map((item) => (
							<Link
								key={item.path}
								href={item.path}
								className={cn(
									`
           block rounded-2xl border-2 border-transparent px-6 py-4 text-base
           font-black transition-all
         `,
									pathname === item.path
										? `
            border-border bg-primary text-primary-foreground
            shadow-[4px_4px_0px_#1a1a1a]
          `
										: `
            text-muted-foreground
            hover:border-border/10 hover:bg-secondary/30
          `,
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
