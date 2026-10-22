import { useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { localizePath, stripLocale } from '@/i18n/routing'

/**
 * Fashion-editorial masthead. Fixed; hides on scroll down.
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
    <header ref={headerRef} className="fx-nav">
      <div className="fx-nav-inner">
        <Link className="fx-brand" href="/">
          <span className="fx-brand-mark">MZ</span>
          <span className="fx-brand-name">Max Zhang</span>
        </Link>
        <nav className="fx-nav-links" aria-label="Primary">
          <Link href="/">{t('home')}</Link>
          <Link href="/posts">{t('posts')}</Link>
          <Link href="/photos">{t('photos')}</Link>
          <Link href="/about">{t('about')}</Link>
          {isHome ? <a href="#contact">{t('contact')}</a> : <Link href="/#contact">{t('contact')}</Link>}
        </nav>
        <div className="fx-nav-meta">
          <span className="fx-nav-edition">
            <span className="fx-dot" aria-hidden="true" />
            Portfolio — N°01 / 2026
          </span>
          <button type="button" className="fx-lang" onClick={toggleLanguage} aria-label={t('switchLanguage')}>
            {locale === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </div>
    </header>
  )
}
