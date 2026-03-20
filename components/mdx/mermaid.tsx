'use client'

import mermaid from 'mermaid'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface MermaidProps {
	chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
	const { resolvedTheme } = useTheme()
	const [svg, setSvg] = useState<string>('')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const isDark = resolvedTheme === 'dark'

		mermaid.initialize({
			startOnLoad: true,
			theme: isDark ? 'dark' : 'default',
			securityLevel: 'loose',
			fontFamily: 'inherit',
			themeVariables: {
				fontFamily: 'inherit',
			},
		})

		const renderChart = async () => {
			if (chart) {
				try {
					// We need a unique ID for each render
					const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`
					const { svg } = await mermaid.render(id, chart)
					setSvg(svg)
					setError(null)
				} catch (err) {
					console.error('Mermaid render error:', err)
					setError('Failed to render diagram')
				}
			}
		}

		renderChart()
	}, [chart, resolvedTheme])

	if (error) {
		return <div className="p-4 border border-red-500 text-red-500 rounded my-4 text-sm">{error}</div>
	}

	return (
		<div
			className="flex items-center justify-center my-10 overflow-x-auto w-full bg-card py-12 px-4 rounded-xl border border-border shadow-sm min-h-50"
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	)
}
