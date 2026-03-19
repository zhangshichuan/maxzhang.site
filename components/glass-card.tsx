import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
	children: ReactNode
	className?: string
	hoverEffect?: boolean
}

/**
 * Modern Borderless Layer.
 * Defines space through background contrast and soft elevation.
 */
export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-[--radius] bg-card text-card-foreground',
				// 使用极其微妙的阴影来代替边框
				'shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_20px_-5px_rgba(0,0,0,0.3)]',
				hoverEffect &&
					'transition-all duration-500 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-1',
				className,
			)}
		>
			<div className="relative z-10">{children}</div>
		</div>
	)
}
