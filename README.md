# Max Zhang 个人网站

Max 的个人技术网站：中英双语技术文章、评论与阅读统计、「夜宴」式 AI 名人圆桌，以及由 edge-tts 实时合成的文章语音播报。

线上地址：<https://maxzhang.site>

## 技术栈

- **Web**：TanStack Start（TanStack Router + Vite + Nitro）、React 19、TypeScript
- **样式**：Tailwind CSS 4
- **数据**：Prisma + SQLite（Better-SQLite3 驱动适配器）
- **内容**：MDX 构建期编译，中英各 28 篇；支持 remark-gfm 与 Mermaid 图表
- **国际化**：自建薄 i18n 层，en 为默认语言、无 URL 前缀，zh 走 `/zh` 前缀；语言完全由 URL 决定，不做浏览器语言自动跳转
- **TTS**：`apps/services/tts`（FastAPI + edge-tts，依赖用 uv 管理），按内容哈希缓存、流式返回 MP3
- **夜宴**：`apps/services/chat`（Go 标准库 + DeepSeek，事件流式转发、无状态），14 位已蒸馏人物的提示词见 `apps/services/chat/personas/`
- **摄影存储**：`apps/services/storage`（NestJS + sharp，Provider 抽象），v1 用服务器本地磁盘适配器，七牛适配器保留待接入
- **部署**：Docker Compose 多服务编排，GitHub Actions 在 push `main` 时自动构建部署

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
    chat/            # Go 夜宴聊天服务（DeepSeek 流式转发，端口 9000）
    storage/         # NestJS 图片加工与对象存储服务（Provider 抽象，v1 本地磁盘，端口 9001）
docs/
  adr/               # 架构决策记录
```

## 本地开发

前置要求：Node.js 22+、pnpm 10、Python 3.12+、uv、Go 1.22+。

```bash
pnpm install        # 安装依赖（postinstall 自动 prisma generate）
pnpm dev            # 一键拉起 Web + TTS + 聊天服务
```

`pnpm dev` 会通过 `scripts/dev.mjs` 同时启动四部分：

- **Web**：Vite + TanStack Start 开发服务器（http://localhost:3000，热更新）；
- **TTS**：`uv run uvicorn app.main:app --port 8001 --reload`，自动热重载；
- **聊天**：`go run .`（:9000），需要 `DEEPSEEK_API_KEY`，写入 `apps/services/chat/.env` 即可（`.env` 优先于环境变量，避免残留 key 干扰）。
- **存储**：`pnpm --filter storage dev`（:9001），`STORAGE_API_KEY` 与 `PHOTOS_DIR` 写在 `apps/services/storage/.env`。

启动前脚本会自动清理 3000 / 8001 / 9000 / 9001 上的残留进程（先优雅 SIGTERM，1 秒后仍占用再 SIGKILL），避免上次没退干净的旧实例占住端口。

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
- `apps/services/storage/.env`：`STORAGE_API_KEY`、`STORAGE_PROVIDER=local`、`PHOTOS_DIR` 等，由 `scripts/dev.mjs` 注入。

Web 默认访问 `http://localhost:8001` 的 TTS 服务、`http://localhost:9000` 的聊天服务与 `http://localhost:9001` 的存储服务。生产环境不读取 `.env`，密钥由部署平台/CI 注入。

## 常用命令

| 命令                                     | 说明                                            |
| ---------------------------------------- | ----------------------------------------------- |
| `pnpm dev`                               | 一键拉起 Web + TTS + 聊天                       |
| `pnpm dev:web`                           | 只起 Web 开发服务器（:3000）                    |
| `pnpm dev:services`                      | 只起 TTS（:8001）+ 聊天（:9000）                |
| `pnpm dev:otel` / `pnpm dev:otel:stop`   | 起 / 停可观测性全家桶                           |
| `pnpm build`                             | 生成 MDX → 构建 `.output` → 类型检查            |
| `pnpm start`                             | 运行生产服务（`node .output/server/index.mjs`） |
| `pnpm lint`                              | tsc → eslint --fix → prettier → prisma format   |
| `pnpm test` / `pnpm test:watch`          | Vitest 单次 / 监听                              |
| `pnpm db:migrate` / `pnpm db:studio`     | Prisma 迁移 / 可视化数据库                      |
| `cd apps/services/chat && go test ./...` | Go 聊天服务测试                                 |

## 内容维护

- 文章放在 `apps/web/articles/{zh,en}/`，文件名即 slug
- frontmatter 必填：`title`、`date`、`summary`、`tags`、`category`、`author`
- `category` 仅允许 `Frontend` / `Backend` / `DevOps`，标签自由
- 文章语音按需生成：以文本 SHA-256 为缓存键，内容更新后自动重新生成，仓库不保存任何音频文件

## 摄影模块

