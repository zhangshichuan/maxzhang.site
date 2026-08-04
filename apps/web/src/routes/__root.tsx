/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import * as React from 'react'
import { LOCALE_INLINE_SCRIPT } from '@/i18n/locale-preference'
import { getLocaleFromPathname } from '@/i18n/routing'
import { APPEARANCE_INLINE_SCRIPT, AppearanceProvider, BackgroundWallpaper } from '@/src/shared/theme'
import '@/src/globals.css'

/**
 * 根路由
 *
 * 只负责 HTML 骨架（shellComponent）+ 全局 Query 容器。
 * Navbar / Footer / 语言上下文由每个 locale 的布局路由提供。
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#000000' },
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 水合前应用深浅色与玻璃强度，避免 FOUC */}
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_INLINE_SCRIPT }} />
        {/* 水合前按浏览器语言/本地偏好跳转默认语言，避免闪烁 */}
        <script dangerouslySetInnerHTML={{ __html: LOCALE_INLINE_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <MotionConfig reducedMotion="user">
            <AppearanceProvider>
              <BackgroundWallpaper />
              <div className="overlay">
                <div className="container">{children}</div>
              </div>
            </AppearanceProvider>
          </MotionConfig>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
