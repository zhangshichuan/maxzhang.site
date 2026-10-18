import { useRouter, useRouterState } from '@tanstack/react-router'
import { FileText, Home, Languages, MoreHorizontal, Search, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
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

  // 语言切换只改 URL：en 无前缀、zh 带 /zh，不做自动跳转
  const toggleLanguage = () => {
    const nextLocale = locale === 'zh' ? 'en' : 'zh'
    router.navigate({
      href: localizePath(stripLocale(pathname), nextLocale),
      replace: true,
    })
  }

  const isActive = (path: string) => pathname === localizePath(path, locale)
  const internalPath = stripLocale(pathname)
  const pathLabel = internalPath === '/' ? '~/overview' : `~${internalPath}`

  // 滚动后给系统栏加重一点边框
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
    { path: '/posts', label: t('posts'), icon: FileText },
    { path: '/about', label: t('about'), icon: User },
  ]

  return (
    <>
      <header ref={headerRef} className="site-header">
        <div className="os-bar-left">
          <Link href="/" className="site-logo">
            MZ/OS
          </Link>
          <span className="os-path" aria-hidden>
            {pathLabel}
          </span>
        </div>
        <nav className="desktop-nav" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.path} href={link.path} className={cn('desktop-nav-link', isActive(link.path) && 'active')}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="os-bar-right">
          <Link href="/search" className={cn('nav-icon-btn', isActive('/search') && 'active')} aria-label={t('search')}>
            <Search className="size-4" />
          </Link>
          <button
            type="button"
            className={cn('nav-icon-btn', moreOpen && 'active')}
            onClick={() => setMoreOpen((current) => !current)}
            title={t('more')}
            aria-label={t('more')}
            aria-expanded={moreOpen}
          >
            <MoreHorizontal className="size-4" />
          </button>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={toggleLanguage}
            title={t('switchLanguage')}
            aria-label={t('switchLanguage')}
          >
            <Languages className="size-4" />
          </button>
        </div>
      </header>

      <nav className="mobile-tabbar" aria-label="Primary">
        {links.map((link) => {
          const Icon = link.icon
          const active = isActive(link.path)
          return (
            <Link key={link.path} href={link.path} className={cn('tabbar-item', active && 'active')}>
              <span className="tabbar-icon">
                <Icon className="size-4" />
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
            <MoreHorizontal className="size-4" />
          </span>
          <span className="tabbar-label">{t('more')}</span>
        </button>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} onLanguage={toggleLanguage} />
    </>
  )
}
