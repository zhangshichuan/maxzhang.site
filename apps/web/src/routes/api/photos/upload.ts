import { createFileRoute } from '@tanstack/react-router'
import { isAdminRequest } from '@/src/features/photos/services/admin-auth.server'
import { createPhotoWork } from '@/src/features/photos/services/photo-works.server'

const jsonHeaders = { 'Content-Type': 'application/json' }
const MAX_FILES = 10

export const Route = createFileRoute('/api/photos/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAdminRequest(request)) {
          return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: jsonHeaders })
        }

        let form: FormData
        try {
          form = await request.formData()
        } catch {
          return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400, headers: jsonHeaders })
        }

        const files = form
          .getAll('files')
          .filter((entry): entry is File => typeof entry === 'object' && entry !== null && 'arrayBuffer' in entry)
        if (files.length === 0) {
          return new Response(JSON.stringify({ error: 'no_files' }), { status: 400, headers: jsonHeaders })
        }
        if (files.length > MAX_FILES) {
          return new Response(JSON.stringify({ error: 'too_many_files' }), { status: 400, headers: jsonHeaders })
        }

        const storageForm = new FormData()
        for (const file of files) {
          storageForm.append('files', file, file.name)
        }

        try {
          const { slug } = await createPhotoWork({
            captionZh: String(form.get('captionZh') ?? ''),
            captionEn: String(form.get('captionEn') ?? ''),
            location: String(form.get('location') ?? ''),
            tags: String(form.get('tags') ?? '')
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
            form: storageForm,
          })
          return new Response(JSON.stringify({ ok: true, slug }), { status: 200, headers: jsonHeaders })
        } catch (error) {
          return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'upload_failed' }), {
            status: 500,
            headers: jsonHeaders,
          })
        }
      },
    },
  },
})
