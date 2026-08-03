# MDX 构建期编译

Status: accepted

原文章渲染依赖 `next-mdx-remote/rsc`，而项目已决定放弃实验性 RSC。我们选择在构建期把 56 篇 MDX 编译为 React 组件（`@mdx-js/rollup` / `mdx-bundler`），配合 SSG 使用；继续支持 `remark-gfm` 与 Mermaid 自定义组件。运行时零解析开销，也不再绑定 Next.js 生态。
