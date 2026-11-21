'use client'

import { useRouter, useRouterState } from '@tanstack/react-router'
import { localizePath, stripLocale } from '@/i18n/routing'
import { Link, useLocale } from '@/src/i18n/client'

const copy = {
  en: {
    sub: ['AI Product Manager', 'Portfolio / 2026'],
    homeNav: [
      { index: '01', label: 'Selected work', href: '#work' },
      { index: '02', label: 'Principles', href: '#principles' },
      { index: '03', label: 'Method', href: '#method' },
      { index: '04', label: 'Writing', href: '#writing' },
      { index: '05', label: 'Contact', href: '#contact' },
    ],
    pageNav: [
      { index: '01', key: 'work', label: 'Selected work', href: '/#work' },
      { index: '02', key: 'writing', label: 'Writing', href: '/posts' },
      { index: '03', key: 'photos', label: 'Photography', href: '/photos' },
      { index: '04', key: 'about', label: 'About', href: '/about' },
      { index: '05', key: 'contact', label: 'Contact', href: '/#contact' },
    ],
    live: 'Open for select projects',
    location: 'Shenzhen / Shanghai',
    scope: 'Working globally',
    updated: 'Last update 2026.11',
    navLabel: 'Primary',
    switchLabel: 'Switch to Chinese',
  },
  zh: {
    sub: ['AI 产品经理', '作品集 / 2026'],
    homeNav: [
      { index: '01', label: '精选案例', href: '#work' },
      { index: '02', label: '原则', href: '#principles' },
      { index: '03', label: '方法', href: '#method' },
      { index: '04', label: '写作', href: '#writing' },
      { index: '05', label: '联系', href: '#contact' },
    ],
    pageNav: [
      { index: '01', key: 'work', label: '精选案例', href: '/#work' },
      { index: '02', key: 'writing', label: '写作', href: '/posts' },
      { index: '03', key: 'photos', label: '摄影', href: '/photos' },
      { index: '04', key: 'about', label: '关于', href: '/about' },
      { index: '05', key: 'contact', label: '联系', href: '/#contact' },
    ],
    live: '开放少量合作',
    location: '深圳 / 上海',
    scope: '全球协作',
    updated: '最近更新 2026.11',
    navLabel: '主导航',
    switchLabel: '切换到英文',
  },
} as const

function activeKey(internalPath: string): string | null {
  if (internalPath.startsWith('/posts')) return 'writing'
  if (internalPath.startsWith('/photos')) return 'photos'
  if (internalPath.startsWith('/about')) return 'about'
  return null
}

export function NightRail() {
  const locale = useLocale()
  const t = copy[locale === 'zh' ? 'zh' : 'en']
  const router = useRouter()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const internalPath = stripLocale(pathname)
  const isHome = internalPath === '/'
  const active = activeKey(internalPath)

  const toggleLocale = () => {
    const target = localizePath(internalPath, locale === 'zh' ? 'en' : 'zh')
    router.navigate({ href: target, replace: true })
  }

  return (
    <aside className="ni-rail">
      <Link className="ni-brand" href="/" aria-label="Max Zhang — home">
        MZ<span>®</span>
      </Link>
      <p className="ni-rail-sub ni-mono">
        {t.sub[0]}
        <br />
        {t.sub[1]}
      </p>
      <nav className="ni-rail-nav" aria-label={t.navLabel}>
        {isHome
          ? t.homeNav.map((item) => (
              <a href={item.href} key={item.href}>
                <span aria-hidden="true">{item.index}</span>
                {item.label}
              </a>
            ))
          : t.pageNav.map((item) => {
              const isActive = active === item.key
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className={isActive ? 'is-active' : undefined}
                  aria-current={isActive ? 'page' : undefined}
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
        <button type="button" className="ni-locale" onClick={toggleLocale} aria-label={t.switchLabel}>
          {locale === 'zh' ? 'EN' : '中'}
        </button>
        <span>N°01</span>
      </div>
    </aside>
  )
}
