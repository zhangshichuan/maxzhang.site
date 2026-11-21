'use client'

import { useLocale } from '@/src/i18n/client'
import { Link } from '@/src/i18n/client'

const copy = {
  en: {
    brand: 'MZ® / MAX ZHANG / PRODUCT-MINDED AI BUILDER',
    writing: 'Writing',
    photos: 'Photography',
    about: 'About',
    search: 'Search',
    chat: 'Tree hole',
    github: 'GitHub',
    email: 'Email',
    location: 'Chengdu, China',
    copyright: `© ${new Date().getFullYear()} · Max Zhang`,
  },
  zh: {
    brand: 'MZ® / MAX ZHANG / PRODUCT-MINDED AI BUILDER',
    writing: '写作',
    photos: '摄影',
    about: '关于',
    search: '搜索',
    chat: '树洞',
    github: 'GitHub',
    email: '邮件',
    location: '成都，中国',
    copyright: `© ${new Date().getFullYear()} · Max Zhang`,
  },
} as const

export function NightFooter() {
  const locale = useLocale()
  const t = copy[locale === 'zh' ? 'zh' : 'en']

  return (
    <footer className="ni-footer">
      <div className="ni-foot ni-mono">
        <span>{t.brand}</span>
        <nav className="ni-foot-nav" aria-label="Footer">
          <Link href="/posts">{t.writing}</Link>
          <Link href="/photos">{t.photos}</Link>
          <Link href="/about">{t.about}</Link>
          <Link href="/search">{t.search}</Link>
        </nav>
        <span>
          <a href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
            {t.github} ↗
          </a>{' '}
          · <a href="mailto:zsc.guru@qq.com">{t.email}</a> · <Link href="/chat">{t.chat}</Link>
        </span>
        <span>
          {t.copyright} · {t.location}
        </span>
      </div>
    </footer>
  )
}
