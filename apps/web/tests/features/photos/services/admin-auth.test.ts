import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ADMIN_COOKIE,
  adminCookieHeader,
  checkLoginPolicy,
  clearAdminCookieHeader,
  getClientIp,
  isAdminCookiePresent,
  isAdminRequest,
  isIpAllowed,
  recordLoginAttempt,
  verifyPassword,
} from '@/src/features/photos/services/admin-auth.server'

const { findManyMock, createMock, deleteManyMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn(),
  deleteManyMock: vi.fn(),
}))

vi.mock('@/src/server/db', () => ({
  prisma: {
    adminLoginAttempt: {
      findMany: findManyMock,
      create: createMock,
      deleteMany: deleteManyMock,
    },
  },
}))

const originalEnv = { ...process.env }

function expectedToken(password: string): string {
  return createHash('sha256').update(`maxzhang.site:admin:${password}`).digest('hex')
}

function requestWith(ip = '203.0.113.9', cookie?: string, csrf = '1'): Request {
  const headers = new Headers()
  headers.set('x-forwarded-for', ip)
  headers.set('x-real-ip', ip)
  if (cookie) headers.set('cookie', cookie)
  headers.set('x-admin-request', csrf)
  return new Request('http://localhost/api/photos/login', { headers })
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000)
}

describe('摄影管理鉴权', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'secret-pass'
    delete process.env.COOKIE_SECURE
    delete process.env.ADMIN_ALLOWED_IPS
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalEnv.ADMIN_PASSWORD
    if (originalEnv.COOKIE_SECURE) {
      process.env.COOKIE_SECURE = originalEnv.COOKIE_SECURE
    } else {
      delete process.env.COOKIE_SECURE
    }
    if (originalEnv.ADMIN_ALLOWED_IPS) {
      process.env.ADMIN_ALLOWED_IPS = originalEnv.ADMIN_ALLOWED_IPS
    } else {
      delete process.env.ADMIN_ALLOWED_IPS
    }
  })

  it('verifyPassword 用恒定时间比较口令', () => {
    expect(verifyPassword('secret-pass')).toBe(true)
    expect(verifyPassword('wrong-pass')).toBe(false)
  })

  it('未配置口令时后台不可用', () => {
    delete process.env.ADMIN_PASSWORD
    expect(verifyPassword('secret-pass')).toBe(false)
    expect(isAdminCookiePresent(requestWith('203.0.113.9', `${ADMIN_COOKIE}=anything`))).toBe(false)
  })

  it('正确 Cookie 通过，错误 Cookie 拒绝', () => {
    const valid = `${ADMIN_COOKIE}=${expectedToken('secret-pass')}`
    expect(isAdminCookiePresent(requestWith('203.0.113.9', valid))).toBe(true)
    expect(isAdminCookiePresent(requestWith('203.0.113.9', `${ADMIN_COOKIE}=forged`))).toBe(false)
  })

  it('管理操作要求自定义请求头防 CSRF', () => {
    const valid = `${ADMIN_COOKIE}=${expectedToken('secret-pass')}`
    expect(isAdminRequest(requestWith('203.0.113.9', valid, '1'))).toBe(true)
    expect(isAdminRequest(requestWith('203.0.113.9', valid, '0'))).toBe(false)
    expect(isAdminRequest(requestWith('203.0.113.9', valid, ''))).toBe(false)
  })

  it('IP 白名单：精确 IP 与 CIDR 都生效', () => {
    process.env.ADMIN_ALLOWED_IPS = '203.0.113.1,198.51.100.0/24'
    expect(isIpAllowed(requestWith('203.0.113.1'))).toBe(true)
    expect(isIpAllowed(requestWith('198.51.100.77'))).toBe(true)
    expect(isIpAllowed(requestWith('198.51.101.77'))).toBe(false)
    expect(isIpAllowed(requestWith('203.0.113.9'))).toBe(false)
  })

  it('未配置白名单时放行，getClientIp 优先取 x-forwarded-for', () => {
    expect(isIpAllowed(requestWith('198.51.100.7'))).toBe(true)
    expect(getClientIp(requestWith('198.51.100.7'))).toBe('198.51.100.7')
  })

  it('分级锁定：5 次/15 分钟锁 15 分钟，10 次/1 小时锁 1 小时，20 次/24 小时锁 24 小时', async () => {
    findManyMock.mockResolvedValue([
      { createdAt: minutesAgo(2) },
      { createdAt: minutesAgo(4) },
      { createdAt: minutesAgo(6) },
      { createdAt: minutesAgo(8) },
      { createdAt: minutesAgo(10) },
    ])
    const request = requestWith('203.0.113.9')

    const locked15 = await checkLoginPolicy(request)
    expect(locked15).toEqual({ allowed: false, retryAfterSeconds: 900 })

    findManyMock.mockResolvedValue(Array.from({ length: 10 }, (_, index) => ({ createdAt: minutesAgo(10 + index) })))
    const locked60 = await checkLoginPolicy(request)
    expect(locked60).toEqual({ allowed: false, retryAfterSeconds: 3600 })

    findManyMock.mockResolvedValue(Array.from({ length: 20 }, (_, index) => ({ createdAt: minutesAgo(30 + index) })))
    const locked1440 = await checkLoginPolicy(request)
    expect(locked1440).toEqual({ allowed: false, retryAfterSeconds: 86400 })
  })

  it('失败次数不足时不锁定', async () => {
    findManyMock.mockResolvedValue([
      { createdAt: minutesAgo(2) },
      { createdAt: minutesAgo(14) },
      { createdAt: minutesAgo(30) },
      { createdAt: minutesAgo(90) },
    ])
    await expect(checkLoginPolicy(requestWith('203.0.113.9'))).resolves.toEqual({ allowed: true })
  })

  it('recordLoginAttempt 记录尝试并清理 30 天前的审计记录', async () => {
    createMock.mockResolvedValue({ id: 1 })
    deleteManyMock.mockResolvedValue({ count: 0 })
    await recordLoginAttempt(requestWith('203.0.113.9'), false)
    expect(createMock).toHaveBeenCalledWith({
      data: { ip: '203.0.113.9', success: false },
    })
    expect(deleteManyMock).toHaveBeenCalled()
  })

  it('Cookie 带 HttpOnly / SameSite=Strict，生产环境追加 Secure', () => {
    const header = adminCookieHeader()
    expect(header).toContain('HttpOnly')
    expect(header).toContain('SameSite=Strict')
    expect(header).not.toContain('Secure')

    process.env.COOKIE_SECURE = '1'
    expect(adminCookieHeader()).toContain('Secure')
    expect(clearAdminCookieHeader()).toContain('Max-Age=0')
  })
})
