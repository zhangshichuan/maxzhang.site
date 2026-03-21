'use client'

import mermaid from 'mermaid'
import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface MermaidProps {
	chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
	const { resolvedTheme } = useTheme()
	const [svg, setSvg] = useState<string>('')
	const [error, setError] = useState<string | null>(null)
	const [isLightboxOpen, setIsLightboxOpen] = useState(false)
	const [zoom, setZoom] = useState(1)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const isDark = resolvedTheme === 'dark'

		mermaid.initialize({
			startOnLoad: false,
			theme: isDark ? 'dark' : 'default',
			securityLevel: 'loose',
			fontFamily: 'var(--font-sans)',
			themeVariables: {
				fontFamily: 'var(--font-sans)',
				fontSize: '14px',
			},
			flowchart: {
				htmlLabels: true,
				useMaxWidth: true,
				padding: 30,
			},
		})

		const renderChart = async () => {
			if (chart) {
				try {
					const id = `m${Math.random().toString(36).substring(2, 11)}`
					const { svg: renderedSvg } = await mermaid.render(id, chart)
					
					// 关键修复：不再强制替换为 100%，而是移除 Mermaid 可能注入的冲突 style
					// 保留原始的 width/height 属性，让 SVG 拥有原始比例
					const cleanedSvg = renderedSvg
						.replace(/style="max-width:.*?"/, '')
					
					setSvg(cleanedSvg)
					setError(null)
				} catch (err) {
					console.error('Mermaid render error:', err)
					setError('Failed to render diagram')
				}
			}
		}

		renderChart()
	}, [chart, resolvedTheme])

	const toggleLightbox = () => {
		if (!isLightboxOpen) {
			setIsLightboxOpen(true)
			document.body.style.overflow = 'hidden'
		} else {
			setIsLightboxOpen(false)
			setZoom(1)
			document.body.style.overflow = 'unset'
		}
	}

	const handleZoomIn = (e: React.MouseEvent) => {
		e.stopPropagation()
		setZoom(prev => Math.min(prev + 0.2, 4))
	}

	const handleZoomOut = (e: React.MouseEvent) => {
		e.stopPropagation()
		setZoom(prev => Math.max(prev - 0.2, 0.3))
	}

	const handleReset = (e: React.MouseEvent) => {
		e.stopPropagation()
		setZoom(1)
	}

	const handleWheel = (e: React.WheelEvent) => {
		// 只有在灯箱打开时才处理滚动缩放
		if (isLightboxOpen) {
			e.preventDefault()
			const delta = e.deltaY > 0 ? -0.1 : 0.1
			setZoom(prev => Math.min(Math.max(prev + delta, 0.3), 4))
		}
	}

	if (error) {
		return <div className="p-4 border border-red-500 text-red-500 rounded my-4 text-sm">{error}</div>
	}

	return (
		<>
			{/* 缩略图模式：利用原始比例进行缩放 */}
			<div className="relative group cursor-zoom-in my-12">
				<div
					onClick={toggleLightbox}
					className="not-prose flex items-center justify-center w-full bg-card p-6 md:p-10 rounded-2xl border border-border shadow-sm transition-all hover:ring-4 hover:ring-primary/10 max-h-[600px] overflow-hidden"
				>
					<div 
						className="w-full h-full flex items-center justify-center [&>svg]:max-h-[540px] [&>svg]:w-auto [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:object-contain"
						dangerouslySetInnerHTML={{ __html: svg }}
					/>
				</div>
				
				<div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-background/60 backdrop-blur-md border border-border rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-sm">
					<Maximize2 className="w-3.5 h-3.5 text-primary" />
					<span className="text-[10px] font-black uppercase tracking-tight text-foreground">点击查看高清大图</span>
				</div>
			</div>

			{/* 全屏高清灯箱 */}
			<AnimatePresence>
				{isLightboxOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onWheel={handleWheel}
						className="fixed inset-0 z-[100] flex items-center justify-center bg-background/98 backdrop-blur-xl"
					>
						<button 
							onClick={toggleLightbox}
							className="absolute top-6 left-6 z-[110] p-3 bg-card border-2 border-border rounded-xl hover:bg-muted transition-all shadow-xl group"
						>
							<X className="w-6 h-6 text-foreground group-hover:scale-110 transition-transform" />
						</button>

						<div className="absolute top-6 right-6 flex items-center gap-2 z-[110] bg-card p-1.5 border-2 border-border rounded-2xl shadow-2xl">
							<button onClick={handleZoomIn} className="p-2.5 hover:bg-muted rounded-xl transition-colors text-foreground">
								<ZoomIn className="w-5 h-5" />
							</button>
							<button onClick={handleZoomOut} className="p-2.5 hover:bg-muted rounded-xl transition-colors text-foreground">
								<ZoomOut className="w-5 h-5" />
							</button>
							<button onClick={handleReset} className="p-2.5 hover:bg-muted rounded-xl transition-colors text-foreground">
								<RotateCcw className="w-5 h-5" />
							</button>
						</div>

						{/* 大图滚动区域 */}
						<div 
							className="w-full h-full overflow-auto flex items-center justify-center p-4 md:p-20 pt-24"
							onClick={toggleLightbox}
						>
							<motion.div
								initial={{ scale: 0.95, opacity: 0 }}
								animate={{ 
									scale: zoom,
									opacity: 1,
									transition: { type: "spring", damping: 30, stiffness: 200 }
								}}
								onClick={(e) => e.stopPropagation()}
								className="relative flex items-center justify-center"
							>
								<div 
									className="not-prose [&>svg]:!max-w-none [&>svg]:!h-auto [&>svg]:overflow-visible [&>svg]:min-h-[400px]"
									dangerouslySetInnerHTML={{ __html: svg }}
								/>
							</motion.div>
						</div>
						
						<div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-5 py-2 bg-primary/10 border-2 border-primary/20 rounded-full text-[11px] font-black uppercase tracking-widest text-primary shadow-lg pointer-events-none">
							使用上方工具栏缩放 • 移动端可双指操作
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}
