/**
 * 聊天服务端操作
 *
 * 服务器端函数，处理聊天消息流式传输，包含指纹验证和频率限制
 */

'use server'

import { streamChat } from '@/src/features/chat/services'
import type { ChatErrorCode } from '@/src/features/chat/services/chat-stream'

/**
 * 聊天流式传输服务端操作
 *
 * 接收用户消息和浏览器指纹，返回流式响应或错误
 *
 * @param message - 用户输入的聊天消息
 * @param fingerprint - 浏览器指纹，用于频率限制和验证
 * @returns 可读流（用于SSE传输）或错误对象
 */
export async function chatStream(
  message: string,
  fingerprint: string,
): Promise<ReadableStream | { error: ChatErrorCode }> {
  return streamChat(message, fingerprint)
}
