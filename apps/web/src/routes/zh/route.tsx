import { createFileRoute } from '@tanstack/react-router'
import { SiteLayout } from '@/src/shared/components'

/**
 * zh 布局（路径无关）
 *
 * zh 是默认语言，URL 不带前缀：`/`、`/about`、`/posts/...` 全部挂在这里。
 */
export const Route = createFileRoute('/zh')({
  beforeLoad: () => ({ locale: 'zh' as const }),
  component: SiteLayout,
})
