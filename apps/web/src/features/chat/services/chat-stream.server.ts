/**
 * 夜宴流式传输服务
 *
 * 处理群聊消息的流式传输，包括频率限制、额度、并发、指纹验证、宾客校验
 * 和上游调用。上游（apps/services/chat）返回的是夜宴事件流
 * （guest_start / delta / guest_end / done / error），这里在服务端解析
 * data: 行并逐条转发。
 *
 * 安全分层：
 * 1. 指纹必须来自一次真实访问（viewLog）。
 * 2. 同一指纹同时只能有一条流；同一 IP 最多三条并发流。
 * 3. 每小时最多 30 次请求；每天额度按「宾客数」扣点（单聊 1 点、三人桌 3 点）。
 * 4. 消息长度与历史总长度有上限，避免用超长上下文抬高成本。
 */

import { prisma } from '@/src/server/db'
import { getRequestIP } from '@tanstack/react-start/server'
import { isGuestId, MAX_TABLE_GUESTS, type GuestId } from '@/src/features/chat/model/guests'
import type { ChatWireMessage } from '@/src/features/chat/model/message'

// 小时请求限制内存存储：指纹 -> { 计数, 重置时间 }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
// 每日额度内存存储：指纹 -> { 已用点数, 日期 }
const dailyLimitMap = new Map<string, { count: number; date: string }>()
// 小时请求限制内存存储：IP -> { 计数, 重置时间 }
const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>()
// 每日额度内存存储：IP -> { 已用点数, 日期 }
const ipDailyLimitMap = new Map<string, { count: number; date: string }>()
// 正在流式输出的请求：指纹 / IP -> 并发数
const inFlightFingerprints = new Map<string, number>()
const inFlightIps = new Map<string, number>()

// 每小时最多 30 次请求
const RATE_LIMIT = 30
// 频率限制时间窗口：1小时（毫秒）
const RATE_WINDOW = 60 * 60 * 1000
// 每日额度：每个指纹/每个 IP 每天 100 点；单聊 1 点，群聊按宾客数扣点
const configuredDailyCredits = Number(process.env.CHAT_DAILY_CREDITS ?? 100)
let dailyCreditLimit =
  Number.isFinite(configuredDailyCredits) && configuredDailyCredits > 0 ? configuredDailyCredits : 100
// 同一指纹同时只允许一条流；同一 IP 最多三条
const MAX_IN_FLIGHT_PER_FINGERPRINT = 1
const MAX_IN_FLIGHT_PER_IP = 3
// 最大用户消息长度：2000 字符
const MAX_MESSAGE_LENGTH = 2000
// 历史条数上限：200 条；真正卡成本的是下面的总字符数
const MAX_HISTORY_LENGTH = 200
// 单条 assistant 消息上限：20k 字符
const MAX_ASSISTANT_LENGTH = 20_000
// 历史总长度上限：60k 字符。群聊每位宾客都会收到同一份历史，
// 再长就会让一轮的输入成本迅速放大。
const MAX_TOTAL_LENGTH = 60_000
// 上游聊天服务地址：容器内由 docker-compose 注入，本地开发默认 localhost
const CHAT_BASE_URL = process.env.CHAT_BASE_URL ?? 'http://localhost:9000'

/** 聊天错误码类型定义 */
export type ChatErrorCode =
  | 'INVALID_FINGERPRINT' // 无效的浏览器指纹
  | 'INVALID_GUEST' // 无效的宾客名单
  | 'BUSY' // 同一指纹/IP 已有流在跑
  | 'RATE_LIMIT' // 小时频率限制超限
  | 'DAILY_LIMIT' // 每日额度超限
  | 'SERVICE_BUSY' // 服务端全局并发已满
  | 'SERVICE_DAILY_LIMIT' // 服务端全局预算/请求量超限
  | 'MESSAGE_TOO_LONG' // 消息过长
  | 'INVALID_MESSAGE' // 无效消息格式
  | 'UPSTREAM_ERROR' // 上游API错误

