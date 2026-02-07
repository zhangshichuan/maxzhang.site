'use client'

import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = React.useState(false)

	// Avoid hydration mismatch
	React.useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<button
				className={cn(
					'inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground',
					className,
				)}
			>
				<span className="sr-only">Toggle theme</span>
			</button>
		)
	}

	return (
		<button
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			className={cn(
				'inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground',
				className,
			)}
		>
			<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</button>
	)
}
