import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

/**
 * TanStack Router 实例
 *
 * 路由树由文件系统自动生成（routeTree.gen.ts），
 * 这里只负责装配实例与全局默认行为。
 */
export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
  })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }

  interface RouteContext {
    /** 由 locale 布局路由（_zh / en）注入，zh 无前缀、en 带 /en */
    locale: 'zh' | 'en'
  }
}
