import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/zh/photos')({
  component: () => <Outlet />,
})
