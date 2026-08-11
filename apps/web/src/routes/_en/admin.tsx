import { createFileRoute } from '@tanstack/react-router'
import { AdminConsole } from '@/src/features/photos'

export const Route = createFileRoute('/_en/admin')({
  head: () => ({
    meta: [{ title: 'Admin Console - Max Zhang' }],
  }),
  component: AdminConsole,
})
