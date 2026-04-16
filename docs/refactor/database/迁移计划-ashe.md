# Database Refactor Plan

## 1. 目标

本次数据库层重构有两个核心目标：

1. 将现有业务数据从 SQLite 迁移到 PostgreSQL，承接当前 Prisma 模型数据
2. 为后续 RAG 能力预留向量检索基础设施，引入 `pgvector`

这次调整不是单纯“换数据库”，而是要把当前项目的数据层从“单机文件型存储”升级为“可迁移、可远程部署、可支持向量检索”的结构。

## 2. 当前现状

当前数据库方案：

- Prisma datasource 仍是 `sqlite`
- 运行时 Prisma 使用 `@prisma/adapter-better-sqlite3`
- Docker 依赖本地 volume 挂载 `/app/data`
- 迁移流程依赖远端主机上的 SQLite 文件

当前限制：

- 不能自然支持 `pgvector`
- Prisma 迁移与本地文件绑定较重
- CI/CD 无法形成清晰的“远程数据库迁移”模型
- 后续 RAG 向量存储无法落到同一数据库基础设施

## 3. 目标状态

目标状态分两层：

### 3.1 业务关系数据

继续由 Prisma 管理，使用 PostgreSQL 承载现有模型：

- `PostView`
- `ViewLog`
- `Comment`
- `CommentLog`

### 3.2 RAG 向量数据

新增向量表，使用 PostgreSQL + `pgvector` 承载：

- 文档 chunk
- chunk metadata
- embedding vector

结论：

- 业务结构化数据继续走 Prisma 常规模型
- 向量数据与向量检索能力落在 PostgreSQL 中，但通过 Prisma 的自定义 migration + raw SQL 管理

## 4. 推荐方案

## 4.1 数据库统一为 PostgreSQL

建议直接统一到 PostgreSQL，不保留 SQLite 双写或长期兼容层。

理由：

- 项目体量尚小，迁移窗口可控
- 后续 RAG 必然需要向量能力
- 同一数据库承载业务数据和 RAG 元数据，工程复杂度最低
- 远程部署、备份、迁移流程都比 SQLite 清晰

## 4.2 `pgvector` 的接入方式

建议使用：

- PostgreSQL 数据库
- 安装 `vector` extension
- 通过 Prisma migration 执行 `CREATE EXTENSION IF NOT EXISTS vector`
- 向量表中的 `vector` 字段使用 Prisma `Unsupported("vector")`
- 插入向量、相似度检索、索引创建走 raw SQL

原因：

- Prisma 官方当前对 `vector` 仍不是原生 Prisma Client 类型
- 适合的做法是“Prisma 管 schema 和常规表，vector 相关操作用 migration + raw SQL”

这意味着：

- 关系型业务数据仍正常使用 Prisma Client
- RAG 向量相关功能单独封装在 server infra 层

## 5. Prisma 层改造计划

## 5.1 datasource 切换

将 `prisma/schema.prisma` 从：

- `provider = "sqlite"`

改为：

- `provider = "postgresql"`

同时统一使用标准 PostgreSQL `DATABASE_URL`。

## 5.2 去掉 SQLite adapter

当前运行时代码使用的是 `@prisma/adapter-better-sqlite3`。

切换到 PostgreSQL 后建议：

- 移除 `@prisma/adapter-better-sqlite3`
- Prisma Client 改回标准初始化方式

预期效果：

- `src/server/db/prisma.ts` 不再依赖 SQLite 专属适配器
- 开发环境和生产环境使用一致的数据库接入模式

## 5.3 Prisma migration 策略

建议迁移方式如下：

### 业务表迁移

由 Prisma 正常生成 migration。

### `pgvector` extension 和向量表迁移

通过 `prisma migrate dev --create-only` 创建空 migration 后手写 SQL。

建议做法：

1. 先完成 SQLite -> PostgreSQL 的基础 migration
2. 再单独增加一个 `add-pgvector` migration
3. 在该 migration 中：
   - `CREATE EXTENSION IF NOT EXISTS vector;`
   - 创建知识库文档表
   - 创建向量索引

## 5.4 `migration_lock.toml`

迁移到 PostgreSQL 后，现有 migration 历史需要重新梳理。

建议：

- 不要试图让 SQLite migration 历史直接跨 provider 复用
- 新建一套 PostgreSQL 基线 migration

更稳妥的路径：

1. 保留当前 SQLite schema 作为参考
2. 切换 provider 后生成新的 PostgreSQL 基线 migration
3. 后续所有 migration 都基于 PostgreSQL 持续演进

## 6. 数据迁移策略

## 6.1 本项目数据特点

当前数据主要是：

- 阅读量统计
- 访问日志
- 评论
- 评论日志

这些数据不是强事务核心数据，迁移成本相对可控。

## 6.2 推荐迁移方式

建议分两阶段：

### 阶段 A：先切库，不迁旧数据

适用场景：

- 当前站点线上数据价值不高
- 评论和浏览数据可接受清空
- 优先推进架构升级

