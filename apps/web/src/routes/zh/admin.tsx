import { createFileRoute } from '@tanstack/react-router'
import { AdminConsole } from '@/src/features/photos'

export const Route = createFileRoute('/zh/admin')({
  head: () => ({
    meta: [{ title: '管理后台 - Max Zhang' }],
  }),
  component: AdminConsole,
})
