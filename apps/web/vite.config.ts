import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

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
