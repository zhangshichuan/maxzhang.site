import { createServerFn } from '@tanstack/react-start'
import { registerFingerprint as registerFingerprintService } from '@/src/features/engagement/services/fingerprint.server'

/**
 * 首页指纹登记（TanStack Server Function）
 *
 * 首页挂载后调用，确保该浏览器指纹已存在于 viewLog，聊天页才能放行。
 */
export const registerFingerprint = createServerFn({ method: 'POST' })
  .validator((data: { fingerprint: string; locale: string }) => data)
  .handler(async ({ data }) => registerFingerprintService(data.fingerprint, data.locale))
