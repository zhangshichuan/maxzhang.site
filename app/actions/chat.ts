'use server'

import { prisma } from '@/lib/prisma'

// 内存中的频率限制 Map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 50 // 每小时最大消息数
const RATE_WINDOW = 60 * 60 * 1000 // 1小时

/**
 * 懒清理过期记录
 * 每次请求时调用，移除已过期的记录防止内存泄露
 */
const cleanupExpired = () => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now >= record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}
const MAX_MESSAGE_LENGTH = 2000 // 最大消息长度

export type ChatErrorCode =
  | 'INVALID_FINGERPRINT' // 无效指纹
  | 'RATE_LIMIT' // 频率超限
  | 'MESSAGE_TOO_LONG' // 消息过长
  | 'INVALID_MESSAGE' // 无效消息
  | 'UPSTREAM_ERROR' // 上游错误

/**
 * 聊天流式响应 Server Action
 * @param message - 用户输入的消息
 * @param fingerprint - 浏览器指纹
 * @returns ReadableStream 流式响应，或错误对象
 */
export async function chatStream(
  message: string,
  fingerprint: string,
): Promise<ReadableStream | { error: ChatErrorCode }> {
  // 每次请求时懒清理过期的频率限制记录
  cleanupExpired()

  // 验证指纹是否存在
  if (!fingerprint) {
    return { error: 'INVALID_FINGERPRINT' }
  }

  // 查找指纹是否在 ViewLog 中存在（防止伪造）
  const viewLog = await prisma.viewLog.findFirst({
    where: { fingerprint },
  })

  if (!viewLog) {
    return { error: 'INVALID_FINGERPRINT' }
  }

  // 基于指纹的频率限制
  const now = Date.now()
  const record = rateLimitMap.get(fingerprint)

  if (record && now < record.resetTime) {
    // 在时间窗口内，检查是否超限
    if (record.count >= RATE_LIMIT) {
      return { error: 'RATE_LIMIT' }
    }
    record.count++
  } else {
    // 时间窗口已过，重置计数器
    rateLimitMap.set(fingerprint, { count: 1, resetTime: now + RATE_WINDOW })
  }

  // 输入校验
  if (!message || typeof message !== 'string') {
    return { error: 'INVALID_MESSAGE' }
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: 'MESSAGE_TOO_LONG' }
  }

  // 请求上游 SSE 流
  const response = await fetch('http://localhost:8000/api/v1/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message.trim() }),
    signal: AbortSignal.timeout(60 * 1000),
  })

  if (!response.ok) {
    return { error: 'UPSTREAM_ERROR' }
  }

  // 返回流式响应
  return response.body as ReadableStream
}
