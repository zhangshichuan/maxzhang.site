# Architecture

本项目采用“路由入口 / 业务功能 / 跨业务复用 / 服务端基础设施”四层分离的结构。
目标是保持边界清晰、降低耦合、便于扩展，并避免业务逻辑、通用能力和基础设施代码相互污染。

## 1. 架构目标

1. 业务规则与核心流程必须集中管理，不能分散在页面和组件中。
2. 页面层只负责组装，业务逻辑下沉到 feature 层。
3. 跨业务复用代码与业务专属代码严格分离，避免 `lib` 式大杂烩目录回潮。
4. 服务端基础设施独立收口，避免数据库、鉴权、缓存等能力被业务代码反向污染。

## 2. 当前分层

```text
src/routes/
  ... TanStack Router 路由入口（含 Server Route）

src/
  features/
    ... 业务功能代码
  shared/
    ... 跨业务复用代码
  server/
    ... 纯服务端基础设施

tests/
  ... 测试
```

### `src/routes`

`src/routes` 只放 TanStack Router 约定文件（由文件系统自动生成路由树）：

- `__root.tsx`（根文档壳）
- `{locale 布局}/...`（zh 无前缀、en 带 `/en` 前缀）
- `*.tsx`（页面路由）
- `api/**`（Server Route，如 `/api/tts/{locale}/{slug}.mp3`）
- `routeTree.gen.ts`（构建时自动生成）

职责：

- 页面组装
- 布局组合
- HTTP 入口暴露
- 路由参数接入
- 路由 loader 数据预取

禁止：

- 在路由文件里堆复杂业务编排
- 在页面里直接查库
- 在页面里直接实现认证、权限、校验等复杂细节
- 在 `src/routes` 下新增可复用业务 Hook

### `src/features`

`features` 是业务主战场。
每个 feature 表示一个清晰的业务域，例如 `posts`、`search`、`comments`、`chat`。

一个 feature 内允许同时包含客户端和服务端代码，只要它们都服务于同一个业务目标。

可包含的子目录：

- `components`
- `hooks`
- `api`
- `model`
- `queries`
- `services`
- `server-functions`（TanStack Server Function 包装，`createServerFn`）
- 其他业务专属目录，例如 `filters`、`editor`、`analytics`

判断标准：

如果代码明显只服务某一个业务能力，就优先放进对应 feature。

### Feature Public API

如果某个 feature 提供了 `index.ts`，这个文件就是该 feature 的公共入口（public API）。

约定：

- 页面层默认通过 `@/src/features/<feature>` 使用该 feature
- 其他 feature 默认也通过 `@/src/features/<feature>` 使用它
- `index.ts` 只导出稳定、明确希望对外暴露的能力
- feature 内部实现细节默认不通过 `index.ts` 暴露

这是一条架构约定，不是当前阶段的强制 lint 规则。

因此：

- 允许在 feature 内部继续深层 import 自己的实现文件
- 不推荐页面层和其他 feature 深层 import `features/<feature>/*`

例如 `src/features/posts/index.ts` 暴露 `getAllPostsWithViewsFn`、`loadPostPageFn`、`PostsClient` 等公共能力；
而格式转换、排序细节、内部映射函数等实现细节继续留在内部模块中。

### `src/shared`

`shared` 只收跨业务复用代码。

当前约定目录：

- `shared/components`
- `shared/api`
- `shared/config`
- `shared/constants`
- `shared/hooks`
- `shared/types`
- `shared/utils`

进入 `shared` 的条件：

1. 已经跨多个 feature 复用
2. 不带明显业务语义
3. 抽象边界已经稳定

默认策略：

宁可先留在 feature，也不要过早抽进 `shared`。

### `src/server`

`server` 只放纯服务端基础设施。

例如：

- Prisma 客户端
- 缓存与队列客户端
- 第三方服务端 SDK 封装
- 邮件、搜索、对象存储等服务端适配层

判断标准：

