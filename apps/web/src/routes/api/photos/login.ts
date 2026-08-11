import { createFileRoute } from '@tanstack/react-router'
import {
  adminCookieHeader,
  checkLoginPolicy,
  isIpAllowed,
  recordLoginAttempt,
  verifyPassword,
} from '@/src/features/photos/services/admin-auth.server'

const jsonHeaders = { 'Content-Type': 'application/json' }
const FAILURE_DELAY_MS = 300

export const Route = createFileRoute('/api/photos/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get('x-admin-request') !== '1') {
          return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400, headers: jsonHeaders })
        }
        if (!isIpAllowed(request)) {
          return new Response(JSON.stringify({ error: 'ip_not_allowed' }), { status: 403, headers: jsonHeaders })
        }

        let body: { password?: string } = {}
        try {
          body = (await request.json()) as { password?: string }
        } catch {
          return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400, headers: jsonHeaders })
        }

        let policy
        try {
          policy = await checkLoginPolicy(request)
        } catch {
          // 数据库不可用时失败关闭，拒绝登录而不是放行。
          return new Response(JSON.stringify({ error: 'unavailable' }), { status: 503, headers: jsonHeaders })
        }
        if (!policy.allowed) {
          return new Response(JSON.stringify({ error: 'rate_limited', retryAfter: policy.retryAfterSeconds }), {
            status: 429,
            headers: {
              ...jsonHeaders,
              'Retry-After': String(policy.retryAfterSeconds),
            },
          })
        }

        if (!verifyPassword(body.password ?? '')) {
          await recordLoginAttempt(request, false).catch(() => {})
          // 失败响应人为延迟，拖慢自动化爆破。
          await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS))
          return new Response(JSON.stringify({ error: 'invalid_password' }), { status: 401, headers: jsonHeaders })
        }

        await recordLoginAttempt(request, true).catch(() => {})
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...jsonHeaders, 'Set-Cookie': adminCookieHeader() },
        })
      },
    },
  },
})
