# Infra Refactor Plan

## 1. 目标

本次基础设施调整需要解决 4 件事：

1. 为本地开发提供稳定的 PostgreSQL + `pgvector` 环境
2. 为线上部署提供与开发环境一致的 PostgreSQL 基础设施
3. 区分本地开发和线上部署的 Compose / 环境变量 / 数据卷策略
4. 重构 CI/CD，使 Prisma migration 可以在 PostgreSQL 场景下稳定执行

## 2. 当前现状

当前部署方式：

- GitHub Actions 打包 Next.js standalone 产物
- 上传压缩包到远程主机
- 远程主机解压后执行 `docker compose build`
- 使用 `docker compose run --rm migrate` 执行 Prisma migration
- 使用 `docker compose up -d` 启动应用

当前设计是围绕 SQLite 的：

- 数据卷挂载 `/app/data`
- app 容器和 migrate 容器都依赖本地文件数据库
- 没有独立 PostgreSQL 服务

这套流程在 SQLite 时代能工作，但接入 PostgreSQL 后，基础设施需要从“应用容器自带数据库文件”切换为“应用连接外部数据库服务”。

## 3. 目标架构

建议目标架构拆成两类环境：

### 3.1 本地开发环境

用于：

- 日常开发
- Prisma migration
- RAG 向量能力开发
- 联调

建议组件：

- `postgres` 容器
- `app` 开发进程

可选组件：

- `adminer` 或 `pgadmin`

### 3.2 线上部署环境

用于：

- 正式运行 Next.js 应用
- 承载 PostgreSQL 数据
- 执行 Prisma migration deploy

建议组件：

- 长期运行的 `postgres` 容器
- 每次发布替换的 `app` 容器
- 按需运行的 `migrate` 容器或宿主机 migration 命令

## 4. 本地开发环境计划

## 4.1 Compose 分层

建议将本地开发和线上部署拆分，不再共用一个混合 `docker-compose.yml`。

推荐结构：

- `compose.dev.yml`
- `compose.prod.yml`

如果想兼容默认习惯，也可以：

- `docker-compose.yml` 作为开发环境
- `docker-compose.prod.yml` 作为生产环境

原则：

- 开发配置允许端口暴露和本地卷
- 生产配置强调稳定与最小暴露面

## 4.2 本地数据库容器

建议本地开发直接使用预装 `pgvector` 的 PostgreSQL 镜像。

理由：

- 环境真实
- 避免自己构建扩展
- 本地就能验证 extension 和 migration

本地环境应固定：

- 数据库名
- 用户名
- 密码
- 端口
- volume 名称

本地 `DATABASE_URL` 示例策略：

- `postgresql://app:password@localhost:5432/maxzhang_site_dev?schema=public`

## 4.3 本地命令约定

建议明确以下开发命令：

- 启动数据库
- 停止数据库
- 重建数据库
- 执行 `prisma migrate dev`
- 执行 `prisma studio`

这样后续团队或面试演示时，数据库环境启动方式会更清晰。

## 5. 线上部署环境计划

## 5.1 生产数据库容器策略

如果当前仍是“打包上传到一台可 SSH 的主机”模式，推荐生产环境改为：

- PostgreSQL 容器长期运行
- 使用命名卷持久化数据
- app 容器按版本替换
- migrate 容器按发布运行

关键点：

- 不要把 PostgreSQL 跟发布包生命周期绑在一起
- 不要因为每次重新解包就重建数据库卷

## 5.2 生产 compose 关注点

生产 compose 需要区分这些内容：

- `postgres` 服务
- `app` 服务
- `migrate` 服务

并单独处理：

- 数据卷
- 网络
- 环境变量
- 健康检查
- 启动顺序

建议增加：

- `postgres` healthcheck
- `app` 依赖数据库 ready 后再启动

## 5.3 环境变量拆分

建议区分：

- 本地 `.env.development`
- 生产 `.env.production` 或远端 `.env`

至少包含：

- `DATABASE_URL`
- RAG 相关模型 key
- 站点运行模式

不要再保留 SQLite 特有路径式配置。

## 6. CI / CD 调整计划

## 6.1 先区分 CI 和 CD

建议将当前流程的“构建验证”和“部署发布”明确拆开理解。

### CI

职责：

- 安装依赖
- 跑测试
- 跑 lint
- 跑 build
- 可选：对 migration 做基本校验

### CD

职责：

- 上传发布产物
- 部署 app 镜像
- 执行 `prisma migrate deploy`
- 重启服务

## 6.2 `prisma migrate deploy` 应该在哪执行

你的判断方向是对的：接入 PostgreSQL 后，确实可以把 Prisma migration deploy 放到标准发布流程里。

但要区分两种情况：

