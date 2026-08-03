/**
 * 国际化路由配置（自建薄层）
 *
 * 保留原 next-intl 的 URL 约定：zh 无前缀、en 带 /en 前缀。
 * 纯 TS 常量 + 路径工具，不依赖任何框架。
 */
export const locales = ['zh', 'en'] as const
export type Locale = (typeof locales)[number]

export const routing = {
  locales,
  defaultLocale: 'zh' as Locale,
  // 兼容旧配置语义：默认语言不使用前缀
  localePrefix: 'as-needed' as const,
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/**
 * 从路径推断当前语言。
 * `/en/...` → en，其余路径 → zh（默认语言无前缀）。
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? ''
  return isLocale(first) ? first : routing.defaultLocale
}

/**
 * 去掉路径中的语言前缀，返回不带 locale 的内部路径。
 * `/en/posts` → `/posts`；`/posts` → `/posts`。
 */
export function stripLocale(pathname: string): string {
  const locale = getLocaleFromPathname(pathname)
  if (locale === routing.defaultLocale) return pathname
  return pathname.slice(locale.length + 1) || '/'
}

/**
 * 把内部路径转换为指定语言的完整路径。
 */
export function localizePath(path: string, locale: Locale = routing.defaultLocale): string {
  if (locale === routing.defaultLocale) return path
  if (path === '/') return `/${locale}`
  return `/${locale}/${path.replace(/^\//, '')}`
}

/**
 * 判断是否为外部链接或锚点，内部导航不需要加语言前缀。
 */
export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:|#|\/\/)/i.test(href)
}
