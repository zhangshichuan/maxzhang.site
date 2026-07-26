# AGENTS.md — maxzhang.site

## 仓库结构（Monorepo）

```
apps/web/     ← 当前唯一实装：Next.js 个人网站
services/     ← 未来 Go/Python 微服务插槽（空目录）
packages/     ← 未来 JS/TS 共享包（空目录）
```

- 根级 `pnpm-workspace.yaml` 只包 `apps/*` + `packages/*`，`services/` 不在 pnpm 管理范围内
- 根级 `docker-compose.yml` 统一编排所有服务，每个服务自带 Dockerfile
- 根 `package.json` 的 scripts 代理到 `pnpm --filter web`，所有命令从根目录运行即可

## 环境与工具

- **包管理器**: `pnpm@10.33.0` — 必须用 pnpm，不能用 npm/yarn
- **Node**: >=22（CI 使用 Node 22）
- **数据库**: SQLite（`prisma/dev.db`），通过 Better-SQLite3 适配器连接
- **环境变量**: `.env` 中 `DATABASE_URL=file:./prisma/dev.db`

## 常用命令

```bash
pnpm dev              # 开发服务器 localhost:3000
pnpm build            # 生产构建
pnpm start            # 启动生产构建
pnpm lint             # 全量检查: tsc + eslint + prettier + prisma format（顺序执行）
pnpm lint:tsc         # 仅 TypeScript 类型检查
pnpm lint:eslint      # 仅 ESLint（带 --fix）
pnpm lint:prettier    # 仅 Prettier 格式化
pnpm test             # Vitest 单次运行（tests/**/*.test.ts）
pnpm test:watch       # Vitest watch 模式
pnpm db:migrate       # Prisma 迁移
pnpm db:studio        # Prisma Studio（可视化数据库）
```

**关键**: `pnpm lint` 按 `tsc → eslint → prettier → prisma format` 顺序执行，pre-commit hook 自动跑这套。修改代码后确保 `pnpm lint` 全部通过。

## Prisma 要点

- **Prisma 客户端不在 `@prisma/client`，而是在 `@/generated/prisma/client`**（`prisma/schema.prisma` 中配置了 `output = "../generated/prisma"`）
- `generated/` 目录由 `prisma generate` 生成，`postinstall` 脚本会自动运行
- 数据库实例通过 `@/src/server/db` 导出，不要直接 new PrismaClient
- 数据库访问规则：读取走 `features/*/queries/`，写入走 `features/*/services/`，页面和组件不直接查库

## 代码组织（四层架构）

详见 [ARCHITECTURE.md](./apps/web/ARCHITECTURE.md) 和 [CONTEXT.md](./CONTEXT.md)，核心规则：

| 目录 | 用途 | 放什么 |
|------|------|--------|
| `app/` | Next.js 路由入口 | 仅 `page.tsx`、`layout.tsx`、`route.ts` 等约定文件，不写业务逻辑 |
| `src/features/<domain>/` | 业务功能域 | `components/`、`queries/`、`services/`、`server-actions/`、`model/` |
| `src/shared/` | 跨业务复用 | 稳定、无业务语义的通用组件和工具 |
| `src/server/` | 服务端基础设施 | Prisma 客户端等纯服务端能力 |

每个 feature 通过 `index.ts` barrel export 暴露公共 API。页面和其他 feature 应通过 barrel 引入，不要深层 import 内部文件。不确定放哪时默认放 feature，不要抢先放 shared。

## 国际化（next-intl）

- 支持 `zh`（默认）和 `en`
- 默认 locale 无 URL 前缀（`/about`），非默认带前缀（`/en/about`）
- `localeDetection: false` — 不基于 Accept-Language 自动跳转
- 翻译文件在 `messages/{locale}.json`
- 中间件在 `proxy.ts`（文件名叫 proxy，实际是 next-intl middleware）

## 文章系统

- MDX 文件放在 `articles/{locale}/`，中英文各 28 篇一一对应
- Frontmatter: `title`, `date`, `summary`, `tags`, `category`, `author`
- Category 仅三种: `Frontend` | `Backend` | `DevOps`
- 统一称为「文章」，不用「博客」「帖子」的说法

## 代码风格

- **无分号**、**单引号**、2 空格缩进、120 字符行宽、尾逗号全开
- ESLint 配置: `eslint.config.mjs`，使用 flat config
- CSS: Tailwind CSS 4（`@import 'tailwindcss'` 方式，非旧版 `@tailwind` 指令）
- 服务端/客户端拆分：默认 Server Component，只有交互组件才标记 `"use client"`；数据变更走 `"use server"` 标记的 server-actions 或 services

## 测试

- Vitest 运行在 node 环境，`tests/` 目录结构镜像 `src/features/`
- 测试使用动态 `import()` + `vi.resetModules()` 来隔离模块缓存
- 需要 mock 的模块（如 `@/i18n/routing`、`@/src/features/engagement/queries`）在顶层 `vi.mock()` 声明

## 部署

- Next.js `output: 'standalone'` 模式，Docker 部署
- 两个 Dockerfile: `Dockerfile`（应用）+ `Dockerfile.prisma`（迁移）
- push `main` 分支触发 GitHub Actions 自动部署（build → SCP 上传 → SSH 执行 docker compose）
- 数据持久化在 `sqlite_data` Docker volume

## Commit 规范

Conventional Commits，husky + commitlint 强制检查:
```
feat: / fix: / docs: / style: / refactor: / perf: / test: / chore:
```
