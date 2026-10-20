import { useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { localizePath, stripLocale } from '@/i18n/routing'

/**
 * Flow Field 导航：纸面固定条 + 下滑隐藏。
 * 首页的「联系」是页内锚点（data-jump，交给粒子场引擎做冲击波转场）；
 * 其他页面跳到首页锚点。语言切换只改 URL。
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
    router.navigate({
      href: localizePath(internalPath, locale === 'zh' ? 'en' : 'zh'),
      replace: true,
    })
  }

  // 下滑隐藏顶栏、上滑出现；首页粒子场引擎也会维护同一个 class，两者结果一致。
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
        if (y > 160 && y > lastY + 2) el.classList.add('is-hidden')
        else if (y < lastY - 2 || y < 90) el.classList.remove('is-hidden')
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
    <header ref={headerRef} className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          Max Zhang
          <span className="brand-dot" aria-hidden="true" />
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link href="/">{t('home')}</Link>
          <Link href="/posts">{t('posts')}</Link>
          <Link href="/about">{t('about')}</Link>
          {isHome ? (
            <a className="contact-link" href="#contact" data-jump>
              {t('contact')} <i aria-hidden="true">↗</i>
            </a>
          ) : (
            <Link className="contact-link" href="/#contact">
              {t('contact')} <i aria-hidden="true">↗</i>
            </Link>
          )}
          <button type="button" className="nav-lang" onClick={toggleLanguage} aria-label={t('switchLanguage')}>
            {locale === 'zh' ? 'EN' : '中'}
          </button>
        </nav>
      </div>
    </header>
  )
}
