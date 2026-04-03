# Architecture

本项目是一个以零信任与端到端安全为核心前提的密码管理器。
当前仓库采用“路由入口 / 业务功能 / 跨业务复用 / 服务端基础设施”四层分离的结构，目标是保持边界清晰、便于扩展多端场景，并避免安全逻辑散落。

## 1. 架构目标

1. 密码、主密钥、加密流程必须集中管理，不能分散在页面和组件中。
2. 页面层只负责组装，业务逻辑下沉到 feature 层。
3. 跨业务复用代码与业务专属代码严格分离，避免 `lib` 式大杂烩目录回潮。
4. 服务端基础设施独立收口，避免数据库、鉴权、缓存能力被业务代码反向污染。

## 2. 当前分层

```text
app/
  ... Next.js 路由入口

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

### `app`

`app` 只放 Next.js 约定文件：

- `page.tsx`
- `layout.tsx`
- `route.ts`
- 其他路由相关入口文件

职责：

- 页面组装
- 布局组合
- HTTP 入口暴露
- 路由参数接入

禁止：

- 在 `page.tsx` 中堆复杂业务编排
- 在页面里直接查库
- 在页面里直接实现加密、认证、权限细节
- 在 `app` 下新增可复用业务 Hook

### `src/features`

`features` 是业务主战场。
每个 feature 表示一个清晰的业务域，例如 `auth`、`vault`。

一个 feature 内允许同时包含客户端和服务端代码，只要它们都服务于同一个业务目标。

可包含的子目录：

- `components`
- `hooks`
- `api`
- `model`
- `queries`
- `services`
- `server-actions`
- 其他业务专属目录，例如 `crypto`、`password`

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

例如 `src/features/auth/index.ts` 暴露 `login`、`register`、`isAuthenticated`、`logout` 等公共能力；
而 `decodeJWT`、`setToken`、`setCurrentUser` 这类实现细节继续留在内部模块中。

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
- JWT 能力
- 登录密码哈希
- 缓存与队列客户端
- 第三方服务端 SDK 封装

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

### `services`

`services` 负责业务编排。

适合放：

- 多步骤业务动作
- 校验、读取、转换、持久化的组合流程
- 被 Server Action、Route Handler、其他服务共同复用的业务逻辑

约束：

- 可以读，也可以写
- 可以依赖 `queries`
- 可以依赖 `src/server/*`

### `server-actions`

`server-actions` 是给前端直接调用的服务端入口。

约束：

- 入口尽量薄
- 不把复杂业务细节直接堆在 Action 中
- 真实业务流程优先下沉到 `services`

### `route.ts`

`route.ts` 是 HTTP 边界，不是业务逻辑仓库。

职责：

- 参数解析
- 鉴权入口
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
- 直接写复杂安全逻辑

### 业务组件

业务组件放在 `features/<feature>/components`。

职责：

- 展示
- 交互
- 调用 Hook

不直接承担：

- 数据库访问
- 底层鉴权
- 加密算法实现

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
- 密码强度规则
- 加密算法
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
- 必要时的 `app/api/**/route.ts`

服务端组件如果要查库，优先调用 `queries`，不要在组件文件里直接内联 Prisma 查询。

## 6. 安全约束

以下能力必须集中放置、可定位、可审计、可测试：

- 登录密码哈希
- JWT 签发与校验
- 主密钥管理
- 金库加密解密
- 数据库客户端

UI 层只调用明确暴露的能力，不直接实现安全细节。

## 7. 新文件放置决策顺序

新增一个文件时，按下面顺序判断：

1. 它是不是 Next.js 路由入口文件？
   如果是，放 `app`

2. 它是不是某个业务专属代码？
   如果是，放对应 `src/features/<feature>`

3. 它是不是跨业务复用代码？
   如果是，放 `src/shared`

4. 它是不是纯服务端基础设施？
   如果是，放 `src/server`

如果仍然犹豫：

默认先放 feature，不要抢先放 shared。
