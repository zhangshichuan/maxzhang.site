# Max Zhang 的个人网站

[English Version](./README.md)

这是一个基于 **Next.js 16 (App Router)** 和 **Tailwind CSS 4** 构建的现代个人博客网站，旨在分享关于软件开发、设计和 AI 的思考。项目采用 **MDX** 进行内容管理，拥有高性能的客户端搜索和适配 Web App 体验的响应式设计。

## ✨ 核心特性

-   **现代架构**: 基于 Next.js 16 App Router 和 React 19 构建，利用服务端组件 (RSC) 实现极致的 SEO 和性能。
-   **新丑风设计 (Neo-brutalism)**: 大胆且富有能量感的 UI，采用高对比度边框和“弹出式”阴影，针对 Web App 质感进行了深度优化。
-   **MDX 内容驱动**: 使用 Markdown/MDX 编写文章，支持在文章中直接嵌入 React 组件和 **Mermaid** 流程图。
-   **多语言支持**: 基于 `next-intl` 实现全站国际化，**默认为英文**，支持中文。
-   **模糊搜索**: 集成 **Fuse.js** 实现闪电般的客户端模糊搜索，支持按标题、内容、标签和分类过滤。
-   **高性能优化**: 优化的布局减少了累积布局偏移 (CLS)，并实现了稳定的滚动恢复机制。
-   **深色模式**: 支持深色/浅色模式切换，并能自动识别系统主题偏好。

## 🛠️ 技术栈

-   **框架**: [Next.js 16](https://nextjs.org/) (React 19)
-   **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **动画**: [Framer Motion](https://www.framer.com/motion/)
-   **国际化**: [next-intl](https://next-intl-docs.vercel.app/)
-   **内容处理**: [MDX](https://mdxjs.com/), [gray-matter](https://github.com/jonschlinkert/gray-matter)
-   **图表**: [Mermaid.js](https://mermaid.js.org/)
-   **搜索**: [Fuse.js](https://www.fusejs.io/)
-   **图标**: [Lucide React](https://lucide.dev/)

## 📂 项目结构

```bash
├── app/[locale]          # 支持多语言的 Next.js 路由
│   ├── posts/            # 文章列表与详情 ([slug])
│   ├── search/           # 统一搜索页面
│   ├── about/            # 关于我页面
│   └── layout.tsx        # 全局布局与 Provider
├── articles/             # MDX 文章源文件
│   ├── en/               # 英文文章
│   └── zh/               # 中文文章
├── components/           # 可复用的 React 组件
│   ├── mdx/              # MDX 专用组件 (如 Mermaid)
│   ├── ui/               # 基础 UI 组件 (新丑风风格)
│   └── ...
├── i18n/                 # 国际化配置 (路由与请求处理)
├── messages/             # 翻译 JSON 文件 (en.json, zh.json)
├── lib/                  # 工具函数与数据获取逻辑
├── public/               # 静态资源
└── proxy.ts              # Next.js 代理 (v16 推荐，替代之前的 middleware)
```

## 🚀 快速开始

1.  **克隆仓库**
2.  **安装依赖**
    ```bash
    pnpm install
    ```
3.  **启动开发服务器**
    ```bash
    pnpm dev
    ```
    打开 [http://localhost:3000](http://localhost:3000) 即可预览。

## ✍️ 内容创作

所有文章均位于 `articles/{locale}/` 目录下。只需创建一个新的 `.mdx` 文件即可。

**Frontmatter 格式示例：**

```yaml
---
title: '文章标题'
date: '2026-03-21'
summary: '文章的简短摘要。'
tags: ['Next.js', 'TypeScript']
category: '技术'
author: 'Max Zhang'
---
正文内容...
```

## 🏗️ 构建与部署

项目已配置为 **Docker** 部署，采用 standalone 模式。

**本地构建：**
```bash
pnpm build
pnpm start
```

**自动部署：**
集成 GitHub Actions (`.github/workflows/deploy.yml`)，实现代码推送后通过 SSH/Docker 自动构建并部署至生产服务器。

## 📄 开源协议

MIT
