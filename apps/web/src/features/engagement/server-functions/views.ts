import { createServerFn } from '@tanstack/react-start'
import { incrementView as incrementViewService } from '@/src/features/engagement/services'

/**
 * 阅读数 +1（TanStack Server Function）
 *
 * 客户端挂载后调用，POST 防缓存；指纹用于去重。
 */
export const incrementView = createServerFn({ method: 'POST' })
  .validator((data: { slug: string; locale: string; fingerprint: string }) => data)
  .handler(async ({ data }) => incrementViewService(data.slug, data.locale, data.fingerprint))
