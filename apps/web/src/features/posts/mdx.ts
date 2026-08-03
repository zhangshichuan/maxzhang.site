import type { MdxModule } from './mdx-types'
import { mdxModules } from './generated/manifest'

/**
 * 构建期 MDX 模块注册表
 *
 * 文章在 `pnpm build` / `pnpm dev` 前由 scripts/generate-mdx.mjs
 * 编译为 TSX 模块并生成 manifest。这里按 locale/slug 惰性加载，
 * 每个模块单独分包，客户端只下载当前文章对应的 chunk。
 */
const mdxCache = new Map<string, Promise<MdxModule>>()

export function getMdxModule(locale: string, slug: string): Promise<MdxModule> | undefined {
  const importer = mdxModules[`${locale}/${slug}`]
  if (!importer) return undefined

  let promise = mdxCache.get(`${locale}/${slug}`)
  if (!promise) {
    promise = importer()
    mdxCache.set(`${locale}/${slug}`, promise)
  }
  return promise
}
