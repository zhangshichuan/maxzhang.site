# 从 Next.js 切换到 TanStack Start

Status: accepted

个人网站原先构建在 Next.js 16 App Router 上，重度使用 RSC、Server Actions 与 next-intl。我们决定整体迁移到 TanStack Start（Router + Vite），采用“路由 Loader + Server Function + TanStack Query”的稳定数据范式，暂不使用其仍处于实验阶段的 React Server Components。原因是 TanStack Start 提供按路由的 SSR/SSG 控制、类型安全 Server Functions 与流式能力，且站点不需要 Next.js 的垂直集成缓存体系；内容页维持构建期静态生成，动态交互走服务端函数。

Consequences: app 路由层需要整体重写；RSC 相关能力（服务端组件直接取数、generateMetadata/generateStaticParams）暂以 TanStack 的 Loader/Head 机制替代。
