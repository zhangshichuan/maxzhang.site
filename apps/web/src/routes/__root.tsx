/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import * as React from 'react'
import { getLocaleFromPathname } from '@/i18n/routing'
import '@/src/styles/design-system.css'
import '@/src/styles/content.css'
import '@/src/styles/pages.css'
import '@/src/styles/os.css'

/**
 * 根路由
 *
 * 只负责 HTML 骨架（shellComponent）+ 全局 Query 容器。
 * Navbar / Footer / 语言上下文由每个 locale 的布局路由提供。
 * 语言由 URL 决定：en 为默认语言（无前缀），zh 走 `/zh`，不做浏览器语言自动跳转。
 * 站点视觉为 MZ/OS 工作台（graphite + phosphor），不再提供浅色/外观切换。
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#050708' },
    ],
    links: [{ rel: 'icon', href: '/favicon.ico' }],
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

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <MotionConfig reducedMotion="user">
            <div className="overlay">
              <div className="container">{children}</div>
            </div>
          </MotionConfig>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
