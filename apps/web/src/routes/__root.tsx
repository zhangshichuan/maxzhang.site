/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import * as React from 'react'
import { getLocaleFromPathname } from '@/i18n/routing'
import { LOCALE_BOOT_SCRIPT, NightShell, THEME_BOOT_SCRIPT } from '@/src/shared/components/night'
import { NotFoundPage } from '@/src/shared/components/not-found'
import '@/src/styles/design-system.css'
import '@/src/styles/instrument.css'
import '@/src/styles/instrument-pages.css'

/**
 * 根路由
 *
 * 只负责 HTML 骨架 + 全局 Query 容器。
 * 所有页面都渲染 Night Instrument shell；语言由 URL 决定：
 * en 为默认语言（无前缀），zh 走 `/zh`，不做浏览器语言自动跳转。
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: 'Max Zhang — Product-minded AI builder' },
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#0a0e11' },
      { name: 'color-scheme', content: 'dark light' },
    ],
    links: [{ rel: 'icon', href: '/favicon.ico' }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
})

function RootNotFound() {
  return (
    <NightShell>
      <NotFoundPage />
    </NightShell>
  )
}

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

  React.useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const theme = document.documentElement.dataset.theme
    meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#0a0e11')
  }, [locale])

  return (
    <html lang={locale} className="js ni-active" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Preferences are resolved before first paint: stored choice, then device. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOT_SCRIPT }} />
      </head>
      <body className="ni-body">
        <QueryClientProvider client={queryClient}>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
