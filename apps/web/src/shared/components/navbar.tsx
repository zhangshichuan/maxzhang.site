import { useRouter, useRouterState } from '@tanstack/react-router'
import { BookOpen, Camera, Home, Languages, MoreHorizontal, Search, Sparkles, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { saveLocalePreference } from '@/i18n/locale-preference'
import { localizePath, stripLocale } from '@/i18n/routing'
import { cn } from '@/src/shared/utils'
import { MoreSheet } from './more-sheet'

export function Navbar() {
  const t = useTranslations('Common.nav')
  const locale = useLocale()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)

  const toggleLanguage = () => {
    const nextLocale = locale === 'zh' ? 'en' : 'zh'
    saveLocalePreference(nextLocale)
    router.navigate({
      href: localizePath(stripLocale(pathname), nextLocale),
      replace: true,
    })
  }

  const isActive = (path: string) => pathname === localizePath(path, locale)

  // 滚动后给导航栏增加一点背景与阴影
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        headerRef.current?.classList.toggle('scrolled', window.scrollY > 8)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const links = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/posts', label: t('posts'), icon: BookOpen },
    { path: '/photos', label: t('photos'), icon: Camera },
    { path: '/chat', label: t('chat'), icon: Sparkles },
    { path: '/about', label: t('about'), icon: User },
  ]

  const primaryLinks = links.filter((link) => link.path !== '/about')

  return (
    <>
      <header ref={headerRef} className="site-header">
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
        </nav>
      </header>

      <nav className="mobile-tabbar" aria-label="Primary">
        {primaryLinks.map((link) => {
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
        <button
          type="button"
          className={cn('tabbar-item', moreOpen && 'active')}
          onClick={() => setMoreOpen((current) => !current)}
          aria-label={t('more')}
          aria-expanded={moreOpen}
        >
          <span className="tabbar-icon">
            <MoreHorizontal className="size-5" />
          </span>
          <span className="tabbar-label">{t('more')}</span>
        </button>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} onLanguage={toggleLanguage} />
    </>
  )
}
