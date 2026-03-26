'use client'

import { getViewCount } from '@/lib/actions/views'
import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ViewDisplayProps {
	slug: string
	locale: string
}

export function ViewDisplay({ slug, locale }: ViewDisplayProps) {
	const [views, setViews] = useState<number | null>(null)

	useEffect(() => {
		const fetchViews = async () => {
			try {
				const count = await getViewCount(slug, locale)
				setViews(count)
			} catch (error) {
				console.error('Failed to fetch views:', error)
			}
		}

		fetchViews()
	}, [slug, locale])

	return (
		<span className="flex items-center gap-1.5 rounded-md border border-border/5 bg-muted px-2 py-1">
			<Eye className="size-4 text-primary" />
			{views === null ? (
				<span className="h-3 w-4 animate-pulse rounded-sm bg-muted-foreground/20"></span>
			) : (
				<span>{views}</span>
			)}
		</span>
	)
}
