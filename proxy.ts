import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/**
 * Next-intl 中间件
 * 用于处理国际化的请求路由
 */
export default createMiddleware(routing)

/**
 * 路由匹配配置
 * 匹配所有路径，排除 API、Next.js 内部路径和静态文件
 */
export const config = {
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
