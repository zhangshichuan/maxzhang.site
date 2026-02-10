'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface WrapperProps {
	children: ReactNode
	className?: string
	delay?: number
}

// 简单的淡入向上效果
export function FadeIn({ children, className, delay = 0 }: WrapperProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			className={className}
		>
			{children}
		</motion.div>
	)
}

// 容器：用于交错动画 (Stagger)
export function StaggerContainer({ children, className, delay = 0 }: WrapperProps) {
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: 0.1,
						delayChildren: delay,
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	)
}

// 子项：配合 StaggerContainer 使用
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: { opacity: 1, y: 0 },
			}}
			className={className}
		>
			{children}
		</motion.div>
	)
}
