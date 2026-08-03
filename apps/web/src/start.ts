import { createCsrfMiddleware, createStart } from '@tanstack/react-start'

/**
 * Start 服务端实例
 *
 * 显式挂载 CSRF 中间件：Server Function 只接受同源请求，
 * 防止跨站伪造调用（评论、阅读数、聊天等写路径都走 Server Function）。
 */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
}))
