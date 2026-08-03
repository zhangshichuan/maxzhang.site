/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { getLocaleFromPathname } from '@/i18n/routing'
import { ParticleCanvas } from '@/src/shared/components/particle-canvas'
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
      { name: 'theme-color', content: '#020008' },
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
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ParticleCanvas />
          <div className="overlay">
            <div className="container">{children}</div>
          </div>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
