import { prisma } from '@/src/server/db'

/**
 * 首页访问时登记浏览器指纹
 *
 * 聊天页依赖有效的 viewLog 指纹；现在仓库没有文章，改为用户进入首页即登记。
 * 同一指纹只登记一次，不影响文章阅读数。
 */
export async function registerFingerprint(fingerprint: string, locale: string) {
  if (!fingerprint) return

  const existingLog = await prisma.viewLog.findFirst({
    where: { fingerprint },
  })

  if (existingLog) return

  await prisma.viewLog.create({
    data: {
      fingerprint,
      slug: 'home',
      locale,
    },
  })
}
