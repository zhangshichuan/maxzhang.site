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
      className="
        group mb-10 inline-flex items-center rounded-xl border-2
        border-transparent bg-secondary/10 px-4 py-2 text-sm font-black
        tracking-widest text-muted-foreground uppercase transition-all
        hover:border-border hover:text-primary
      "
    >
      {loading ? (
        <Loader2 className="mr-2 size-5 animate-spin text-primary" />
      ) : (
        <ArrowLeft
          className="
            mr-2 size-5 transition-transform
            group-hover:-translate-x-1
          "
        />
      )}
      {label}
    </Link>
  )
}