- 摄影作品以“作品”为单元：一条作品可含 1～10 张照片（轮播），中英双语图注，读者可评论
- 管理入口：`/login` 独立登录页，登录成功后进入 `/admin` 管理后台（作品列表、上传、删除、退出）；口令见 `ADMIN_PASSWORD`，Cookie 为 HttpOnly + SameSite=Strict，生产环境追加 Secure
- 防暴力破解：失败次数持久化在 SQLite，5 次/15 分钟锁 15 分钟，10 次/1 小时锁 1 小时，20 次/24 小时锁 24 小时；可配 `ADMIN_ALLOWED_IPS` 白名单（支持 IPv4/CIDR）
- 上传链路：浏览器 → Web server function → 内网存储服务 → 本地磁盘；存储服务用 sharp 生成视觉无损展示副本（WebP q95/3000px 大图 + q85/800px 缩略图），剥离 EXIF，拍摄参数与 GPS 提取进 SQLite
- 原图只保存在站主本地，服务器不留原始文件；展示副本由 Web 静态伺服：dev 写到 `apps/web/public/photos`（Vite 直接服务 `/photos/*`），生产挂载 `photos_data` 卷到 `.output/public/photos`
- 后端可插拔：当前 `STORAGE_PROVIDER=local`，七牛适配器已就绪，备案可办后切换即可

## 夜宴模块

- `/chat` 是「夜宴」：选 1 位名人对谈，或选 2–3 位开一桌；群聊按选择顺序逐位发言，每位宾客都能看到前面宾客说过什么。
- 14 位宾客的提示词在 `apps/services/chat/personas/*.md`，改编自 [alchaincyf/nuwa-skill](https://github.com/alchaincyf/nuwa-skill) 的公开示例（MIT）；授权与免责声明见 `apps/services/chat/THIRD_PARTY_NOTICES.md`。
- 所有宾客都是基于公开资料提炼的 AI 视角，不是本人，也不代表本站立场；页面内始终展示这条声明。
- 每张桌子（宾客组合）的会话按日期独立保存在浏览器 localStorage，只保留最近 3 天。
- 群聊的编排在 chat 服务内完成：一位宾客一次 DeepSeek 调用，最多 3 位；单次请求的总超时 180 秒。

### 额度与滥用防护

- **入口**：公网只暴露 Web 的 server function；Go chat 服务留在 Docker 内网（`localhost:9000` 仅本地开发），即使被绕过也还有全局预算/并发兜底。请求必须带真实访问过的浏览器指纹（`ViewLog`），匿名请求直接拒绝。
- **单客户端**：同一指纹同时只能有一条流，同一 IP 最多三条；每小时 30 次请求；每日额度按宾客数扣点（单聊 1 点、三人桌 3 点），默认每个指纹/IP 100 点/天。相关上限在 `apps/web/src/features/chat/services/chat-stream.server.ts`，可用 `CHAT_DAILY_CREDITS` 调整。
- **全局预算**：chat 服务按「人物提示词 + 历史 + 输出上限」估算字符数，请求开始前预留、结束后按实际用量结算；默认 `CHAT_DAILY_BUDGET_CHARS=5,000,000`，大约 60 次单聊或 20 次三人桌。全局并发默认 6（`CHAT_MAX_CONCURRENCY`），每日请求上限 `DEEPSEEK_DAILY_LIMIT=1000`。
- **持久化**：当日预算状态写入 `CHAT_STATE_FILE`，Docker 挂载 `chat_data` 卷，进程重启不会把已花额度清零。
- **上下文上限**：用户单条 2,000 字符，assistant 单条 20,000 字符，历史总长 60,000 字符，一桌最多 3 位；群聊输出上限 900 tokens/人，单聊 1,400 tokens。
- **错误码**：`BUSY`（同指纹/IP 已有流）、`SERVICE_BUSY`（全局并发满）、`DAILY_LIMIT`（单客户端点数用完）、`SERVICE_DAILY_LIMIT`（全局预算/请求量用完）。页面显示 `Quota 已用 / 100` 和「每轮 N 点额度」。
- 详细设计与取舍见 `docs/adr/0016-chat-quota-and-abuse-guards.md`。如果出现持续攻击，优先在 Cloudflare/WAF 层加人机验证，或临时调低全局预算/并发。

## 部署

`docker compose up -d` 编排四个服务：

- `app`：TanStack Start 应用（:3000），SQLite 数据卷 `sqlite_data`
- `tts`：语音合成服务（仅内网），音频缓存卷 `tts_data`（30 天 / 1GB 自动清理）
- `chat`：夜宴聊天服务（仅内网，:9000），需注入 `DEEPSEEK_API_KEY`，模型默认 `deepseek-v4-flash`
- `storage`：摄影存储服务（仅内网，:9001），展示副本卷 `photos_data`，需注入 `STORAGE_API_KEY`、`ADMIN_PASSWORD`

push `main` 后 GitHub Actions 自动执行：构建 → 打包源码 → SCP 到服务器 → `docker compose build` → 迁移 → 重启。

## 相关文档

- [CONTEXT.md](CONTEXT.md) — 领域术语与项目上下文
- [apps/web/ARCHITECTURE.md](apps/web/ARCHITECTURE.md) — Web 四层架构
- [docs/adr](docs/adr) — 架构决策记录（技术栈迁移、i18n、MDX、TTS、聊天转向夜宴）
- [AGENTS.md](AGENTS.md) — 贡献者指南
