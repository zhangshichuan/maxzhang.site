import { createFileRoute } from '@tanstack/react-router'
import { AdminLoginPage } from '@/src/features/photos'

export const Route = createFileRoute('/zh/login')({
  head: () => ({
    meta: [{ title: '管理登录 - Max Zhang' }],
  }),
  component: AdminLoginPage,
})
