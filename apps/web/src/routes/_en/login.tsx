import { createFileRoute } from '@tanstack/react-router'
import { AdminLoginPage } from '@/src/features/photos'

export const Route = createFileRoute('/_en/login')({
  head: () => ({
    meta: [{ title: 'Admin Login - Max Zhang' }],
  }),
  component: AdminLoginPage,
})
