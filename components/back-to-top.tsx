'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export function BackToTop() {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const toggleVisibility = () => {
			setIsVisible(window.scrollY > 400)
		}

		window.addEventListener('scroll', toggleVisibility, { passive: true })
		return () => window.removeEventListener('scroll', toggleVisibility)
	}, [])

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	if (!isVisible) return null

	return (
		<button
			onClick={scrollToTop}
			aria-label="Back to top"
			className="
			fixed
				right-8 bottom-8 z-50 cursor-pointer
				rounded-full bg-primary p-3
				text-primary-foreground shadow-lg
				transition-all hover:scale-110 hover:bg-primary/90
				active:scale-95
			"
		>
			<ArrowUp className="size-6" />
		</button>
	)
}
