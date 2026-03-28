# Max Zhang's Personal Website

[中文版本](./README.zh.md)

A modern personal blog website built with **Next.js 16 (App Router)** and **Tailwind CSS 4**, designed to share thoughts on software development, design, and AI. The project leverages **MDX** for content management and features a high-performance client-side search and responsive design with a Neo-brutalism aesthetic.

## ✨ Key Features

- **Modern Architecture**: Built on Next.js 16 App Router and React 19, utilizing Server Components (RSC) for optimal SEO and performance.
- **Neo-brutalism Design**: A bold, energetic UI with high-contrast borders and "pop" shadows, optimized for a Web App feel.
- **MDX Content-Driven**: Write articles in Markdown/MDX with the ability to embed React components and **Mermaid** diagrams directly.
- **Multi-language Support**: Fully internationalized using `next-intl`, with **English as the default** and Chinese as a secondary locale.
- **Fuzzy Search**: Integrated **Fuse.js** for blazing-fast client-side fuzzy searching across titles, content, tags, and categories.
- **High Performance**: Optimized layout with minimal CLS (Cumulative Layout Shift) and stable scroll restoration.
- **Dark Mode**: Seamless theme switching with system preference detection via `next-themes`.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **I18n**: [next-intl](https://next-intl-docs.vercel.app/)
- **Content**: [MDX](https://mdxjs.com/), [gray-matter](https://github.com/jonschlinkert/gray-matter)
- **Diagrams**: [Mermaid.js](https://mermaid.js.org/)
- **Search**: [Fuse.js](https://www.fusejs.io/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```bash
├── app/[locale]          # Next.js App Router with i18n support
│   ├── posts/            # Article list and detail ([slug])
│   ├── search/           # Unified search page
│   ├── about/            # About me page
│   └── layout.tsx        # Global layout & Providers
├── articles/             # MDX article source files
│   ├── en/               # English articles
│   └── zh/               # Chinese articles
├── components/           # Reusable React components
│   ├── mdx/              # MDX-specific components (e.g., Mermaid)
│   ├── ui/               # Base UI components (Neo-brutalism style)
│   └── ...
├── i18n/                 # Internationalization config (routing & requests)
├── messages/             # Translation JSON files (en.json, zh.json)
├── lib/                  # Utilities and data fetching logic
├── public/               # Static assets
└── proxy.ts              # Next.js proxy (replaces middleware in v16)
```

## 🚀 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**
    ```bash
    pnpm install
    ```
3.  **Start development server**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the site.

## ✍️ Content Creation

All articles are located in `articles/{locale}/`. Simply create a new `.mdx` file.

**Frontmatter Example:**

```yaml
---
title: 'Article Title'
date: '2026-03-21'
summary: 'A brief summary of the post.'
tags: ['Next.js', 'TypeScript']
category: 'Tech'
author: 'Max Zhang'
---
Your content here...
```

## 🏗️ Build & Deployment

The project is configured for **Docker** deployment using a standalone output mode.

**Local Build:**

```bash
pnpm build
pnpm start
```

**Automated Deployment:**
Integrated GitHub Actions (`.github/workflows/deploy.yml`) for automated builds and deployment to production servers via SSH/Docker.

## 📄 License

MIT
