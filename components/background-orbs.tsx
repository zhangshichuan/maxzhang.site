'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function BackgroundOrbs() {
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setTimeout(() => {
			setMounted(true)
		}, 30)
	}, [])

	if (!mounted) return null

	const isDark = resolvedTheme === 'dark'

	// 定义颜色：深色模式用深邃的蓝紫，浅色模式用柔和的蓝粉
	// 调整了不透明度，让它更微妙，不要抢夺内容注意力
	const color1 = isDark ? 'bg-blue-900/30' : 'bg-blue-200/40'
	const color2 = isDark ? 'bg-purple-900/30' : 'bg-pink-200/40'
	const color3 = isDark ? 'bg-indigo-900/30' : 'bg-indigo-200/40'

	return (
		<div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none">
			<div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
			{/* 这一层确保背景不会太花，类似于毛玻璃覆盖在光斑上 */}
			{/* Orb 1 */}
			<motion.div
				className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] ${color1}`}
				animate={{
					x: [0, 100, 0],
					y: [0, 50, 0],
					scale: [1, 1.2, 1],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			/>
			{/* Orb 2 */}
			<motion.div
				className={`absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] ${color2}`}
				animate={{
					x: [0, -50, 0],
					y: [0, 100, 0],
					scale: [1, 1.1, 1],
				}}
				transition={{
					duration: 25,
					repeat: Infinity,
					ease: 'easeInOut',
					delay: 2,
				}}
			/>
			{/* Orb 3 */}
			<motion.div
				className={`absolute bottom-[-10%] left-[20%] w-[70vw] h-[70vw] rounded-full blur-[130px] ${color3}`}
				animate={{
					x: [0, 50, 0],
					y: [0, -50, 0],
					scale: [1, 1.3, 1],
				}}
				transition={{
					duration: 30,
					repeat: Infinity,
					ease: 'easeInOut',
					delay: 5,
				}}
			/>
		</div>
	)
}
