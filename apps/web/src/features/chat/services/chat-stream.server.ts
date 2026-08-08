/**
 * 聊天流式传输服务
 *
 * 处理聊天消息的流式传输，包括频率限制、指纹验证和上游聊天服务调用。
 * 上游（apps/services/chat）返回纯文本 SSE，这里在服务端解析成字符串块（AsyncGenerator）。
 */

import { prisma } from '@/src/server/db'
import { getRequestIP } from '@tanstack/react-start/server'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

// 小时频率限制内存存储：指纹 -> { 计数, 重置时间 }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
// 每日轮数限制内存存储：指纹 -> { 计数, 日期 }
const dailyLimitMap = new Map<string, { count: number; date: string }>()
// 小时频率限制内存存储：IP -> { 计数, 重置时间 }
const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>()
// 每日轮数限制内存存储：IP -> { 计数, 日期 }
const ipDailyLimitMap = new Map<string, { count: number; date: string }>()

// 频率限制配置：每小时最多50条消息
const RATE_LIMIT = 50
// 频率限制时间窗口：1小时（毫秒）
const RATE_WINDOW = 60 * 60 * 1000
// 每日轮数上限：每个指纹每天最多 100 轮（测试可通过工具函数调整）
let dailyLimit = Number(process.env.CHAT_DAILY_LIMIT ?? 100)
// 最大消息长度：2000字符（用户消息）
const MAX_MESSAGE_LENGTH = 2000
// 历史条数上限：100 轮 * 2 条
const MAX_HISTORY_LENGTH = 200
// 历史总长度上限（字符）
const MAX_TOTAL_LENGTH = 200000
// 上游聊天服务地址：容器内由 docker-compose 注入，本地开发默认 localhost
const CHAT_BASE_URL = process.env.CHAT_BASE_URL ?? 'http://localhost:9000'

/** 聊天错误码类型定义 */
export type ChatErrorCode =
  | 'INVALID_FINGERPRINT' // 无效的浏览器指纹
  | 'RATE_LIMIT' // 小时频率限制超限
  | 'DAILY_LIMIT' // 每日轮数限制超限
  | 'SERVICE_DAILY_LIMIT' // 服务每日总量超限
  | 'MESSAGE_TOO_LONG' // 消息过长
  | 'INVALID_MESSAGE' // 无效消息格式
  | 'UPSTREAM_ERROR' // 上游API错误

/** 本地日期 key（YYYY-MM-DD），用于每日轮数统计 */
const localDateKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 清理过期的限制记录：小时窗口过期 / 日期变化的每日记录
 */
const cleanupExpired = () => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now >= record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
  for (const [key, record] of ipRateLimitMap.entries()) {
    if (now >= record.resetTime) {
      ipRateLimitMap.delete(key)
    }
  }
  const today = localDateKey()
  for (const [key, record] of dailyLimitMap.entries()) {
    if (record.date !== today) {
      dailyLimitMap.delete(key)
    }
  }
  for (const [key, record] of ipDailyLimitMap.entries()) {
    if (record.date !== today) {
      ipDailyLimitMap.delete(key)
    }
  }
}

/** 聊天流测试工具函数，主要用于单元测试 */
export const chatStreamTestUtils = {
  /** 重置频率限制状态，清理所有记录 */
  resetRateLimitState() {
    rateLimitMap.clear()
    dailyLimitMap.clear()
    ipRateLimitMap.clear()
    ipDailyLimitMap.clear()
  },
  /** 调整每日轮数上限（仅测试用） */
  setDailyLimitForTest(limit: number) {
    dailyLimit = limit
  },
}

/** 从当前请求提取客户端 IP；非请求上下文（如单元测试）返回 unknown */
const getClientIp = () => {
  try {
    return getRequestIP({ xForwardedFor: true }) ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * 流式聊天处理函数
 *
 * 处理聊天消息的流式传输，包括验证、频率限制和上游调用
 *
 * @param messages - 完整消息历史（用户 + 树洞）
 * @param fingerprint - 浏览器指纹，用于识别和频率限制
 * @returns 字符串块异步生成器（内容流）或包含错误码的错误对象
 */
export async function streamChat(
  messages: ChatMessage[],
  fingerprint: string,
  clientIp?: string,
): Promise<AsyncGenerator<string> | { error: ChatErrorCode }> {
  cleanupExpired()
  const ip = clientIp ?? getClientIp()

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

  // 小时频率限制检查
  const now = Date.now()
  const record = rateLimitMap.get(fingerprint)

  if (record && now < record.resetTime) {
    if (record.count >= RATE_LIMIT) {
      return { error: 'RATE_LIMIT' }
    }
    record.count += 1
  } else {
    rateLimitMap.set(fingerprint, { count: 1, resetTime: now + RATE_WINDOW })
  }

  // IP 小时频率限制检查
  const ipRecord = ipRateLimitMap.get(ip)
  if (ipRecord && now < ipRecord.resetTime) {
    if (ipRecord.count >= RATE_LIMIT) {
      return { error: 'RATE_LIMIT' }
    }
    ipRecord.count += 1
  } else {
    ipRateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
  }

  // 每日轮数限制检查
  const today = localDateKey()
  const dailyRecord = dailyLimitMap.get(fingerprint)
  if (dailyRecord && dailyRecord.date === today && dailyRecord.count >= dailyLimit) {
    return { error: 'DAILY_LIMIT' }
  }
  const ipDailyRecord = ipDailyLimitMap.get(ip)
  if (ipDailyRecord && ipDailyRecord.date === today && ipDailyRecord.count >= dailyLimit) {
    return { error: 'DAILY_LIMIT' }
  }

  // 验证消息格式和长度
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_HISTORY_LENGTH) {
    return { error: 'INVALID_MESSAGE' }
  }
  let totalLength = 0
  for (const message of messages) {
    if (
      !message ||
      (message.role !== 'user' && message.role !== 'assistant') ||
      typeof message.content !== 'string' ||
      !message.content.trim()
    ) {
      return { error: 'INVALID_MESSAGE' }
    }
    const limit = message.role === 'user' ? MAX_MESSAGE_LENGTH : 50000
    if (message.content.length > limit) {
      return { error: 'MESSAGE_TOO_LONG' }
    }
    totalLength += message.content.length
    if (totalLength > MAX_TOTAL_LENGTH) {
      return { error: 'MESSAGE_TOO_LONG' }
    }
  }

  // 验证通过后记录本轮
  if (dailyRecord && dailyRecord.date === today) {
    dailyRecord.count += 1
  } else {
    dailyLimitMap.set(fingerprint, { count: 1, date: today })
  }
  if (ipDailyRecord && ipDailyRecord.date === today) {
    ipDailyRecord.count += 1
  } else {
    ipDailyLimitMap.set(ip, { count: 1, date: today })
  }

  // 调用上游聊天服务
  const response = await fetch(`${CHAT_BASE_URL}/api/v1/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content.trim(),
      })),
    }),
    signal: AbortSignal.timeout(120 * 1000), // 120秒超时
  })

  if (!response.ok) {
    // 上游返回的已知错误码直接透传
    try {
      const payload = (await response.json()) as { error?: ChatErrorCode }
      if (
        payload.error === 'INVALID_MESSAGE' ||
        payload.error === 'MESSAGE_TOO_LONG' ||
        payload.error === 'SERVICE_DAILY_LIMIT'
      ) {
        return { error: payload.error }
      }
    } catch {
      // 忽略解析失败，按上游错误处理
    }
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
