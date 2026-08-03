import { useRouter, useRouterState } from '@tanstack/react-router'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { localizePath, stripLocale } from '@/i18n/routing'
import { Languages, Search } from 'lucide-react'

export function Navbar() {
  const t = useTranslations('Common.nav')
  const locale = useLocale()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const router = useRouter()

  const toggleLanguage = () => {
    const nextLocale = locale === 'zh' ? 'en' : 'zh'
    router.navigate({
      href: localizePath(stripLocale(pathname), nextLocale),
      replace: true,
    })
  }

  const isActive = (path: string) => pathname === localizePath(path, locale)

  return (
    <header>
      <Link href="/" className="logo">
        MAXZHANG
      </Link>
      <nav>
        <Link href="/" style={isActive('/') ? { color: 'var(--cyan)' } : undefined}>
          [home]
        </Link>
        <Link href="/posts" style={isActive('/posts') ? { color: 'var(--cyan)' } : undefined}>
          [posts]
        </Link>
        <Link href="/about" style={isActive('/about') ? { color: 'var(--cyan)' } : undefined}>
          [about]
        </Link>
        <Link href="/search" aria-label={t('search')}>
          <Search className="size-3.5" />
        </Link>
        <button
          onClick={toggleLanguage}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,.35)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          title={t('switchLanguage')}
          aria-label={t('switchLanguage')}
        >
          <Languages className="size-3.5" />
        </button>
      </nav>
    </header>
  )
}
