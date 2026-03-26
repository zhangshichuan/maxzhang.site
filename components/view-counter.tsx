'use client'

import { incrementView } from '@/lib/actions/views'
import { getThumbmark } from '@thumbmarkjs/thumbmarkjs'
import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ViewCounterProps {
	slug: string
	locale: string
}

export function ViewCounter({ slug, locale }: ViewCounterProps) {
	const [views, setViews] = useState<number | null>(null)

	useEffect(() => {
		const trackView = async () => {
			try {
				const response = await getThumbmark()
				const count = await incrementView(slug, locale, response.thumbmark)
				if (count !== null) {
					setViews(count)
				}
			} catch (error) {
				console.error('Failed to track view:', error)
			}
		}

		trackView()
	}, [slug, locale])

	return (
		<span className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
			<Eye className="size-5 text-primary" />
			{views === null ? (
				<span className="h-4 w-8 animate-pulse rounded-sm bg-muted-foreground/20"></span>
			) : (
				<span>{views}</span>
			)}
		</span>
	)
}
