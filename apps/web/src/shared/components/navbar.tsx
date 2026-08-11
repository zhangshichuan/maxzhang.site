import { useRouter, useRouterState } from '@tanstack/react-router'
import {
  BookOpen,
  Camera,
  Home,
  Languages,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Sparkles,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { saveLocalePreference } from '@/i18n/locale-preference'
import { localizePath, stripLocale } from '@/i18n/routing'
import { cn } from '@/src/shared/utils'
import { AppearancePanel, PANEL_ID } from './appearance-panel'
import { MoreSheet } from './more-sheet'

export function Navbar() {
  const t = useTranslations('Common.nav')
  const locale = useLocale()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const router = useRouter()
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const appearanceTriggerRef = useRef<HTMLButtonElement | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const desktopNavRef = useRef<HTMLElement | null>(null)
  const tabbarRef = useRef<HTMLElement | null>(null)
  const [desktopPill, setDesktopPill] = useState<{ left: number; width: number } | null>(null)
  const [tabbarPill, setTabbarPill] = useState<{ left: number; width: number; top: number } | null>(null)

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

  // 玻璃胶囊指示器：跟随当前激活项滑动（带轻微过冲的缓动）
  useEffect(() => {
    const updatePills = () => {
      const measure = (container: HTMLElement | null) => {
        if (!container) return null
        const active = container.querySelector<HTMLElement>('.active')
        if (!active) return null
        return { left: active.offsetLeft, width: active.offsetWidth }
      }

      const measureTabbar = (container: HTMLElement | null) => {
        if (!container) return null
        const active = container.querySelector<HTMLElement>('.active')
        if (!active) return null
        const containerRect = container.getBoundingClientRect()
        const itemRect = active.getBoundingClientRect()
        const padX = 3
        const pillHeight = 54
        return {
          left: itemRect.left - containerRect.left + padX,
          width: itemRect.width - padX * 2,
          top: itemRect.top - containerRect.top + (itemRect.height - pillHeight) / 2,
        }
      }

      setDesktopPill(measure(desktopNavRef.current))
      setTabbarPill(measureTabbar(tabbarRef.current))
    }

    updatePills()
    const onResize = () => updatePills()
    window.addEventListener('resize', onResize)
    window.addEventListener('load', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', onResize)
    }
  }, [pathname])

  // 滚动后增强导航栏玻璃感（rAF 节流）
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
      <header ref={headerRef} className="site-header glass-toolbar">
        <Link href="/" className="site-logo">
          Max Zhang
        </Link>
        <nav className="desktop-nav" ref={desktopNavRef} aria-label="Primary">
          {desktopPill && (
            <span
              className="nav-glass-indicator desktop"
              style={{ left: desktopPill.left, width: desktopPill.width }}
              aria-hidden="true"
            />
          )}
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

      <nav className="mobile-tabbar glass-tabbar" ref={tabbarRef} aria-label="Primary">
        {tabbarPill && (
          <span
            className="nav-glass-indicator tabbar"
            style={{ left: tabbarPill.left, width: tabbarPill.width, top: tabbarPill.top }}
            aria-hidden="true"
          />
        )}
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

      <MoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onLanguage={toggleLanguage}
        onAppearance={() => setAppearanceOpen(true)}
      />
      <AppearancePanel open={appearanceOpen} onClose={() => setAppearanceOpen(false)} />
    </>
  )
}
