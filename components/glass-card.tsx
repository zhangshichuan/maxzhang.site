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
				// 背景与模糊：使用极低的透明度 + 高斯模糊
				'bg-white/20 dark:bg-black/20 backdrop-blur-xl',
				// 边框：细腻的亮色边框，模拟玻璃边缘反光
				'border-white/20 dark:border-white/10',
				// 阴影：柔和的阴影提升层次
				'shadow-sm',
				// 悬浮效果
				hoverEffect &&
					'transition-all duration-300 hover:shadow-lg hover:bg-white/40 dark:hover:bg-black/40 hover:border-white/30 hover:-translate-y-1',
				className,
			)}
		>
			<div className="relative z-10">{children}</div>
		</div>
	)
}
