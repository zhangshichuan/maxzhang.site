import { createServerFn } from '@tanstack/react-start'
import { streamChat } from '@/src/features/chat/services/chat-stream.server'
import type { ChatErrorCode, ChatMessage } from '@/src/features/chat/services/chat-stream.server'

/**
 * 聊天流式传输服务端操作
 *
 * 接收完整消息历史和浏览器指纹，返回流式响应或错误。
 * 流式内容走 TanStack Server Function 的 async generator 通道。
 *
 * @param messages - 完整消息历史（用户 + 树洞）
 * @param fingerprint - 浏览器指纹，用于频率限制和验证
 * @returns 内容块异步生成器或错误对象
 */
export const chatStream = createServerFn({ method: 'POST', strict: false })
  .validator((data: { messages: ChatMessage[]; fingerprint: string }) => data)
  .handler(async ({ data }): Promise<AsyncGenerator<string> | { error: ChatErrorCode }> =>
    streamChat(data.messages, data.fingerprint),
  )
