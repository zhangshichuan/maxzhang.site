import { createFileRoute } from '@tanstack/react-router'
import { isAdminRequest } from '@/src/features/photos/services/admin-auth.server'
import { deletePhotoWork } from '@/src/features/photos/services/photo-works.server'

const jsonHeaders = { 'Content-Type': 'application/json' }

export const Route = createFileRoute('/api/photos/delete')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAdminRequest(request)) {
          return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: jsonHeaders })
        }

        let body: { slug?: string } = {}
        try {
          body = (await request.json()) as { slug?: string }
        } catch {
          return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400, headers: jsonHeaders })
        }
        if (!body.slug) {
          return new Response(JSON.stringify({ error: 'missing_slug' }), { status: 400, headers: jsonHeaders })
        }

        try {
          await deletePhotoWork(body.slug)
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jsonHeaders })
        } catch (error) {
          return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'delete_failed' }), {
            status: 500,
            headers: jsonHeaders,
          })
        }
      },
    },
  },
})
