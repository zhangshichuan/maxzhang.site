# Max Zhang's Personal Website

这是一个基于 **Next.js 16 (App Router)** 构建的现代个人博客网站，旨在分享关于软件开发、设计和生活的思考。项目采用 **MDX** 进行内容管理，支持高性能的客户端搜索和响应式设计。

## ✨ 核心特性

- **现代架构**: 基于 Next.js 16 App Router 和 React Server Components (RSC) 构建，兼顾 SEO 与性能。
- **MDX 内容驱动**: 使用 Markdown/MDX 编写文章，支持在文章中直接嵌入 React 组件。
- **模糊搜索**: 集成 **Fuse.js** 实现客户端模糊搜索，支持按标题、内容、标签和分类进行过滤。
- **响应式设计**: 使用 Tailwind CSS 构建，适配移动端和桌面端，支持深色模式（可扩展）。
- **静态生成 (SSG)**: 文章页面在构建时预渲染，加载速度快。
- **类型安全**: 全面使用 TypeScript 编写，代码健壮易维护。

## 🛠️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **内容处理**: [MDX](https://mdxjs.com/), [gray-matter](https://github.com/jonschlinkert/gray-matter), [reading-time](https://github.com/ngryman/reading-time)
- **搜索**: [Fuse.js](https://www.fusejs.io/)
- **图标**: [Lucide React](https://lucide.dev/)
- **包管理**: [pnpm](https://pnpm.io/)

## 📂 目录结构

```bash
├── app/                  # Next.js App Router 页面路由
│   ├── posts/            # 文章列表页和详情页 ([slug])
│   ├── search/           # 统一搜索页面
│   ├── layout.tsx        # 全局布局
│   └── page.tsx          # 首页
├── articles/             # MDX 文章源文件
├── components/           # React UI 组件
│   ├── post-item.tsx     # 文章列表项组件
│   ├── search-client.tsx # 核心搜索逻辑组件
│   └── ...
├── lib/                  # 工具函数
│   └── posts.ts          # 文章数据读取与解析逻辑
├── public/               # 静态资源
└── ...
```

## 🚀 本地开发

1.  **克隆项目**

    ```bash
    git clone <your-repo-url>
    cd maxzhang.site
    ```

2.  **安装依赖**

    本项目使用 `pnpm` 进行包管理。

    ```bash
    pnpm install
    ```

3.  **启动开发服务器**

    ```bash
    pnpm dev
    ```

    打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可预览。

## ✍️ 撰写文章

所有文章均位于 `articles/` 目录下。只需创建一个新的 `.mdx` 文件即可。

**Frontmatter 格式示例：**

```yaml
---
title: '文章标题'
date: '2026-02-10'
summary: '这是一段简短的文章摘要，将显示在列表页。'
tags: ['Next.js', 'React']
category: '技术'
author: 'Max Zhang'
---
这里是文章的正文内容...
```

## 🏗️ 构建与部署

本项目包含 GitHub Actions 工作流 (`.github/workflows/deploy.yml`)，可自动部署到支持静态托管的平台（如 GitHub Pages, Vercel 等）。

**本地构建：**

```bash
pnpm build
pnpm start
```

## 📄 License

MIT
