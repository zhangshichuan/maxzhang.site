'use client'

import { useState } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { ArrowLeft, Loader2 } from 'lucide-react'

export function BackToPosts({ label }: { label: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setLoading(true)
    router.push('/posts')
  }

  return (
    <Link
      href="/posts"
      onClick={handleClick}
      className="group mb-8 inline-flex items-center gap-2 font-serif text-sm tracking-wide text-muted-foreground transition-colors hover:text-primary"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin text-primary" />
      ) : (
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      )}
      {label}
    </Link>
  )
}
