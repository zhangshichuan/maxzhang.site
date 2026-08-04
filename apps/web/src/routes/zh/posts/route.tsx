import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/zh/posts')({
  component: () => <Outlet />,
})
