# Max Zhang's Personal Website

[中文版本](./README.zh.md)

A modern personal blog built with **Next.js 16 (App Router)** and **Tailwind CSS 4**, sharing insights on software development, architecture, and AI. Features **MDX** content management, high-performance client-side search, and a Neo-brutalism-inspired responsive design.

## ✨ Key Features

- **Modern Architecture**: Next.js 16 App Router + React 19, leveraging Server Components (RSC) for optimal SEO and performance.
- **Neo-brutalism Design**: Bold, energetic UI with high-contrast borders and "pop" shadows, optimized for Web App aesthetics.
- **MDX Content-Driven**: Write in Markdown/MDX with embedded React components and **Mermaid** diagrams.
- **Multi-language Support**: Fully internationalized via `next-intl`, **English default** with Chinese locale.
- **Fuzzy Search**: **Fuse.js** for lightning-fast client-side search across titles, content, tags, and categories.
- **Comment System**: Fingerprint-based anti-spam with daily limits, protecting against malicious submissions.
- **View Tracking**: Per-article view counts with 24-hour deduplication per visitor.
- **High Performance**: Minimal CLS (Cumulative Layout Shift) and stable scroll restoration.
- **Dark Mode**: Seamless theme switching with system preference detection via `next-themes`.

## 🛠️ Tech Stack

| Category  | Technology                                                                             |
| --------- | -------------------------------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org/) (React 19)                                           |
| Styling   | [Tailwind CSS 4](https://tailwindcss.com/)                                             |
| Animation | [Framer Motion](https://www.framer.com/motion/)                                        |
| I18n      | [next-intl](https://next-intl-docs.vercel.app/)                                        |
| Content   | [MDX](https://mdxjs.com/), [gray-matter](https://github.com/jonschlinkert/gray-matter) |
| Diagrams  | [Mermaid.js](https://mermaid.js.org/)                                                  |
| Search    | [Fuse.js](https://www.fusejs.io/)                                                      |
| Icons     | [Lucide React](https://lucide.dev/)                                                    |
| Database  | [Prisma](https://www.prisma.io/) + SQLite                                              |
| Theme     | [next-themes](https://github.com/pacocoursey/next-themes)                              |

## 📂 Project Structure

```bash
├── app/                    # Next.js App Router
│   └── [locale]/           # Internationalized routes
│       ├── posts/          # Article list & detail ([slug])
│       ├── search/         # Unified search page
│       └── about/          # About page
├── articles/               # MDX source files
│   ├── en/                 # English articles
│   └── zh/                 # Chinese articles
├── components/             # Reusable React components
│   ├── mdx/                # MDX components (e.g., Mermaid)
│   └── ui/                 # Base UI (Neo-brutalism style)
├── lib/                    # Utilities
│   ├── actions/            # Server actions (comments, views)
│   └── posts.ts           # MDX data fetching
├── i18n/                   # i18n config (routing & requests)
├── messages/               # Translation files (en.json, zh.json)
├── prisma/                 # Prisma ORM database schema
├── public/                 # Static assets
├── .github/                # GitHub Actions workflows
└── proxy.ts                # Next.js proxy (v16 pattern)
```

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   pnpm install
   ```
3. **Start development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## ✍️ Writing Articles

All articles live in `articles/{locale}/`. Create a new `.mdx` file to publish.

**Frontmatter Example:**

```yaml
---
title: 'Article Title'
date: '2026-03-21'
summary: 'A brief summary of the post.'
tags: ['Next.js', 'TypeScript']
category: 'Frontend' # Frontend | Backend | DevOps
author: 'Max Zhang'
---
Your content here...
```

## 🔧 Code Quality

The project enforces code quality via **husky** git hooks:

```bash
# Run all checks (tsc + eslint + prettier)
pnpm lint

# Individual checks
pnpm lint:tsc       # TypeScript type checking
pnpm lint:eslint     # ESLint auto-fix
pnpm lint:prettier   # Prettier formatting
```

**Commit Convention** (enforced by commitlint):

```
feat: add new feature
fix: bug fix
docs: update documentation
style: code formatting
refactor: code refactoring
perf: performance optimization
test: add tests
chore: build/tooling changes
```

## 🏗️ Build & Deployment

Configured for **Docker** deployment with standalone output mode.

**Local Build:**

```bash
pnpm build
pnpm start
```

**Automated Deployment:**

GitHub Actions (`.github/workflows/deploy.yml`) for automatic builds via SSH/Docker on push.

## 📄 License

MIT
