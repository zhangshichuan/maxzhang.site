/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import * as React from 'react'
import { getLocaleFromPathname, stripLocale } from '@/i18n/routing'
import { ClientChrome } from '@/src/shared/components/client-chrome'
import { THEME_BOOT_SCRIPT } from '@/src/shared/components/night'
import '@/src/styles/design-system.css'
import '@/src/styles/content.css'
import '@/src/styles/pages.css'
import '@/src/styles/os.css'
import '@/src/styles/flow.css'
import '@/src/styles/final.css'
import '@/src/styles/fashion.css'
import '@/src/styles/instrument.css'

/**
 * 根路由
 *
 * 只负责 HTML 骨架（shellComponent）+ 全局 Query 容器。
 * Navbar / Footer / 语言上下文由每个 locale 的布局路由提供。
 * 语言由 URL 决定：en 为默认语言（无前缀），zh 走 `/zh`，不做浏览器语言自动跳转。
 * 视觉方向：Night Instrument（首页已迁移，其余页面沿用旧主题至迁移完成）。
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#0a0e11' },
      { name: 'color-scheme', content: 'dark light' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;1,6..96,400;1,6..96,500&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const locale = getLocaleFromPathname(pathname)
  const internalPath = stripLocale(pathname)
  const isHome = internalPath === '/'
  const isChat = internalPath === '/chat'
  const shellClass = ['site-shell', isHome && 'site-shell--home', isChat && 'site-shell--chat']
    .filter(Boolean)
    .join(' ')

  React.useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const theme = document.documentElement.dataset.theme
    meta.setAttribute('content', isHome && theme === 'light' ? '#fafcfb' : '#0a0e11')
  }, [isHome, locale])

  return (
    <html lang={locale} className={isHome ? 'js ni-active' : 'js'} suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Sets data-theme before first paint. Dark is the default signature mode. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className={isHome ? 'ni-body' : undefined}>
        <QueryClientProvider client={queryClient}>
          <MotionConfig reducedMotion="user">
            <div className={shellClass}>{children}</div>
            {!isHome && <ClientChrome />}
          </MotionConfig>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