如果脱离某个具体 feature 仍然成立，它更可能属于 `src/server`。

## 3. 业务层内部边界

### `queries`

`queries` 负责读取数据。

适合放：

- 服务端组件要用的查询函数
- 业务页面需要的聚合读取逻辑
- Prisma 查询封装与结果映射

约束：

- 只读，不写
- 可以依赖 `src/server/db`
- 不承载 UI 状态
- 服务端查询模块以 `.server.ts` 结尾（如 `queries/posts.server.ts`）；
  TanStack 构建会在客户端引用时报错，确保 fs/Prisma 不进浏览器 bundle

### `services`

`services` 负责业务编排。

适合放：

- 多步骤业务动作
- 校验、读取、转换、持久化的组合流程
- 被 Server Function、Server Route、其他服务共同复用的业务逻辑

约束：

- 可以读，也可以写
- 可以依赖 `queries`
- 可以依赖 `src/server/*`

### `server-functions`

`server-functions` 是用 `createServerFn` 暴露给前端调用的服务端入口（客户端编译为 RPC 存根）。

约束：

- 入口尽量薄
- 不把复杂业务细节直接堆在 Server Function 中
- 真实业务流程优先下沉到 `services`
- handler 内只引用 `*.server.ts` 模块；公共 barrel 不得转发服务端模块

### Server Route（`src/routes/api/**`）

Server Route 是 HTTP 边界，不是业务逻辑仓库（如 `/api/tts/{locale}/{slug}.mp3`）。

职责：

- 参数解析
- 权限校验入口
- 响应格式控制

复杂读取逻辑优先下沉到 `queries`，复杂写入逻辑优先下沉到 `services`。

## 4. 页面、组件、Hook 规则

### 页面

页面只做组装。

允许：

- 调用业务 Hook
- 调用查询结果
- 处理跳转与布局

不允许：

- 大段表单流程堆在页面里
- 直接查库
- 直接写复杂业务规则或权限逻辑

### 业务组件

业务组件放在 `features/<feature>/components`。

职责：

- 展示
- 交互
- 调用 Hook

不直接承担：

- 数据库访问
- 底层权限判断
- 与业务无关的底层算法或基础能力实现

### Hook

Hook 只承载 React 状态逻辑。

适合写成 Hook：

- 表单状态
- 弹窗状态
- 搜索筛选状态
- 解锁状态
- 与生命周期绑定的交互逻辑

不适合写成 Hook：

- 纯函数工具
- 纯函数规则
- 与 React 无关的独立算法
- 数据库访问

判断标准：

如果明天不用 React，这段代码仍然成立，它大概率不应该是 Hook。

## 5. 数据库访问规则

推荐访问顺序：

1. 读取逻辑优先进入 `features/*/queries`
2. 写入与编排优先进入 `features/*/services`
3. 页面和组件不直接访问 Prisma

允许直接调 Prisma 的层：

- `features/*/queries`
- `features/*/services`
- 必要时的 Server Route（`src/routes/api/**`）

服务端组件如果要查库，优先调用 `queries`，不要在组件文件里直接内联 Prisma 查询。

## 6. 核心能力约束

以下能力应该集中放置、可定位、可测试：

- 数据访问客户端
- 权限与访问控制
- 限流、防刷、审计日志
- 第三方服务调用封装
- 核心业务规则与状态转换

UI 层只调用明确暴露的能力，不直接实现底层细节。

## 7. 新文件放置决策顺序

新增一个文件时，按下面顺序判断：

1. 它是不是 TanStack Router 路由入口文件（页面 / Server Route）？
   如果是，放 `src/routes`

2. 它是不是某个业务专属代码？
   如果是，放对应 `src/features/<feature>`

3. 它是不是跨业务复用代码？
   如果是，放 `src/shared`

4. 它是不是纯服务端基础设施？
   如果是，放 `src/server`

如果仍然犹豫：

默认先放 feature，不要抢先放 shared。
