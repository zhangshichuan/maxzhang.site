import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
	children: ReactNode
	className?: string
	hoverEffect?: boolean
}

export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
	return (
		<div
			className={cn(
				// 基础玻璃属性
				'relative overflow-hidden rounded-xl border',
				// 背景与模糊：浅色模式 bg-white/40，深色模式 dark:bg-zinc-950/40
				'bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl',
				// 边框：细腻的亮色边框
				'border-white/20 dark:border-white/10',
				// 阴影
				'shadow-sm',
				// 悬浮效果
				hoverEffect &&
					'transition-all duration-300 hover:shadow-lg hover:bg-white/50 dark:hover:bg-zinc-900/50 hover:border-white/30 hover:-translate-y-1',
				className,
			)}
			style={{
				WebkitBackdropFilter: 'blur(24px)',
			}}
		>
			<div className="relative z-10">{children}</div>
		</div>
	)
}
