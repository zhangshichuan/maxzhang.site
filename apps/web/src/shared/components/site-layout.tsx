import { Outlet, useRouterState } from '@tanstack/react-router'
import { stripLocale } from '@/i18n/routing'
import { NightShell } from './night'

/**
 * 站点布局
 *
 * zh 与 en 两个布局路由共用：Night Instrument shell + 正文。
 * 语言由各自布局路由的 beforeLoad 注入路由上下文。
 * 所有页面共用同一套 rail / meta / footer；chat 使用全高变体。
 */
export function SiteLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const internalPath = stripLocale(pathname)

  if (internalPath === '/chat') {
    return (
      <NightShell variant="chat">
        <Outlet />
      </NightShell>
    )
  }

  if (internalPath === '/login') {
    return (
      <NightShell variant="auth">
        <Outlet />
      </NightShell>
    )
  }

  return (
    <NightShell>
      <Outlet />
    </NightShell>
  )
}
