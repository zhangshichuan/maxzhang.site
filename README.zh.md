# Max Zhang 的个人网站

[English Version](./README.md)

基于 **Next.js 16 (App Router)** 和 **Tailwind CSS 4** 构建的现代个人博客，分享软件开发、架构与 AI 方面的心得。采用 **MDX** 内容管理，拥有高性能客户端搜索和新丑风响应式设计。

## ✨ 核心特性

- **现代架构**: Next.js 16 App Router + React 19，利用服务端组件 (RSC) 实现极致 SEO 和性能。
- **新丑风设计**: 大胆且富有能量感的 UI，高对比度边框 + "弹出式"阴影，针对 Web App 质感深度优化。
- **MDX 内容驱动**: 支持在 Markdown/MDX 中直接嵌入 React 组件和 **Mermaid** 流程图。
- **多语言支持**: 基于 `next-intl` 实现全站国际化，**默认英文**，支持中文。
- **模糊搜索**: **Fuse.js** 实现闪电般的客户端搜索，支持按标题、内容、标签和分类过滤。
- **评论系统**: 基于指纹的防刷机制，每日评论次数限制，保护免受恶意提交。
- **阅读量统计**: 每篇文章独立阅读计数，同一访客 24 小时内不重复统计。
- **高性能优化**: 极低的 CLS (累积布局偏移)，稳定的滚动恢复。
- **深色模式**: 无缝主题切换，自动识别系统主题偏好。

## 🛠️ 技术栈

| 类别   | 技术                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| 框架   | [Next.js 16](https://nextjs.org/) (React 19)                                           |
| 样式   | [Tailwind CSS 4](https://tailwindcss.com/)                                             |
| 动画   | [Framer Motion](https://www.framer.com/motion/)                                        |
| 国际化 | [next-intl](https://next-intl-docs.vercel.app/)                                        |
| 内容   | [MDX](https://mdxjs.com/)、[gray-matter](https://github.com/jonschlinkert/gray-matter) |
| 图表   | [Mermaid.js](https://mermaid.js.org/)                                                  |
| 搜索   | [Fuse.js](https://www.fusejs.io/)                                                      |
| 图标   | [Lucide React](https://lucide.dev/)                                                    |
| 数据库 | [Prisma](https://www.prisma.io/) + SQLite                                              |
| 主题   | [next-themes](https://github.com/pacocoursey/next-themes)                              |

## 📂 项目结构

```bash
├── app/                    # Next.js App Router
│   └── [locale]/           # 国际化路由
│       ├── posts/          # 文章列表与详情 ([slug])
│       ├── search/         # 统一搜索页面
│       └── about/          # 关于页面
├── articles/               # MDX 文章源文件
│   ├── en/                 # 英文文章
│   └── zh/                 # 中文文章
├── components/             # 可复用 React 组件
│   ├── mdx/                # MDX 专用组件 (如 Mermaid)
│   └── ui/                 # 基础 UI 组件 (新丑风风格)
├── lib/                    # 工具函数
│   ├── actions/            # 服务端操作 (评论、阅读量)
│   └── posts.ts           # MDX 数据获取
├── i18n/                   # 国际化配置 (路由与请求)
├── messages/               # 翻译 JSON 文件 (en.json, zh.json)
├── prisma/                 # Prisma ORM 数据库 schema
├── public/                 # 静态资源
├── .github/                # GitHub Actions 工作流
└── proxy.ts                # Next.js 代理 (v16 推荐模式)
```

## 🚀 快速开始

1. **克隆仓库**
2. **安装依赖**
   ```bash
   pnpm install
   ```
3. **启动开发服务器**
   ```bash
   pnpm dev
   ```
   打开 [http://localhost:3000](http://localhost:3000) 即可预览。

## ✍️ 内容创作

所有文章位于 `articles/{locale}/` 目录下。创建新的 `.mdx` 文件即可发布文章。

**Frontmatter 示例：**

```yaml
---
title: '文章标题'
date: '2026-03-21'
summary: '文章的简短摘要。'
tags: ['Next.js', 'TypeScript']
category: 'Frontend' # Frontend | Backend | DevOps
author: 'Max Zhang'
---
正文内容...
```

## 🔧 代码质量

项目通过 **husky** Git hooks 强制代码质量：

```bash
# 运行所有检查 (tsc + eslint + prettier)
pnpm lint

# 单独运行
pnpm lint:tsc       # TypeScript 类型检查
pnpm lint:eslint     # ESLint 自动修复
pnpm lint:prettier   # Prettier 格式化
```

**提交信息规范** (由 commitlint 强制执行)：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 添加测试
chore: 构建/工具变更
```

## 🏗️ 构建与部署

已配置 **Docker** 部署，采用 standalone 模式。

**本地构建：**

```bash
pnpm build
pnpm start
```

**自动部署：**

集成 GitHub Actions (`.github/workflows/deploy.yml`)，代码推送后通过 SSH/Docker 自动构建并部署至生产服务器。

## 📄 开源协议

MIT
