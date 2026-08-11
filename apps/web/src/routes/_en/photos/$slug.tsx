import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * 旧详情页路由：302 重定向到列表页 + 弹窗深链，
 * 外链与分享链接（/photos/<slug>）继续可用。
 */
export const Route = createFileRoute('/_en/photos/$slug')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/photos',
      hash: `photo/${params.slug}`,
      statusCode: 302,
    })
  },
  component: () => null,
})
