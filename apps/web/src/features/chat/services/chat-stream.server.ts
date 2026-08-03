/**
 * 聊天流式传输服务
 *
 * 处理聊天消息的流式传输，包括频率限制、指纹验证和上游API调用。
 * 上游返回 SSE，这里在服务端解析成字符串块（AsyncGenerator）。
 */

import { prisma } from '@/src/server/db'

// 频率限制内存存储：指纹 -> { 计数, 重置时间 }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
// 频率限制配置：每小时最多50条消息
const RATE_LIMIT = 50
// 频率限制时间窗口：1小时（毫秒）
const RATE_WINDOW = 60 * 60 * 1000
// 最大消息长度：2000字符
const MAX_MESSAGE_LENGTH = 2000

/**
 * 清理过期的频率限制记录
 * 定期清理时间窗口已过期的记录，避免内存泄漏
 */
const cleanupExpired = () => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now >= record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

/** 聊天错误码类型定义 */
export type ChatErrorCode =
  | 'INVALID_FINGERPRINT' // 无效的浏览器指纹
  | 'RATE_LIMIT' // 频率限制超限
  | 'MESSAGE_TOO_LONG' // 消息过长
  | 'INVALID_MESSAGE' // 无效消息格式
  | 'UPSTREAM_ERROR' // 上游API错误

/** 聊天流测试工具函数，主要用于单元测试 */
export const chatStreamTestUtils = {
  /** 重置频率限制状态，清理所有记录 */
  resetRateLimitState() {
    rateLimitMap.clear()
  },
}

/**
 * 流式聊天处理函数
 *
 * 处理聊天消息的流式传输，包括验证、频率限制和上游API调用
 *
 * @param message - 用户输入的聊天消息
 * @param fingerprint - 浏览器指纹，用于识别和频率限制
 * @returns 字符串块异步生成器（内容流）或包含错误码的错误对象
 */
export async function streamChat(
  message: string,
  fingerprint: string,
): Promise<AsyncGenerator<string> | { error: ChatErrorCode }> {
  // 清理过期的频率限制记录
  cleanupExpired()

  // 验证指纹是否有效
  if (!fingerprint) {
    return { error: 'INVALID_FINGERPRINT' }
  }

  // 检查指纹是否存在于数据库中（防止伪造指纹）
  const viewLog = await prisma.viewLog.findFirst({
    where: { fingerprint },
  })

  if (!viewLog) {
    return { error: 'INVALID_FINGERPRINT' }
  }

  // 频率限制检查
  const now = Date.now()
  const record = rateLimitMap.get(fingerprint)

  if (record && now < record.resetTime) {
    // 在时间窗口内，检查是否超过限制
    if (record.count >= RATE_LIMIT) {
      return { error: 'RATE_LIMIT' }
    }
    // 未超限，增加计数
    record.count += 1
  } else {
    // 新时间窗口，创建新记录
    rateLimitMap.set(fingerprint, { count: 1, resetTime: now + RATE_WINDOW })
  }

  // 验证消息格式和长度
  if (!message || typeof message !== 'string') {
    return { error: 'INVALID_MESSAGE' }
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: 'MESSAGE_TOO_LONG' }
  }

  // 调用上游聊天API（假设运行在Docker容器内的服务）
  const response = await fetch('http://host.docker.internal:8000/api/v1/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message.trim() }),
    signal: AbortSignal.timeout(60 * 1000), // 60秒超时
  })

  if (!response.ok) {
    return { error: 'UPSTREAM_ERROR' }
  }

  const body = response.body
  if (!body) {
    return { error: 'UPSTREAM_ERROR' }
  }

  // 服务端解析上游 SSE，逐块产出 `data: ` 内容字符串
  return (async function* () {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        let start = 0
        while (true) {
          const dataIndex = buffer.indexOf('data: ', start)
          if (dataIndex === -1) break
          const lineEnd = buffer.indexOf('\n', dataIndex)
          if (lineEnd === -1) break
          const content = buffer.slice(dataIndex + 6, lineEnd)
          buffer = buffer.slice(lineEnd + 1)
          start = 0
          if (content) yield content
        }
      }
    } finally {
      reader.releaseLock()
    }
  })()
}
