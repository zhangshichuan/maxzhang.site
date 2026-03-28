import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

/**
 * 国际化路由配置
 * 定义支持的语种和路由行为
 */
export const routing = defineRouting({
	// 支持的语言列表
	locales: ['en', 'zh'],

	// 默认语言，当没有匹配的语言时使用
	defaultLocale: 'zh',

	// 默认语言不使用前缀
	localePrefix: 'as-needed',
})

/**
 * 基于 Next.js 导航 API 的轻量封装
 * 自动考虑路由配置，支持国际化导航
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
