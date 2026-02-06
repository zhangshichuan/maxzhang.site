import Link from "next/link"
import { Calendar, Clock, Tag } from "lucide-react"

// Mock 数据 - 扩展一些
const posts = [
  {
    slug: "building-modern-site-with-nextjs",
    title: "使用 Next.js 16 构建现代全栈网站",
    summary: "探索 Next.js 的最新特性，App Router、Server Actions 以及如何优化性能。",
    date: "2026-02-05",
    readTime: "5 min",
    tags: ["Next.js", "React", "Web Dev"],
  },
  {
    slug: "understanding-react-server-components",
    title: "深入理解 React Server Components",
    summary: "RSC 到底是什么？它如何改变我们构建 React 应用的方式？",
    date: "2026-01-20",
    readTime: "8 min",
    tags: ["React", "RSC", "Architecture"],
  },
  {
    slug: "tailwind-css-v4-features",
    title: "Tailwind CSS v4 新特性概览",
    summary: "更快的构建速度，更强大的 CSS 变量支持，Tailwind v4 来了。",
    date: "2026-01-15",
    readTime: "4 min",
    tags: ["CSS", "Tailwind"],
  },
   {
    slug: "dockerizing-nextjs-app",
    title: "Docker 化 Next.js 应用的最佳实践",
    summary: "如何使用 Standalone 模式和多阶段构建来创建轻量级的 Next.js Docker 镜像。",
    date: "2025-12-10",
    readTime: "6 min",
    tags: ["DevOps", "Docker", "Next.js"],
  },
]

export const metadata = {
  title: "文章库 - Max Zhang",
  description: "Read my thoughts on software development, design, and more.",
}

export default function PostsPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <div className="flex flex-col items-start gap-4 pb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">文章库</h1>
        <p className="text-muted-foreground text-lg">
          分享关于技术、设计和生活的思考。
        </p>
      </div>
      
      <div className="grid gap-10 sm:grid-cols-1 lg:grid-cols-[2fr_1fr]">
        {/* 文章列表 */}
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="group flex flex-col space-y-3 border-b border-border pb-8 last:border-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <time dateTime={post.date} className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.date}
                 </time>
                 <span>•</span>
                 <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
              </div>
              
              <Link href={`/posts/${post.slug}`} className="block">
                <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>
              
              <p className="text-muted-foreground line-clamp-2">
                {post.summary}
              </p>
              
              <div className="flex items-center gap-4 text-sm pt-2">
                <div className="flex gap-2">
                    {post.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                            {tag}
                        </span>
                    ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 侧边栏 (可选) */}
        <aside className="hidden lg:block space-y-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 sticky top-20">
            <h3 className="font-semibold text-lg mb-4">热门标签</h3>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "React", "TypeScript", "Tailwind", "DevOps", "Design"].map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag.toLowerCase()}`}
                  className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
