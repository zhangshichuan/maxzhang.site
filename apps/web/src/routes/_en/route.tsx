import { createFileRoute } from '@tanstack/react-router'
import { SiteLayout } from '@/src/shared/components'

/**
 * en 布局
 *
 * 非默认语言带 /en 前缀：`/en`、`/en/about`、`/en/posts/...`。
 */
export const Route = createFileRoute('/_en')({
  beforeLoad: () => ({ locale: 'en' as const }),
  component: SiteLayout,
  head: () => ({
    meta: [{ title: 'Max Zhang' }],
  }),
})
