import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * dev 防盗链中间件
 *
 * Vite dev 直接伺服 public/photos，Nitro 全局中间件不会经过静态资源，
 * 所以在这里做与 server/middleware/hotlink.ts 等价的检查。
 */
function hotlinkProtectionPlugin(): Plugin {
  return {
    name: 'photo-hotlink-protection',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/photos/photos/')) return next()

        const host = req.headers.host ?? ''
        const referer = req.headers.referer
        const secFetchSite = req.headers['sec-fetch-site']

        if (secFetchSite === 'same-origin' || secFetchSite === 'none') return next()
        if (secFetchSite === 'same-site' || secFetchSite === 'cross-site') {
          res.statusCode = 403
          res.end()
          return
        }
        if (referer) {
          try {
            if (new URL(referer).host === host) return next()
          } catch {
            // 非法 Referer 一律视为外部引用
          }
          res.statusCode = 403
          res.end()
          return
        }
        return next()
      })
    },
  }
}

/**
 * TanStack Start（Vite + Nitro）配置
 *
 * - MDX 由 scripts/generate-mdx.mjs 在构建期编译为 TSX 模块，
 *   不依赖 @mdx-js/rollup 在 SSR 环境中的 transform
 * - 内容页开启静态预渲染，动态文章路由由 crawlLinks 从列表页顺带预渲染
 * - 产物输出到 .output，启动命令为 node .output/server/index.mjs
 */
export default defineConfig({
  server: {
    port: 3000,
  },
  preview: {
    // 预渲染阶段 TanStack 会启动 preview server 并回源拉取页面，
    // 固定 IPv4 避免容器内 localhost 解析到 ::1 导致 ECONNREFUSED
    host: '127.0.0.1',
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    hotlinkProtectionPlugin(),
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    }),
    viteReact(),
    nitro(),
  ],
})
