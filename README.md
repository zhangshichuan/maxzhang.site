# Max Zhang 个人网站

Max 的个人技术网站：中英双语技术文章、评论与阅读统计、树洞式 AI 倾诉陪伴，以及由 edge-tts 实时合成的文章语音播报。

线上地址：<https://maxzhang.site>

## 技术栈

- **Web**：TanStack Start（TanStack Router + Vite + Nitro）、React 19、TypeScript
- **样式**：Tailwind CSS 4
- **数据**：Prisma + SQLite（Better-SQLite3 驱动适配器）
- **内容**：MDX 构建期编译，中英各 28 篇；支持 remark-gfm 与 Mermaid 图表
- **国际化**：自建薄 i18n 层，en 无 URL 前缀，zh 走 `/zh` 前缀；无前缀首页按浏览器语言/本地偏好自动跳转
- **TTS**：`apps/services/tts`（FastAPI + edge-tts，依赖用 uv 管理），按内容哈希缓存、流式返回 MP3
- **聊天**：`apps/services/chat`（Go 标准库 + DeepSeek，SSE 流式转发、无状态），树洞人设提示词见 `prompt.md`
- **部署**：Docker Compose 三服务编排，GitHub Actions 在 push `main` 时自动构建部署

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
    chat/            # Go 树洞聊天服务（DeepSeek 流式转发，端口 9000）
docs/
  adr/               # 架构决策记录
```

## 本地开发

前置要求：Node.js 22+、pnpm 10、Python 3.12+、uv、Go 1.22+。

```bash
pnpm install        # 安装依赖（postinstall 自动 prisma generate）
pnpm dev            # 一键拉起 Web + TTS + 聊天服务
```

`pnpm dev` 会通过 `scripts/dev.mjs` 同时启动三部分：

- **Web**：Vite + TanStack Start 开发服务器（http://localhost:3000，热更新）；
- **TTS**：`uv run uvicorn app.main:app --port 8001 --reload`，自动热重载；
- **聊天**：`go run .`（:9000），需要 `DEEPSEEK_API_KEY`，写入 `apps/services/chat/.env` 即可（`.env` 优先于环境变量，避免残留 key 干扰）。

启动前脚本会自动清理 3000 / 8001 / 9000 上的残留进程（先优雅 SIGTERM，1 秒后仍占用再 SIGKILL），避免上次没退干净的旧实例占住端口。

常用变体：

```bash
pnpm dev:web          # 只起 Web
pnpm dev:services     # 只起 TTS + 聊天，方便单独联调后端
pnpm dev:clean        # 清理 TanStack/Vite 缓存后启动（遇到 Invalid server function ID 等脏状态时用）
pnpm dev:otel         # 起可观测性全家桶（Collector/Jaeger/Prometheus/Grafana/Loki）
pnpm dev:otel:stop    # 停掉可观测性全家桶
```

`pnpm dev:otel` 启动后：Jaeger http://localhost:16686、Prometheus http://localhost:9090、Grafana http://localhost:3333（避免与 Web 的 3000 冲突，初始账号 admin/admin）、Loki http://localhost:3100。文章中的 Node/Go/Python demo 服务把 OTLP 发到 `localhost:4318` 即可接入。

环境变量按服务放各自的 `.env`（均已被 gitignore，示例文件见各目录下的 `.env.example`）：

- `apps/web/.env`：`DATABASE_URL`、`PUSH_API_KEY`（可选 `TTS_BASE_URL`、`CHAT_BASE_URL`），由 Vite/Nitro 开发时自动读取；
- `apps/services/chat/.env`：`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`、`DEEPSEEK_BASE_URL` 等，由 `scripts/dev.mjs` 读取并注入 `go run .`（**`.env` 优先于环境变量**，避免终端/父进程残留的旧 key 覆盖服务配置）；
- `apps/services/tts/.env`：`TTS_CACHE_DIR` 等可选配置，由 `scripts/dev.mjs` 注入。

Web 默认访问 `http://localhost:8001` 的 TTS 服务与 `http://localhost:9000` 的聊天服务。生产环境不读取 `.env`，密钥由部署平台/CI 注入。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 一键拉起 Web + TTS + 聊天 |
| `pnpm dev:web` | 只起 Web 开发服务器（:3000） |
| `pnpm dev:services` | 只起 TTS（:8001）+ 聊天（:9000） |
| `pnpm dev:otel` / `pnpm dev:otel:stop` | 起 / 停可观测性全家桶 |
| `pnpm build` | 生成 MDX → 构建 `.output` → 类型检查 |
| `pnpm start` | 运行生产服务（`node .output/server/index.mjs`） |
| `pnpm lint` | tsc → eslint --fix → prettier → prisma format |
| `pnpm test` / `pnpm test:watch` | Vitest 单次 / 监听 |
| `pnpm db:migrate` / `pnpm db:studio` | Prisma 迁移 / 可视化数据库 |
| `cd apps/services/chat && go test ./...` | Go 聊天服务测试 |

## 内容维护

- 文章放在 `apps/web/articles/{zh,en}/`，文件名即 slug
- frontmatter 必填：`title`、`date`、`summary`、`tags`、`category`、`author`
- `category` 仅允许 `Frontend` / `Backend` / `DevOps`，标签自由
- 文章语音按需生成：以文本 SHA-256 为缓存键，内容更新后自动重新生成，仓库不保存任何音频文件

## 部署

`docker compose up -d` 编排三个服务：

- `app`：TanStack Start 应用（:3000），SQLite 数据卷 `sqlite_data`
- `tts`：语音合成服务（仅内网），音频缓存卷 `tts_data`（30 天 / 1GB 自动清理）
- `chat`：树洞聊天服务（仅内网，:9000），需注入 `DEEPSEEK_API_KEY`，模型默认 `deepseek-v4-flash`

push `main` 后 GitHub Actions 自动执行：构建 → 打包源码 → SCP 到服务器 → `docker compose build` → 迁移 → 重启。

## 相关文档

- [CONTEXT.md](CONTEXT.md) — 领域术语与项目上下文
- [apps/web/ARCHITECTURE.md](apps/web/ARCHITECTURE.md) — Web 四层架构
- [docs/adr](docs/adr) — 架构决策记录（技术栈迁移、i18n、MDX、TTS、聊天转向树洞）
- [AGENTS.md](AGENTS.md) — 贡献者指南
