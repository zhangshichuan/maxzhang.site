import { Outlet } from '@tanstack/react-router'
import { Footer } from './footer'
import { Navbar } from './navbar'

/**
 * 站点布局
 *
 * zh 与 en 两个布局路由共用：导航 + 正文 + 页脚。
 * 语言由各自布局路由的 beforeLoad 注入路由上下文。
 */
export function SiteLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
