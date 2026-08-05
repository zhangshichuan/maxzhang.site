import { useRouter, useRouterState } from '@tanstack/react-router'
import { BookOpen, Home, Languages, Search, SlidersHorizontal, User } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { saveLocalePreference } from '@/i18n/locale-preference'
import { localizePath, stripLocale } from '@/i18n/routing'
import { cn } from '@/src/shared/utils'
import { AppearancePanel, PANEL_ID } from './appearance-panel'

export function Navbar() {
  const t = useTranslations('Common.nav')
  const locale = useLocale()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const router = useRouter()
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const appearanceTriggerRef = useRef<HTMLButtonElement | null>(null)

  const toggleLanguage = () => {
    const nextLocale = locale === 'zh' ? 'en' : 'zh'
    saveLocalePreference(nextLocale)
    router.navigate({
      href: localizePath(stripLocale(pathname), nextLocale),
      replace: true,
    })
  }

  const isActive = (path: string) => pathname === localizePath(path, locale)

  const toggleAppearance = (event: MouseEvent<HTMLButtonElement>) => {
    if (!appearanceOpen) appearanceTriggerRef.current = event.currentTarget
    setAppearanceOpen((prev) => !prev)
  }

  useEffect(() => {
    if (!appearanceOpen && appearanceTriggerRef.current) {
      appearanceTriggerRef.current.focus()
      appearanceTriggerRef.current = null
    }
  }, [appearanceOpen])

  const links = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/posts', label: t('posts'), icon: BookOpen },
    { path: '/about', label: t('about'), icon: User },
  ]

  return (
    <>
      <header className="site-header glass-toolbar">
        <Link href="/" className="site-logo">
          Max Zhang
        </Link>
        <nav className="desktop-nav" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.path} href={link.path} className={cn('desktop-nav-link', isActive(link.path) && 'active')}>
              {link.label}
            </Link>
          ))}
          <Link href="/search" className={cn('nav-icon-btn', isActive('/search') && 'active')} aria-label={t('search')}>
            <Search className="size-4" />
          </Link>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={toggleLanguage}
            title={t('switchLanguage')}
            aria-label={t('switchLanguage')}
          >
            <Languages className="size-4" />
          </button>
          <button
            type="button"
            className={cn('nav-icon-btn', appearanceOpen && 'active')}
            onClick={toggleAppearance}
            aria-label={t('appearance')}
            aria-haspopup="dialog"
            aria-controls={PANEL_ID}
            aria-expanded={appearanceOpen}
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </nav>
      </header>

      <nav className="mobile-tabbar glass-tabbar" aria-label="Primary">
        {links.map((link) => {
          const Icon = link.icon
          const active = isActive(link.path)
          return (
            <Link key={link.path} href={link.path} className={cn('tabbar-item', active && 'active')}>
              <span className="tabbar-icon">
                <Icon className="size-5" />
              </span>
              <span className="tabbar-label">{link.label}</span>
            </Link>
          )
        })}
        <Link href="/search" className={cn('tabbar-item', isActive('/search') && 'active')}>
          <span className="tabbar-icon">
            <Search className="size-5" />
          </span>
          <span className="tabbar-label">{t('search')}</span>
        </Link>
        <button type="button" className="tabbar-item" onClick={toggleLanguage} aria-label={t('switchLanguage')}>
          <span className="tabbar-icon">
            <Languages className="size-5" />
          </span>
          <span className="tabbar-label">{t('language')}</span>
        </button>
        <button
          type="button"
          className={cn('tabbar-item tabbar-action', appearanceOpen && 'active')}
          onClick={toggleAppearance}
          aria-label={t('appearance')}
          aria-haspopup="dialog"
          aria-controls={PANEL_ID}
          aria-expanded={appearanceOpen}
        >
          <span className="tabbar-icon">
            <SlidersHorizontal className="size-5" />
          </span>
          <span className="tabbar-label">{t('appearance')}</span>
        </button>
      </nav>

      <AppearancePanel open={appearanceOpen} onClose={() => setAppearanceOpen(false)} />
    </>
  )
}
