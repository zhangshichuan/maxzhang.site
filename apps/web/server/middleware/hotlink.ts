import { defineEventHandler, getHeader, setResponseStatus } from 'h3'

/**
 * 摄影展示副本防盗链（生产环境）
 *
 * 仅允许同源引用与直接打开（无 Referer / sec-fetch-site: none），
 * 跨站 Referer 与 sec-fetch-site: cross-site / same-site 一律 403。
 * dev 环境的等价逻辑见 vite.config.ts 的 hotlinkProtectionPlugin。
 */
export default defineEventHandler((event) => {
  const url = event.path || ''
  if (!url.startsWith('/photos/photos/')) return

  const host = getHeader(event, 'host') ?? ''
  const referer = getHeader(event, 'referer')
  const secFetchSite = getHeader(event, 'sec-fetch-site')

  if (secFetchSite === 'same-origin' || secFetchSite === 'none') return
  if (secFetchSite === 'same-site' || secFetchSite === 'cross-site') {
    return deny()
  }
  if (referer) {
    try {
      if (new URL(referer).host === host) return
    } catch {
      // 非法 Referer 一律视为外部引用
    }
    return deny()
  }

  function deny() {
    setResponseStatus(event, 403)
    return 'Forbidden'
  }
})
