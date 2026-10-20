# ADR-0014: Flow Field 纸面粒子场设计

Status: accepted

Date: 2026-10-20

Supersedes: ADR-0013（MZ/OS 工作台）

## Context

MZ/OS 版把站点做成了「可操作界面」：系统栏、路径、面板、终端。它证明了界面隐喻能建立差异，但也让访客先看到「界面」，再看到人；客户明确否定了这个主题，并要求酷炫的特效、转场、动画或 3D，并进一步指定「粒子主题类似或相关」。

设计探索中做了三个粒子方向（粒子体 / 粒子场 / 粒子字），客户选定 **02 粒子场 / FLOW FIELD**：暖纸上的墨点流场，光标是风源，滚动是风，章节切换是冲击波。

## Decision

1. **主题切换为 Flow Field**：暖纸 `#f2eee6` + 墨 `#141414` + 朱红 `#d33a1e`；1px 细线、mono 小标签、纸色 sheet 面板；放弃 MZ/OS 的深色界面语言。
2. **粒子是氛围与转场，不是正文**：所有文字是真实 HTML；粒子在章节进入时被压暗、在 hero/contact 的空白处可见。
3. **动效引擎独立为客户端组件** `features/home/components/flow-field.tsx`：Canvas 2D curl-noise 流场、pointer/touch 风场、滚动风、章节 IntersectionObserver 冲击波、`+80%` 文字采样聚形、联系页句号收束。完整 cleanup，支持 React 19 StrictMode；不使用 GSAP，wipe 用 Web Animations API。
4. **页面重排**：首页为 hero → 数字 → 案例 → 判断 → 方法 → 写作 → 关于 → 联系；写作列表与文章页改为纸面编辑排版（760px 正文）；关于页改为纸面个人档案。低频页面保留功能，只用 token 换肤。
5. **降级链**：`prefers-reduced-motion` / `?static=1` 渲染静态墨迹海报；`document.hidden` 暂停 rAF；Canvas 2D 不可用时退化为纯 HTML。
6. **样式落地**：新增 `styles/flow.css` 覆盖旧 token 与页面语法；写作/关于页各自新增 `paper-posts.css` / `paper-about.css`；导航与页脚改为纸面语法。保留旧样式文件以支撑未重写的低频页面。

## Consequences

- 首页在桌面/移动均保持 100svh hero + 章节 sheet；粒子数桌面 2200、移动 950。
- 中文标题需要控制断行（避免「产品」被拆开），已在首页标题用 `keep` span 处理。
- 站点仍有旧页面（摄影/搜索/树洞/后台）沿用旧组件，只做了 paper token 换肤；后续可逐个重写。
- 字体仍以 Inter + 系统中文字体为主，没有引入新的网络字体。
- 粒子引擎依赖 DOM 契约（`#heroCopy`、`.glyph-stage`、`[data-chapter]` 等），首页 markup 改动时需同步。

## Follow-up（2026-10-20）

客户要求固定深色模式，并完善摄影 / 搜索 / 树洞 / 后台（含移动端）。据此追加：

- **固定深色：** `flow.css`、`paper-posts.css`、`paper-about.css` 与流场引擎全部切换为暖黑色板：底 `#0b0a08`、面板 `#12100d`、sheet `#14110d`、文字 `#ece7dc`、次要 `rgba(236,231,220,.62)`、线 `.14/.28`、强调 `#ff4b2f`；`color-scheme: dark`，不提供浅色模式或切换。
- **摄影 / 搜索 / 树洞 / 后台：** 各自新增深色 scoped CSS（`paper-photos.css` / `paper-search.css` / `paper-chat.css` / `paper-admin.css`），保留原有数据与交互逻辑；移动端（390）逐页验收。
- 首页、写作、文章、关于只在同一套深色 token 内重着色，不改变结构。
