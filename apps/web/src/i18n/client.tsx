import { Link as RouterLink, useRouterState } from '@tanstack/react-router'
import * as React from 'react'
import type { Locale } from '@/i18n/routing'
import { getLocaleFromPathname, isExternalHref, localizePath, routing, stripLocale } from '@/i18n/routing'
import enMessages from '@/messages/en.json'
import zhMessages from '@/messages/zh.json'

const messageMap: Record<Locale, Record<string, unknown>> = {
  zh: zhMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
}

/**
 * 当前语言：与 URL 约定一致，/en 前缀 → en，其余 → zh。
 * SSR 与客户端都从路由状态读取，保证水合一致。
 */
export function useLocale(): Locale {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  return getLocaleFromPathname(pathname)
}

type MessageNode = Record<string, unknown> | string | unknown[] | undefined

function lookup(messages: Record<string, unknown>, path: string): MessageNode {
  let node: MessageNode = messages
  for (const key of path.split('.')) {
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      node = (node as Record<string, unknown>)[key] as MessageNode
    } else {
      return undefined
    }
  }
  return node
}

export interface Translator {
  (key: string, params?: Record<string, string | number>): string
  raw<T = unknown>(key: string): T
  has(key: string): boolean
}

/**
 * 轻量 useTranslations：支持命名空间、{var} 插值、t.raw 取数组/对象。
 * 签名与 next-intl 常用子集保持一致，迁移期组件无需大改。
 */
export function useTranslations(namespace: string): Translator {
  const locale = useLocale()
  const messages = messageMap[locale]

  const t = ((key: string, params?: Record<string, string | number>) => {
    const value = lookup(messages, `${namespace}.${key}`)
    if (typeof value !== 'string') return String(value ?? key)
    if (!params) return value
    return value.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match))
  }) as Translator

  t.raw = <T = unknown,>(key: string): T => lookup(messages, `${namespace}.${key}`) as T
  t.has = (key: string): boolean => lookup(messages, `${namespace}.${key}`) !== undefined

  return t
}

/**
 * 语言感知的 Link：
 * - 内部路径自动加 /en 前缀（zh 不加）
 * - 外部链接 / mailto / 锚点原样渲染
 * - href 可以是完整路径（含 query），交给 TanStack Router 的 href 导航
 */
export interface I18nLinkProps extends Omit<React.ComponentProps<'a'>, 'href'> {
  href: string
  locale?: Locale
  /** 兼容旧代码的 prefetch 语义，映射为 TanStack 的 preload */
  prefetch?: boolean
}

export function Link({ href, locale, prefetch = true, ...props }: I18nLinkProps) {
  const activeLocale = useLocale()
  const currentLocale = locale ?? activeLocale

  if (isExternalHref(href)) {
    return <a href={href} {...props} />
  }

  // TanStack Router 的 Link 渲染用 to/search/hash，不认 href 选项，
  // 这里把完整 href（含 query）拆开再交给 RouterLink。
  const localized = localizePath(href, currentLocale)
  const [path, queryAndHash = ''] = localized.split('?')
  const [query = '', hash = ''] = queryAndHash.split('#')
  const search = query ? Object.fromEntries(new URLSearchParams(query)) : undefined

  return (
    <RouterLink
      to={path || '/'}
      search={search}
      hash={hash || undefined}
      preload={prefetch ? 'intent' : false}
      activeProps={{ className: undefined }}
      {...props}
    />
  )
}

export { routing, stripLocale }
