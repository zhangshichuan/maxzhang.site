'use client'

import { useRouter, useRouterState } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { localizePath, stripLocale } from '@/i18n/routing'
import { Link, useLocale } from '@/src/i18n/client'
import { cn } from '@/src/shared/utils/cn'
import { LOCALE_STORAGE_KEY } from './locale'
import { ThemeToggle } from './theme-toggle'

const copy = {
  en: {
    sub: ['Product-minded AI builder', 'Portfolio / 2026'],
    nav: [
      { index: '01', key: 'home', label: 'Overview', href: '/' },
      { index: '02', key: 'writing', label: 'Writing', href: '/posts' },
      { index: '03', key: 'photos', label: 'Photography', href: '/photos' },
      { index: '04', key: 'about', label: 'About', href: '/about' },
      { index: '05', key: 'search', label: 'Search', href: '/search' },
      { index: '06', key: 'chat', label: 'Night Banquet', href: '/chat' },
      { index: '07', key: 'contact', label: 'Contact', href: '/#contact' },
    ],
    live: 'Open to AI product collaborations',
    location: 'Chengdu, China',
    scope: 'Building globally',
    updated: 'Last update 2026.11',
    navLabel: 'Primary',
    switchLabel: 'Switch to Chinese',
  },
  zh: {
    sub: ['Product-minded AI builder', '作品集 / 2026'],
    nav: [
      { index: '01', key: 'home', label: '概览', href: '/' },
      { index: '02', key: 'writing', label: '写作', href: '/posts' },
      { index: '03', key: 'photos', label: '摄影', href: '/photos' },
      { index: '04', key: 'about', label: '关于', href: '/about' },
      { index: '05', key: 'search', label: '搜索', href: '/search' },
      { index: '06', key: 'chat', label: '夜宴', href: '/chat' },
      { index: '07', key: 'contact', label: '联系', href: '/#contact' },
    ],
    live: '开放 AI 产品合作',
    location: '成都，中国',
    scope: '面向全球协作',
    updated: '最近更新 2026.11',
    navLabel: '主导航',
    switchLabel: '切换到英文',
  },
} as const

function activeKey(internalPath: string): string {
  if (internalPath === '/') return 'home'
  if (internalPath.startsWith('/posts')) return 'writing'
  if (internalPath.startsWith('/photos')) return 'photos'
  if (internalPath.startsWith('/about')) return 'about'
  if (internalPath.startsWith('/search')) return 'search'
  if (internalPath.startsWith('/chat')) return 'chat'
  return ''
}

export function NightRail() {
  const locale = useLocale()
  const t = copy[locale === 'zh' ? 'zh' : 'en']
  const router = useRouter()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const internalPath = stripLocale(pathname)
  const active = activeKey(internalPath)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [internalPath])

  const toggleLocale = () => {
    const nextLocale = locale === 'zh' ? 'en' : 'zh'
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    } catch {
      // Storage can be unavailable in private contexts; navigation still works.
    }
    router.navigate({ href: localizePath(internalPath, nextLocale), replace: true })
  }

  return (
    <aside className="ni-rail">
      <div className="ni-rail-top">
        <Link className="ni-brand" href="/" aria-label="Max Zhang — home">
          MZ<span>®</span>
        </Link>
        <div className="ni-mobile-actions">
          <ThemeToggle />
          <button type="button" className="ni-locale" onClick={toggleLocale} aria-label={t.switchLabel}>
            {locale === 'zh' ? 'EN' : '中'}
          </button>
          <button
            type="button"
            className="ni-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="ni-rail-nav"
            aria-label={
              menuOpen ? (locale === 'zh' ? '关闭菜单' : 'Close menu') : locale === 'zh' ? '打开菜单' : 'Open menu'
            }
          >
            {menuOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <p className="ni-rail-sub ni-mono">
        {t.sub[0]}
        <br />
        {t.sub[1]}
      </p>
      <nav id="ni-rail-nav" className={cn('ni-rail-nav', menuOpen && 'is-open')} aria-label={t.navLabel}>
        {t.nav.map((item) => {
          const isActive = active === item.key
          return (
            <Link
              href={item.href}
              key={item.href}
              className={isActive ? 'is-active' : undefined}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true">{item.index}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="ni-rail-status">
        <span className="ni-live">{t.live}</span>
        <p className="ni-mono">
          <b>{t.location}</b>
          <br />
          {t.scope}
          <br />
          {t.updated}
        </p>
      </div>
      <div className="ni-rail-end">
        <div className="ni-rail-prefs">
          <button type="button" className="ni-locale" onClick={toggleLocale} aria-label={t.switchLabel}>
            {locale === 'zh' ? 'EN' : '中'}
          </button>
          <ThemeToggle />
        </div>
        <span>N°01</span>
      </div>
    </aside>
  )
}
