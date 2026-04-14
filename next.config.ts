/**
 * Next.js配置文件
 *
 * 配置Next.js应用，包括国际化插件和构建输出设置
 */

import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** Next.js应用配置 */
const nextConfig: NextConfig = {
  output: 'standalone', // 使用独立输出模式，便于Docker部署
}

export default withNextIntl(nextConfig)
