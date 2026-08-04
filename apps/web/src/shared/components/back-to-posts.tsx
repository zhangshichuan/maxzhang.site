import { useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Link, useLocale } from '@/src/i18n/client'
import { localizePath } from '@/i18n/routing'

export function BackToPosts({ label }: { label: string }) {
  const router = useRouter()
  const locale = useLocale()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.navigate({ href: localizePath('/posts', locale) })
  }

  return (
    <Link href="/posts" onClick={handleClick} className="back-link">
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  )
}