优点：

- 风险最低
- 落地最快
- 能快速为 RAG 开路

### 阶段 B：如需保留历史数据，再补一次性迁移脚本

迁移脚本职责：

- 从 SQLite 读取原表数据
- 写入 PostgreSQL 新表

建议：

- 如果旧数据没有明显业务价值，首版不做迁移脚本
- 如果要保留评论和浏览量，再单独补一个一次性导入脚本

## 7. 向量表设计建议

建议单独增加知识库向量表，不混入现有业务表。

可参考逻辑结构：

- `KnowledgeDocument`
  - `id`
  - `source_type`
  - `source_key`
  - `locale`
  - `title`
  - `url`
  - `content`
  - `metadata_json`
  - `embedding vector(n)`
  - `created_at`
  - `updated_at`

说明：

- `metadata_json` 用于保存 tags、category、slug 等检索元信息
- `embedding` 使用 `vector(dim)`
- `source_key` 可用于去重和重建索引

## 8. 向量检索实现边界

建议明确边界：

### Prisma 负责

- 业务表 CRUD
- 常规 migration 管理
- 向量表 schema 纳入 migration 历史

### Raw SQL / 独立 infra 负责

- 向量插入
- 向量更新
- 相似度查询
- HNSW / IVFFlat 索引 SQL

这样做的好处是：

- 不强行把 `pgvector` 挤进 Prisma 常规模型用法
- 后续替换 embedding 模型或索引策略时更灵活

## 9. 本地开发数据库方案

本地开发建议使用 Docker 启 PostgreSQL，并在本地数据库中启用 `pgvector`。

建议目标：

- 一个本地 PostgreSQL 容器
- 固定开发数据库名、用户名、密码
- `pgvector` 预装
- 本地 `DATABASE_URL` 指向容器

不建议继续本地开发使用 SQLite、线上使用 PostgreSQL 的双轨模式。

理由：

- schema 行为会分叉
- migration 无法保证一致
- `pgvector` 相关开发无法在本地真实验证

## 10. 生产数据库方案

生产环境建议也统一为 PostgreSQL，并确保数据库实例具备 `vector` extension。

选型上有两种方向：

### 方向 A：容器内自托管 PostgreSQL

适合：

- 当前已有部署主机
- 可以接受数据库和应用部署在同一主机

要求：

- 单独数据卷
- 定期备份
- 明确数据库升级策略

### 方向 B：托管 PostgreSQL

适合：

- 希望降低数据库运维成本
- 不希望应用容器和数据库容器绑死在同一台机器

要求：

- 托管服务支持 `pgvector`
- CI/CD 或部署主机能访问数据库

当前如果没有专门的 Docker 服务器，但有一台可 SSH 的部署主机，短期更现实的方案通常是：

- 应用仍通过打包部署
- PostgreSQL 独立容器长期驻留在部署主机
- 应用发布时只替换 app 容器，不销毁数据库卷

## 11. Prisma 与 `pgvector` 的关键决策

需要尽早确认以下决策：

### 决策 1：向量数据是否纳入同一数据库

建议：纳入同一 PostgreSQL。

### 决策 2：向量表是否由 Prisma 完整管理

建议：只让 Prisma 管 migration 历史，不依赖 Prisma Client 直接操作 `vector` 字段。

### 决策 3：是否立即做 ANN 索引

建议：首版先完成 exact search，数据量上来后再补 HNSW。

这样能避免在项目初期把问题复杂化。

## 12. 迁移实施顺序

建议按以下顺序执行：

1. 移除 SQLite adapter 依赖，改造 Prisma runtime 初始化
2. 切换 Prisma datasource 到 PostgreSQL
3. 重新建立 PostgreSQL 基线 migration
4. 接入本地 PostgreSQL 开发环境
5. 接入生产 PostgreSQL 部署环境
6. 验证现有评论、浏览、日志功能
7. 新增 `pgvector` migration
8. 增加向量表与 raw SQL 基础设施

## 13. 风险点

### 风险 1：旧 migration 无法平滑复用

这是预期现象，不建议硬兼容。

### 风险 2：Prisma Studio 对 `vector` 表支持有限

带有 `Unsupported("vector")` 字段的表在 Prisma Studio 中存在限制，不应依赖 Studio 管理向量数据。

### 风险 3：把向量检索硬塞进 Prisma 常规模型

会导致实现别扭，后续可维护性差。

### 风险 4：本地和线上数据库环境不一致

一旦本地不是 PostgreSQL + `pgvector`，后续 RAG 开发会出现大量环境偏差。

## 14. 结论

数据库层的推荐路线是：

- 彻底从 SQLite 切换到 PostgreSQL
- 业务数据继续由 Prisma Client 管理
- `pgvector` 通过 extension + customized migration + raw SQL 接入
- 本地和线上统一数据库类型
- 首版优先完成数据库统一与 `pgvector` 落位，不急于一开始就做复杂向量索引优化
