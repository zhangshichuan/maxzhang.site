import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

/**
 * Next-intl 请求配置
 * 根据请求的语言环境返回对应的翻译消息
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // 从请求中获取语言环境参数
  let locale = await requestLocale

  // 验证语言环境是否有效，无效则使用默认语言
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    // 动态导入对应语言的翻译文件
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
