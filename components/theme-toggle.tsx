'use client'

import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = React.useState(false)

	// Avoid hydration mismatch
	React.useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<div className={cn('h-10 w-10 rounded-full border-2 border-border/10', className)} />
		)
	}

	return (
		<motion.button
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9, rotate: 15 }}
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			className={cn(
				'relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border transition-colors overflow-hidden',
				'bg-background hover:bg-secondary/20 shadow-[2px_2px_0px_var(--border)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]',
				className,
			)}
		>
			<AnimatePresence mode="wait" initial={false}>
				{theme === 'dark' ? (
					<motion.div
						key="moon"
						initial={{ y: 20, rotate: 90, opacity: 0 }}
						animate={{ y: 0, rotate: 0, opacity: 1 }}
						exit={{ y: -20, rotate: -90, opacity: 0 }}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
					>
						<Moon className="h-5 w-5 text-primary" />
					</motion.div>
				) : (
					<motion.div
						key="sun"
						initial={{ y: 20, rotate: 90, opacity: 0 }}
						animate={{ y: 0, rotate: 0, opacity: 1 }}
						exit={{ y: -20, rotate: -90, opacity: 0 }}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}
					>
						<Sun className="h-5 w-5 text-secondary-foreground" />
					</motion.div>
				)}
			</AnimatePresence>
			<span className="sr-only">Toggle theme</span>
		</motion.button>
	)
}
