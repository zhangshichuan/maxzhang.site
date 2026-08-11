import { createFileRoute } from '@tanstack/react-router'
import { isAdminCookiePresent } from '@/src/features/photos/services/admin-auth.server'

export const Route = createFileRoute('/api/photos/status')({
  server: {
    handlers: {
      GET: async ({ request }) =>
        new Response(JSON.stringify({ admin: isAdminCookiePresent(request) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    },
  },
})
