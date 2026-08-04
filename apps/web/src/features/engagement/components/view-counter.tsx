import { incrementView } from '@/src/features/engagement/server-functions'
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
        const count = await incrementView({
          data: { slug, locale, fingerprint: response.thumbmark },
        })
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
    <span className="stat-pill">
      <Eye className="size-3.5 text-primary" />
      {views === null ? (
        <span
          className="inline-block h-3 w-7 animate-pulse rounded-full"
          style={{ background: 'var(--label-tertiary)' }}
        ></span>
      ) : (
        <span>{views}</span>
      )}
    </span>
  )
}
