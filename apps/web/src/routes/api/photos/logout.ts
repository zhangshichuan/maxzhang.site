import { createFileRoute } from '@tanstack/react-router'
import { clearAdminCookieHeader } from '@/src/features/photos/services/admin-auth.server'

const jsonHeaders = { 'Content-Type': 'application/json' }

export const Route = createFileRoute('/api/photos/logout')({
  server: {
    handlers: {
      POST: async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...jsonHeaders, 'Set-Cookie': clearAdminCookieHeader() },
        }),
    },
  },
})
