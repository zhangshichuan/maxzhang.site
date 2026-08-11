import { createHash, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/src/server/db'

export const ADMIN_COOKIE = 'admin_session'
const CSRF_HEADER = 'x-admin-request'

/**
 * 暴力破解分级锁定：失败次数越多，锁定时长越长。
 * 记录持久化在 SQLite（AdminLoginAttempt），服务重启不清零。
 */
const FAILURE_TIERS = [
  { failures: 5, windowMs: 15 * 60 * 1000, lockMs: 15 * 60 * 1000 },
  { failures: 10, windowMs: 60 * 60 * 1000, lockMs: 60 * 60 * 1000 },
  { failures: 20, windowMs: 24 * 60 * 60 * 1000, lockMs: 24 * 60 * 60 * 1000 },
] as const

export interface LoginPolicyResult {
  allowed: boolean
  retryAfterSeconds?: number
}

function expectedToken(): string | null {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  return createHash('sha256').update(`maxzhang.site:admin:${password}`).digest('hex')
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim())
    }
  }
  return null
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

/** 从反代请求头取客户端 IP；取不到时按未知 IP 处理。 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'unknown'
}

/**
 * 可选的 IP 白名单（ADMIN_ALLOWED_IPS，逗号分隔，支持 IPv4 / CIDR）。
 * 配置后，登录与所有管理操作都只允许白名单内的 IP 访问。
 */
export function isIpAllowed(request: Request): boolean {
  const allowed = (process.env.ADMIN_ALLOWED_IPS ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  if (allowed.length === 0) return true
  const ip = getClientIp(request)
  return allowed.some((entry) => ipMatches(ip, entry))
}

/** 管理操作：Cookie + 自定义请求头 + IP 白名单三重校验。 */
export function isAdminRequest(request: Request): boolean {
  return isAdminCookiePresent(request) && request.headers.get(CSRF_HEADER) === '1' && isIpAllowed(request)
}

/** 仅校验 Cookie 是否存在（用于 UI 显示登录状态）。 */
export function isAdminCookiePresent(request: Request): boolean {
  const expected = expectedToken()
  if (!expected) return false
  return safeEqual(readCookie(request, ADMIN_COOKIE) ?? '', expected)
}

/** 恒定时间比较口令，避免时序侧信道。 */
export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? ''
  if (!expected) return false
  return safeEqual(password, expected)
}

/**
 * 登录策略检查：统计该 IP 过去 24 小时的失败次数，命中任一档即锁定。
 * 数据库不可用时返回 unavailable，由调用方失败关闭（拒绝登录）。
 */
export async function checkLoginPolicy(request: Request): Promise<LoginPolicyResult> {
  const ip = getClientIp(request)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const attempts = await prisma.adminLoginAttempt.findMany({
    where: { ip, success: false, createdAt: { gte: since } },
    select: { createdAt: true },
  })

  const now = Date.now()
  let lockMs = 0
  for (const tier of FAILURE_TIERS) {
    const count = attempts.filter((attempt) => now - attempt.createdAt.getTime() <= tier.windowMs).length
    if (count >= tier.failures) {
      lockMs = Math.max(lockMs, tier.lockMs)
    }
  }

  return lockMs > 0 ? { allowed: false, retryAfterSeconds: Math.ceil(lockMs / 1000) } : { allowed: true }
}

/** 记录一次登录尝试；顺带清理 30 天前的审计记录。 */
export async function recordLoginAttempt(request: Request, success: boolean): Promise<void> {
  await prisma.adminLoginAttempt.create({
    data: { ip: getClientIp(request), success },
  })
  void prisma.adminLoginAttempt
    .deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    })
    .catch(() => {})
}

export function adminCookieHeader(): string {
  const token = expectedToken()
  if (!token) return ''
  const secure = process.env.COOKIE_SECURE === '1' ? '; Secure' : ''
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}${secure}`
}

export function clearAdminCookieHeader(): string {
  const secure = process.env.COOKIE_SECURE === '1' ? '; Secure' : ''
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`
}

function ipMatches(ip: string, entry: string): boolean {
  if (ip === entry) return true
  const slash = entry.indexOf('/')
  if (slash === -1) return false
  const range = entry.slice(0, slash)
  const bits = Number(entry.slice(slash + 1))
  const ipInt = ipv4ToInt(ip)
  const rangeInt = ipv4ToInt(range)
  if (ipInt == null || rangeInt == null || !Number.isInteger(bits) || bits < 0 || bits > 32) return false
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
  return (ipInt & mask) === (rangeInt & mask)
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let value = 0
  for (const part of parts) {
    const octet = Number(part)
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return null
    value = value * 256 + octet
  }
  return value >>> 0
}
