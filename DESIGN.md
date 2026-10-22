# Design System — Max Zhang

> Current theme: **Kinetic Index · Dark**（2026-10 起，固定深色，无浅色模式/无主题切换）。
> 历史：MZ/OS 工作台（ADR-0013）→ Flow Field 浅色纸面 → Flow Field 固定深色 → Kinetic Index（本次）。

## Product Context

- **What this is:** Max Zhang 的个人网站（TanStack Start 单体应用）：概览 / 写作 / 摄影 / 树洞 / 关于 / 搜索 / 后台，中英双语。
- **Who it's for:** 招聘方、AI 产品同行、产品写作读者。
- **Brand position:** AI 产品经理。把模型能力，做成用户真正信任的产品。
- **Project type:** 内容型个人站；首页要有作品集级别的视觉记忆点，内页必须可读、可用。

## Aesthetic Direction — Kinetic Index

- **Direction:** 设计师作品集 × AI 产品工作台。大字、强网格、钴蓝信号色、动态场与机械细节。
- **Decoration level:** 细线、mono 标签、编号、grid、grain；不用玻璃拟态、不用卡片阴影、不用紫色渐变。
- **Mood:** 冷静、精准、带一点实验室/编辑部的偏执。
- **核心原则：文字是主角，动效是信号，不是装饰。** 首屏用动态场建立记忆点；正文区域让位给阅读。
- **固定深色：** 不提供浅色主题、不跟随系统、不写 theme toggle；`color-scheme: dark`。

## Design Tokens

唯一来源：`apps/web/src/styles/final.css`（在 `design-system.css` / `flow.css` 之后加载，覆盖旧 token 与 shell）。

| 类别 | Token | 值 |
| --- | --- | --- |
| Surface | `--zx-bg` / `--zx-bg-2` / `--zx-bg-3` | `#050505` / `#0a0a0b` / `#101012` |
| Text | `--zx-ink` / `--zx-ink-70` / `--zx-ink-52` / `--zx-ink-34` | `#f4efe6` / 70% / 52% / 34% |
| Line | `--zx-line` / `--zx-line-soft` | `rgba(244,239,230,.16)` / `rgba(244,239,230,.075)` |
| Accent | `--zx-cobalt` / `--zx-cobalt-bright` | `#2f4bff` / `#6274ff`（状态、CTA、选中、信号） |
| Display | Syne 700/800 | 大标题、数字、刊头；紧字距 `-.045em` 到 `-.065em` |
| Body | Inter Variable | 15–18px；正文 1.6–1.85 行高 |
| Mono | JetBrains Mono | 8–11px 大写标签、编号、元信息 |
| Radius | 0 | 所有面板、按钮、输入框直角 |
| Motion | `cubic-bezier(.16,1,.3,1)` | 入场、遮罩、悬停 |

## Layout

- **首页：** 全屏 hero（动态等高线场 + 巨字 MAX / ZHANG + 角色行 + 小幅嵌入肖像 + 数据条）→ 钴蓝 ticker → 01 Index → 02 Case → 03 Principles → 04 Method → 05 Writing → 06 Contact（整块钴蓝）。
- **内页：** 1760px（2K 下 2120px）内容列；写作列表与文章页 780–900px 可读正文；关于页巨型标题 + 彩色肖像 + facts/experience sheet。
- **摄影：** 暗房档案式索引（masthead + facts + 图版 grid + portal lightbox + 上传 sheet）。
- **搜索 / 树洞 / 后台：** 同一套 Kinetic Index 语言；搜索为索引式结果行，树洞为固定会话面板 + 底部输入区，后台为档案卡与照片索引表。
- **导航：** 固定 68px 条，下滑隐藏、上滑出现；品牌 + 索引 + 状态 + 语言。
- **页脚：** 巨型 outline marquee + 联系 / 索引 / 更多 / 版权。

## Motion

- 首页 canvas：30 条等高线 + 网格 + 光标涟漪，时间驱动；DPR ≤ 2；`prefers-reduced-motion` 静态一帧。
- 入场：标题逐行遮罩上滑；eyebrow / lede / CTA 分层淡入；数据条与肖像延迟入场。
- 滚动：`IntersectionObserver` 触发 `[data-reveal]`，一次进入后保持。
- 页面切换：钴蓝 veil 遮罩动画；顶部钴蓝滚动进度条。
- 光标：细点 + 跟随圆环 + 链接/按钮标签；仅精确指针设备启用。
- 细节：marquee、肖像 hover 抬升、链接下划线、按钮位移、移动端关闭重动效。

## Pages

- `/`、`/zh`：Kinetic Index 首页。
- `/posts`、`/posts/$slug`：写作索引 + 可读文章版式。
- `/about`：个人档案 + 彩色肖像 + facts/experience。
- `/photos`、`/search`、`/chat`、`/admin`、`/login`：统一重做；功能与接口不变。
- 404：深色 `404` + 明确回退。

## Editing Rules

1. 正文可读性优先于动效；动效不能阻塞导航、输入和阅读。
2. 不引入紫色渐变、玻璃拟态、霓虹、卡片阴影；钴蓝只做信号色。
3. 固定深色，不新增 light-mode 分支或主题切换。
4. 英文大标题用 Syne；中文标题跟随系统黑体；正文用 Inter。
5. 任何动效都要有 `prefers-reduced-motion` 与静态 fallback。
