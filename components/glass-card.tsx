import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
	children: ReactNode
	className?: string
	hoverEffect?: boolean
}

/**
 * Dopamine Card (formerly GlassCard)
 * 使用硬边框、实体阴影和动力学反馈。
 */
export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
	return (
		<motion.div
			whileHover={hoverEffect ? { x: -2, y: -2 } : {}}
			transition={{ type: 'spring', stiffness: 400, damping: 10 }}
			className={cn(
				'relative overflow-hidden rounded-[--radius] bg-card text-card-foreground',
				'border-2 border-border transition-all duration-200',
				// 使用 CSS 变量中定义的实体阴影
				'shadow-(--shadow-pop)',
				hoverEffect && 'hover:shadow-(--shadow-pop-hover) hover:bg-secondary/5',
				className,
			)}
		>
			<div className="relative z-10">{children}</div>
		</motion.div>
	)
}