/** 本地日期 key（YYYY-MM-DD），用于每日额度统计 */
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
  /** 重置频率限制与并发状态，清理所有记录 */
  resetRateLimitState() {
    rateLimitMap.clear()
    dailyLimitMap.clear()
    ipRateLimitMap.clear()
    ipDailyLimitMap.clear()
    inFlightFingerprints.clear()
    inFlightIps.clear()
  },
  /** 调整每日额度上限（仅测试用；单位是点数，不是轮数） */
  setDailyLimitForTest(limit: number) {
    dailyCreditLimit = limit
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

function validGuests(guests: unknown): guests is GuestId[] {
  if (!Array.isArray(guests) || guests.length === 0 || guests.length > MAX_TABLE_GUESTS) return false
  const seen = new Set<string>()
  for (const id of guests) {
    if (typeof id !== 'string' || !isGuestId(id) || seen.has(id)) return false
    seen.add(id)
  }
  return true
}

function acquireInFlight(fingerprint: string, ip: string): boolean {
  const fingerprintCount = inFlightFingerprints.get(fingerprint) ?? 0
  if (fingerprintCount >= MAX_IN_FLIGHT_PER_FINGERPRINT) return false
  const ipCount = inFlightIps.get(ip) ?? 0
  if (ipCount >= MAX_IN_FLIGHT_PER_IP) return false
  inFlightFingerprints.set(fingerprint, fingerprintCount + 1)
  inFlightIps.set(ip, ipCount + 1)
  return true
}

function releaseInFlight(fingerprint: string, ip: string) {
  const fingerprintCount = inFlightFingerprints.get(fingerprint) ?? 0
  if (fingerprintCount <= 1) inFlightFingerprints.delete(fingerprint)
  else inFlightFingerprints.set(fingerprint, fingerprintCount - 1)

  const ipCount = inFlightIps.get(ip) ?? 0
  if (ipCount <= 1) inFlightIps.delete(ip)
  else inFlightIps.set(ip, ipCount - 1)
}

/**
 * 流式聊天处理函数
 *
 * @param messages - 完整消息历史（用户 + 桌边宾客）
 * @param fingerprint - 浏览器指纹，用于识别、限流和额度
 * @param guests - 本桌宾客，顺序即发言顺序（1–3 位）
 * @param clientIp - 测试可注入的客户端 IP
 * @returns 夜宴事件块异步生成器（每块是一行 JSON）或包含错误码的错误对象
 */
export async function streamChat(
  messages: ChatWireMessage[],
  fingerprint: string,
  guests: GuestId[],
  clientIp?: string,
): Promise<AsyncGenerator<string> | { error: ChatErrorCode }> {
  cleanupExpired()
  const ip = clientIp ?? getClientIp()

  if (!fingerprint) {
    return { error: 'INVALID_FINGERPRINT' }
  }

  if (!validGuests(guests)) {
    return { error: 'INVALID_GUEST' }
  }

  const viewLog = await prisma.viewLog.findFirst({
    where: { fingerprint },
  })
  if (!viewLog) {
    return { error: 'INVALID_FINGERPRINT' }
  }

  if (!acquireInFlight(fingerprint, ip)) {
    return { error: 'BUSY' }
  }

  let released = false
  const release = () => {
    if (released) return
    released = true
    releaseInFlight(fingerprint, ip)
  }
  const fail = (error: ChatErrorCode) => {
    release()
    return { error }
  }

  try {
    const now = Date.now()
    const record = rateLimitMap.get(fingerprint)
    if (record && now < record.resetTime) {
      if (record.count >= RATE_LIMIT) return fail('RATE_LIMIT')
      record.count += 1
    } else {
      rateLimitMap.set(fingerprint, { count: 1, resetTime: now + RATE_WINDOW })
    }

    const ipRecord = ipRateLimitMap.get(ip)
    if (ipRecord && now < ipRecord.resetTime) {
      if (ipRecord.count >= RATE_LIMIT) return fail('RATE_LIMIT')
      ipRecord.count += 1
    } else {
      ipRateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    }

    const today = localDateKey()
    const dailyRecord = dailyLimitMap.get(fingerprint)
    const usedCredits = dailyRecord && dailyRecord.date === today ? dailyRecord.count : 0
    if (usedCredits + guests.length > dailyCreditLimit) return fail('DAILY_LIMIT')

    const ipDailyRecord = ipDailyLimitMap.get(ip)
    const ipUsedCredits = ipDailyRecord && ipDailyRecord.date === today ? ipDailyRecord.count : 0
    if (ipUsedCredits + guests.length > dailyCreditLimit) return fail('DAILY_LIMIT')

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_HISTORY_LENGTH) {
      return fail('INVALID_MESSAGE')
    }
    let totalLength = 0
    for (const message of messages) {
      if (
        !message ||
        (message.role !== 'user' && message.role !== 'assistant') ||
        typeof message.content !== 'string' ||
        !message.content.trim()
      ) {
        return fail('INVALID_MESSAGE')
      }
      if (message.role === 'user' && message.guest) {
        return fail('INVALID_MESSAGE')
      }
      if (message.role === 'assistant') {
        if (typeof message.guest !== 'string' || !isGuestId(message.guest) || !guests.includes(message.guest)) {
          return fail('INVALID_MESSAGE')
        }
        if (message.content.length > MAX_ASSISTANT_LENGTH) {
          return fail('MESSAGE_TOO_LONG')
        }
      }
      if (message.role === 'user' && message.content.length > MAX_MESSAGE_LENGTH) {
        return fail('MESSAGE_TOO_LONG')
      }
      totalLength += message.content.length
      if (totalLength > MAX_TOTAL_LENGTH) {
        return fail('MESSAGE_TOO_LONG')
      }
    }

    const response = await fetch(`${CHAT_BASE_URL}/api/v1/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content.trim(),
          ...(message.role === 'assistant' ? { guest: message.guest } : {}),
        })),
        guests,
      }),
      signal: AbortSignal.timeout(180 * 1000),
    })

    if (!response.ok) {
      try {
        const payload = (await response.json()) as { error?: ChatErrorCode }
        if (
          payload.error === 'INVALID_GUEST' ||
          payload.error === 'INVALID_MESSAGE' ||
          payload.error === 'MESSAGE_TOO_LONG' ||
          payload.error === 'SERVICE_BUSY' ||
          payload.error === 'SERVICE_DAILY_LIMIT'
        ) {
          return fail(payload.error)
        }
      } catch {
        // 忽略解析失败，按上游错误处理
      }
      return fail('UPSTREAM_ERROR')
    }

    const body = response.body
    if (!body) {
      return fail('UPSTREAM_ERROR')
    }

    // 上游真正接受后才扣点：单聊 1 点，群聊每位宾客 1 点。
    // 这样 SERVICE_BUSY / 上游故障不会白吃用户的每日额度。
    // 用当前 map 值而不是请求开始时的快照，避免同 IP 并发时互相覆盖。
    const currentDaily = dailyLimitMap.get(fingerprint)
    const currentDailyCount = currentDaily?.date === today ? currentDaily.count : 0
    dailyLimitMap.set(fingerprint, { count: currentDailyCount + guests.length, date: today })

    const currentIpDaily = ipDailyLimitMap.get(ip)
    const currentIpDailyCount = currentIpDaily?.date === today ? currentIpDaily.count : 0
    ipDailyLimitMap.set(ip, { count: currentIpDailyCount + guests.length, date: today })

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
            const content = buffer.slice(dataIndex + 6, lineEnd).trim()
            buffer = buffer.slice(lineEnd + 1)
            start = 0
            if (content) yield `${content}\n`
          }
        }
      } finally {
        reader.releaseLock()
        release()
      }
    })()
  } catch (error) {
    release()
    throw error
  }
}
