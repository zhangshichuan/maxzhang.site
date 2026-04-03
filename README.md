# Max Zhang's Personal Website

[中文版本](./README.zh.md)

A modern personal blog built with **Next.js 16 (App Router)** and **Tailwind CSS 4**, sharing insights on software development, architecture, and AI. It uses **MDX** for content, supports bilingual publishing, and follows a layered structure around `app`, `src/features`, `src/shared`, and `src/server`.

## ✨ Key Features

- **Modern Architecture**: Next.js 16 App Router + React 19, leveraging Server Components (RSC) for optimal SEO and performance.
- **Neo-brutalism Design**: Bold, energetic UI with high-contrast borders and "pop" shadows, optimized for Web App aesthetics.
- **MDX Content-Driven**: Write in Markdown/MDX with embedded React components and **Mermaid** diagrams.
- **Multi-language Support**: Fully internationalized via `next-intl`, **English default** with Chinese locale.
- **Fuzzy Search**: **Fuse.js** for lightning-fast client-side search across titles, content, tags, and categories.
- **Comment System**: Fingerprint-based anti-spam with daily limits, protecting against malicious submissions.
- **View Tracking**: Per-article view counts with 24-hour deduplication per visitor.
- **Layered Codebase**: Route entrypoints stay in `app`, business code lives in `src/features`, shared UI/utilities live in `src/shared`, and server infrastructure is isolated in `src/server`.
- **Vitest Coverage**: Query, service, and server-action layers are covered by unit tests for core blog, engagement, and chat flows.
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
├── app/                         # Next.js route entrypoints only
│   └── [locale]/                # Localized pages
├── articles/                    # MDX source files
│   ├── en/
│   └── zh/
├── src/
│   ├── features/                # Business domains
│   │   ├── about/
│   │   ├── chat/
│   │   ├── engagement/          # comments / views
│   │   ├── home/
│   │   └── posts/
│   ├── shared/                  # Cross-feature components and utils
│   │   ├── components/
│   │   └── utils/
│   └── server/                  # Pure server infrastructure
│       └── db/
├── tests/                       # Vitest test suite
├── i18n/                        # i18n config
├── messages/                    # Translation files
├── prisma/                      # Prisma schema and migrations
├── public/                      # Static assets
├── .github/                     # GitHub Actions workflows
└── proxy.ts                     # Next.js proxy (v16 pattern)
```

## 🧱 Architecture Notes

- `app` only contains route entrypoints such as `page.tsx`, `layout.tsx`, and other Next.js convention files.
- `src/features` holds business-specific UI, queries, services, and server-actions.
- `src/shared` is reserved for stable cross-feature UI and utilities.
- `src/server` contains server-only infrastructure such as the Prisma client.

For the detailed layering guideline used in this repo, see [ARCHITECTURE.md](./ARCHITECTURE.md).

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
# Run all checks (tsc + eslint + prettier + prisma format)
pnpm lint

# Individual checks
pnpm lint:tsc        # TypeScript type checking
pnpm lint:eslint     # ESLint auto-fix
pnpm lint:prettier   # Prettier formatting
pnpm test            # Run Vitest once
pnpm test:watch      # Run Vitest in watch mode
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
pnpm test
pnpm lint
pnpm build
pnpm start
```

**Automated Deployment:**

GitHub Actions (`.github/workflows/deploy.yml`) for automatic builds via SSH/Docker on push.

## 📄 License

MIT
