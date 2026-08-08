import { Outlet, useRouterState } from '@tanstack/react-router'
import { stripLocale } from '@/i18n/routing'
import { Footer } from './footer'
import { Navbar } from './navbar'

/**
 * 站点布局
 *
 * zh 与 en 两个布局路由共用：导航 + 正文 + 页脚。
 * 语言由各自布局路由的 beforeLoad 注入路由上下文。
 */
export function SiteLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isChat = stripLocale(pathname) === '/chat'

  return (
    <>
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      {!isChat && <Footer />}
    </>
  )
}
