import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_en/posts')({
  component: () => <Outlet />,
})