### 方案 A：在 GitHub Actions 里直接连远程 PostgreSQL 执行

可行前提：

- GitHub Actions runner 能访问生产数据库
- 数据库允许来自 GitHub Actions 出口 IP 的连接
- 你愿意让 CI 直接持有生产数据库写权限

问题：

- 网络和白名单通常麻烦
- 安全边界更弱
- 一旦 build 失败或 deploy 中断，流程更复杂

### 方案 B：在部署主机上执行 `prisma migrate deploy`

这是当前项目更推荐的方式。

原因：

- 你已经有远程 SSH 部署链路
- 部署主机天然能访问本机或内网 PostgreSQL
- 不需要暴露数据库给 GitHub runner
- 逻辑与现有流程最接近

结论：

- 可以把 `prisma migrate deploy` 纳入 CD
- 但更适合继续在远程主机执行，而不是直接在 GitHub Actions runner 上执行

## 6.3 当前 workflow 需要改什么

当前 [.github/workflows/deploy.yml](/home/max/maxzhang.site/.github/workflows/deploy.yml) 需要重点调整：

### 调整 1：构建产物仍可沿用

standalone 打包模式仍然可用，不必因为 PostgreSQL 就放弃。

### 调整 2：部署产物不再围绕 SQLite volume

不再需要：

- `/app/data`
- SQLite volume 挂载

### 调整 3：发布时确保数据库服务先存在

部署流程应变为更明确的顺序：

1. 上传新产物
2. 解压
3. 更新 `.env`
4. 启动或确保 `postgres` 已就绪
5. 执行 `prisma migrate deploy`
6. 启动或更新 app

### 调整 4：加入数据库健康检查等待

在 migration 前需要显式等待 PostgreSQL ready，否则首启会有竞态。

### 调整 5：区分“一次性初始化”和“常规发布”

首发 PostgreSQL 时需要：

- 初始化数据库容器
- 初始化 extension
- 初始化基线 schema

后续发布只需要：

- 执行 pending migrations
- 更新 app

## 6.4 是否要在 CI 里额外跑 migration 校验

建议做，但不要直接碰生产库。

推荐方式：

- 在 CI 中拉一个临时 PostgreSQL 服务容器
- 用它执行 `prisma migrate deploy` 或 `prisma migrate status`
- 验证 migration 可执行

价值：

- 提前发现 schema/migration 问题
- 不依赖生产数据库可达

## 7. Docker 策略建议

## 7.1 本地与线上镜像策略区分

建议明确两种角色：

### 本地开发

- PostgreSQL 容器常驻
- 应用通常本机 `pnpm dev`

### 线上部署

- PostgreSQL 容器常驻
- app 镜像由 CI 构建或在远程主机构建
- migrate 作为一次性执行单元

## 7.2 `Dockerfile.prisma` 是否保留

建议保留 migrate 专用镜像或最小执行单元，但其职责应改为：

- 使用 PostgreSQL `DATABASE_URL`
- 运行 `prisma migrate deploy`
- 不再依赖 `/app/data`

## 7.3 是否把 Postgres 打进同一个 compose

短期建议：

- 本地开发：是
- 生产环境：看主机资源与运维偏好

如果当前就是单机部署，生产 compose 中保留 `postgres` 服务是现实方案。

但要注意：

- 数据卷要稳定
- 不要在每次部署时误删卷
- 不要让 compose 文件变成“发布包级临时产物”后顺手把数据库也重建

## 8. 推荐实施顺序

建议先做基础设施，再动上层业务：

1. 设计 PostgreSQL 环境变量方案
2. 拆分开发 / 生产 compose
3. 跑通本地 PostgreSQL + `pgvector`
4. 改造 Prisma 运行时与 migration
5. 跑通生产 PostgreSQL 部署
6. 调整 deploy workflow
7. 在 CI 增加 migration 校验
8. 再开始 RAG 数据层开发

## 9. 风险点

### 风险 1：数据库容器被发布流程误重建

需要严格保护 volume 和服务生命周期。

### 风险 2：本地和生产 compose 混用

容易把开发端口暴露、调试配置带到生产。

### 风险 3：GitHub Actions 直接连接生产库

虽然技术上可行，但对当前项目不一定是更好的安全边界。

### 风险 4：没有数据库健康检查

会导致 migration 和 app 启动偶发失败。

## 10. 结论

基础设施层的推荐方向是：

- 本地与生产拆分 compose
- 统一使用 PostgreSQL + `pgvector`
- PostgreSQL 作为独立长期服务存在
- 应用发布与数据库生命周期解耦
- `prisma migrate deploy` 进入标准 CD 流程，但优先在部署主机执行
- CI 增加临时 PostgreSQL 的 migration 校验，而不是直接操作生产库
