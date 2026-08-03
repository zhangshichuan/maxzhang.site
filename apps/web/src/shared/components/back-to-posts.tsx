import { useRouter } from '@tanstack/react-router'
import { Link, useLocale } from '@/src/i18n/client'
import { localizePath } from '@/i18n/routing'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function BackToPosts({ label }: { label: string }) {
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setLoading(true)
    router.navigate({ href: localizePath('/posts', locale) })
  }

  return (
    <Link
      href="/posts"
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
        fontSize: 12,
        color: 'rgba(255,255,255,.35)',
        textDecoration: 'none',
        textTransform: 'uppercase',
        letterSpacing: 2,
        transition: 'color .25s',
      }}
      onMouseEnter={(e) => {
        ;(e.target as HTMLElement).style.color = 'var(--cyan)'
      }}
      onMouseLeave={(e) => {
        ;(e.target as HTMLElement).style.color = 'rgba(255,255,255,.35)'
      }}
    >
      {loading ? (
        <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', color: 'var(--cyan)' }} />
      ) : (
        <ArrowLeft style={{ width: 14, height: 14 }} />
      )}
      {label}
    </Link>
  )
}
