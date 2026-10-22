import { useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { localizePath, stripLocale } from '@/i18n/routing'

/**
 * Final shell — fixed kinetic index bar.
 * Contact stays an in-page anchor on the home page.
 */
export function Navbar() {
  const t = useTranslations('Common.nav')
  const locale = useLocale()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const router = useRouter()
  const headerRef = useRef<HTMLElement | null>(null)

  const internalPath = stripLocale(pathname)
  const isHome = internalPath === '/'

  const toggleLanguage = () => {
    router.navigate({ href: localizePath(internalPath, locale === 'zh' ? 'en' : 'zh'), replace: true })
  }

  useEffect(() => {
    let lastY = window.scrollY || 0
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const y = window.scrollY || 0
        const el = headerRef.current
        if (!el) return
        if (y > 200 && y > lastY + 3) el.classList.add('is-hidden')
        else if (y < lastY - 3 || y < 120) el.classList.remove('is-hidden')
        lastY = y
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header ref={headerRef} className="zx-nav">
      <div className="zx-nav-inner">
        <Link className="zx-brand" href="/">
          <span className="zx-brand-mark" aria-hidden="true">
            MZ
          </span>
          <span className="zx-brand-name">Max Zhang</span>
        </Link>
        <nav className="zx-nav-links" aria-label="Primary">
          <Link href="/">{t('home')}</Link>
          <Link href="/posts">{t('posts')}</Link>
          <Link href="/photos">{t('photos')}</Link>
          <Link href="/about">{t('about')}</Link>
          {isHome ? (
            <a href="#contact">{t('contact')}</a>
          ) : (
            <Link href="/#contact">{t('contact')}</Link>
          )}
        </nav>
        <div className="zx-nav-meta">
          <span className="zx-nav-state">
            <span className="zx-dot" aria-hidden="true" />
            AI PM / 2026
          </span>
          <button type="button" className="zx-lang" onClick={toggleLanguage} aria-label={t('switchLanguage')}>
            {locale === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </div>
    </header>
  )
}
