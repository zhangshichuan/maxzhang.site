# Max Zhang 个人网站

Max 的个人技术网站：中英双语技术文章、评论与阅读统计、流式 AI 聊天，以及由 edge-tts 实时合成的文章语音播报。

线上地址：<https://maxzhang.site>

## 技术栈

- **Web**：TanStack Start（TanStack Router + Vite + Nitro）、React 19、TypeScript
- **样式**：Tailwind CSS 4
- **数据**：Prisma + SQLite（Better-SQLite3 驱动适配器）
- **内容**：MDX 构建期编译，中英各 28 篇；支持 remark-gfm 与 Mermaid 图表
- **国际化**：自建薄 i18n 层，en 无 URL 前缀，zh 走 `/zh` 前缀；无前缀首页按浏览器语言/本地偏好自动跳转
- **TTS**：`apps/services/tts`（FastAPI + edge-tts，依赖用 uv 管理），按内容哈希缓存、流式返回 MP3
- **部署**：Docker Compose 双服务编排，GitHub Actions 在 push `main` 时自动构建部署

## 目录结构

```text
apps/
  web/               # TanStack Start 网站（路由/功能域/共享代码/服务端基础设施）
    articles/        # MDX 文章（zh/en 各 28 篇）
    messages/        # i18n 翻译文件（zh.json / en.json）
    src/routes/      # 文件路由（en 无前缀，zh 带 /zh）
    src/features/    # 业务功能域（components/queries/services/server-functions/model）
    src/shared/      # 跨业务复用组件与工具
    src/server/      # Prisma 客户端等服务端基础设施
    tests/           # Vitest 测试，镜像 src/features 结构
  services/
    tts/             # FastAPI + edge-tts 流式语音服务（uv 管理）
docs/
  adr/               # 架构决策记录
```

## 本地开发

前置要求：Node.js 22+、pnpm 10、Python 3.12+、uv。

```bash
pnpm install        # 安装依赖（postinstall 自动 prisma generate）
pnpm dev            # 启动开发服务器 http://localhost:3000
```

需要语音播报时，另起 TTS 服务：

```bash
cd apps/services/tts
uv sync
uv run uvicorn app.main:app --port 8001
```

开发环境变量：`apps/web/.env` 中配置 `DATABASE_URL=file:./prisma/dev.db`；Web 默认访问 `http://localhost:8001` 的 TTS 服务，可用 `TTS_BASE_URL` 覆盖。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发服务器（:3000） |
| `pnpm build` | 生成 MDX → 构建 `.output` → 类型检查 |
| `pnpm start` | 运行生产服务（`node .output/server/index.mjs`） |
| `pnpm lint` | tsc → eslint --fix → prettier → prisma format |
| `pnpm test` / `pnpm test:watch` | Vitest 单次 / 监听 |
| `pnpm db:migrate` / `pnpm db:studio` | Prisma 迁移 / 可视化数据库 |

## 内容维护

- 文章放在 `apps/web/articles/{zh,en}/`，文件名即 slug
- frontmatter 必填：`title`、`date`、`summary`、`tags`、`category`、`author`
- `category` 仅允许 `Frontend` / `Backend` / `DevOps`，标签自由
- 文章语音按需生成：以文本 SHA-256 为缓存键，内容更新后自动重新生成，仓库不保存任何音频文件

## 部署

`docker compose up -d` 编排两个服务：

- `app`：TanStack Start 应用（:3000），SQLite 数据卷 `sqlite_data`
- `tts`：语音合成服务（仅内网），音频缓存卷 `tts_data`（30 天 / 1GB 自动清理）

push `main` 后 GitHub Actions 自动执行：构建 → 打包源码 → SCP 到服务器 → `docker compose build` → 迁移 → 重启。

## 相关文档

- [CONTEXT.md](CONTEXT.md) — 领域术语与项目上下文
- [apps/web/ARCHITECTURE.md](apps/web/ARCHITECTURE.md) — Web 四层架构
- [docs/adr](docs/adr) — 架构决策记录（技术栈迁移、i18n、MDX、TTS）
- [AGENTS.md](AGENTS.md) — 贡献者指南
