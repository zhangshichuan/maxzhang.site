import type { Locale } from '@/i18n/routing'

/**
 * 语言偏好
 *
 * 语言本身仍由 URL 决定（ADR-0002）；
 * 本地只额外记录“用户手动选择过的语言”，用于无前缀首页的自动跳转。
 */
export const LOCALE_STORAGE_KEY = 'maxzhang.locale'

export type StoredLocale = 'zh' | 'en'

export function readStoredLocale(): StoredLocale | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return raw === 'zh' || raw === 'en' ? raw : null
  } catch {
    return null
  }
}

export function saveLocalePreference(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // localStorage 不可用时静默降级：本次会话内仍按 URL 生效
  }
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const lang of candidates) {
    const normalized = lang.toLowerCase()
    if (normalized.startsWith('zh')) return 'zh'
    if (normalized.startsWith('en')) return 'en'
  }
  return 'en'
}

/**
 * 首屏语言脚本
 *
 * 在水合前执行：有本地偏好则用之，否则按浏览器语言判断；
 * 当目标为 zh 且当前 URL 是无前缀（默认 en）路径时，直接 location.replace 到 /zh，
 * 避免先渲染英文再跳转的闪烁。显式 /zh 链接永远保持中文。
 */
export const LOCALE_INLINE_SCRIPT = `(function(){try{var K='maxzhang.locale';var raw=localStorage.getItem(K);var want=(raw==='zh'||raw==='en')?raw:((((navigator.languages&&navigator.languages.length)?navigator.languages[0]:navigator.language)||'en').toLowerCase().indexOf('zh')===0?'zh':'en');var p=location.pathname;var inZh=p==='/zh'||p.indexOf('/zh/')===0;if(want==='zh'&&!inZh){var t=p==='/'?'/zh':'/zh'+p;location.replace(t+location.search+location.hash)}}catch(e){}})();`
