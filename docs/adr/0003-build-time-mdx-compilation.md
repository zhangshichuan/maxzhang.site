# MDX 构建期编译

Status: accepted

原文章渲染依赖 `next-mdx-remote/rsc`，而项目已决定放弃实验性 RSC。我们选择在构建期用 `scripts/generate-mdx.mjs`（基于 `@mdx-js/mdx`）把 56 篇 MDX 预编译为 TSX 模块（惰性加载 + 代码分包），配合静态预渲染使用；继续支持 `remark-gfm` 与 Mermaid 自定义组件。运行时零解析开销，也不再绑定 Next.js 生态。
