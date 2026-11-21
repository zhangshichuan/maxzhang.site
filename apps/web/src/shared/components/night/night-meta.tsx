'use client'

import { useRouterState } from '@tanstack/react-router'
import { stripLocale } from '@/i18n/routing'
import { useLocale } from '@/src/i18n/client'

const copy = {
  en: {
    status: 'Open to AI product collaborations',
    labels: {
      home: 'Chengdu / 2026 / Product-minded AI builder',
      posts: 'Writing / 2026 / Index',
      article: 'Writing / 2026 / File',
      about: 'File / 2026 / About',
      photos: 'Archive / 2026 / Photography',
      search: 'Index / 2026 / Search',
      chat: 'Channel / 2026 / Tree hole',
      admin: 'Private / 2026 / Admin',
      login: 'Private / 2026 / Access',
    },
  },
  zh: {
    status: '开放 AI 产品合作',
    labels: {
      home: '成都 / 2026 / Product-minded AI builder',
      posts: '写作 / 2026 / 索引',
      article: '写作 / 2026 / 文章',
      about: '档案 / 2026 / 关于',
      photos: '档案 / 2026 / 摄影',
      search: '索引 / 2026 / 搜索',
      chat: '频道 / 2026 / 树洞',
      admin: '私有 / 2026 / 后台',
      login: '私有 / 2026 / 登录',
    },
  },
} as const

type Section = keyof (typeof copy)['en']['labels']

function getSection(internalPath: string): Section {
  if (internalPath === '/') return 'home'
  if (internalPath === '/posts') return 'posts'
  if (internalPath.startsWith('/posts/')) return 'article'
  if (internalPath === '/about') return 'about'
  if (internalPath === '/photos') return 'photos'
  if (internalPath === '/search') return 'search'
  if (internalPath === '/chat') return 'chat'
  if (internalPath === '/admin') return 'admin'
  if (internalPath === '/login') return 'login'
  return 'home'
}

export function NightMeta() {
  const locale = useLocale()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const t = copy[locale === 'zh' ? 'zh' : 'en']
  const section = getSection(stripLocale(pathname))

  return (
    <div className="ni-meta ni-mono">
      <span className="ni-meta-path">
        <b aria-hidden="true">●</b>
        {t.labels[section]}
      </span>
      <div className="ni-meta-actions">
        <span className="ni-system">{t.status}</span>
      </div>
    </div>
  )
}
