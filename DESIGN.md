# Design System — Max Zhang

## Product Context

- **What this is:** Max Zhang 的个人网站（TanStack Start 单体应用）：首页 / 文章 / 摄影 / 树洞 / 关于，中英双语。
- **Who it's for:** 正在转向 AI 产品经理的 Max 本人，以及招聘方、同行读者、摄影作品的访客。
- **Brand position:** 「把模型能力，翻译成人们愿意用的产品」——工程底子 + 产品判断。
- **Project type:** 内容型个人站，视觉服务于内容与个人定位。

## Aesthetic Direction — AI Native（2026-10 起）

- **Direction:** AI Native / 深色科技感。深色底 + 极光渐变 + 细网格 + 等宽功能标签 + 平面卡片。
- **Decoration level:** 克制。装饰只出现在背景（极光、网格）与工具层（导航、浮层）上，内容区保持安静。
- **Mood:** 像 Linear / Anthropic 官网那种「AI 从业者」的精致克制：不炫技，但每个细节都可控。
- **核心原则：界面退后，内容与判断力在前。** 卡片是平面 panel，不再使用液态玻璃材质；玻璃只作为导航/浮层的背景模糊。
- **Dark only:** 站点只有深色主题，不提供浅色或跟随系统切换（`html.dark` 固定）。

## Design Tokens

唯一来源：`apps/web/src/styles/design-system.css`。

| 类别 | Token | 值 |
| --- | --- | --- |
| Surface | `--surface-0` / `--surface-1` / `--surface-2` | `#06070a` / `rgba(255,255,255,.035)` / `rgba(255,255,255,.06)` |
| Text | `--text-1` / `--text-2` / `--text-3` | `#eef1f7` / `#98a1b3` / `rgba(152,161,179,.5)` |
| Border | `--border-1` / `--border-2` | `rgba(255,255,255,.09)` / `rgba(255,255,255,.16)` |
| Brand | `--accent` / `--teal` | `#8b9dff`（靛蓝）/ `#5eead4`（薄荷青） |
| Gradient | `--gradient-text` | `linear-gradient(100deg,#a5b4fc,#67e8f9 45%,#6ee7b7)` |
| Gradient | `--gradient-button` | `linear-gradient(120deg,#c7d2fe,#a7f3d0)`，文字 `#07080c` |
| Radius | `--radius-xs/sm/md/lg/pill` | `8 / 12 / 16 / 20 / 999px` |
| Motion | `--ease-out` / `--ease-spring` | `cubic-bezier(.22,1,.36,1)` / `cubic-bezier(.22,1.35,.36,1)` |
| Code | `--code-bg` | `#0b0d13` |

兼容别名（`--bg` / `--label` / `--separator` / `--fill` / `--glass-*`）只为尚未迁移的旧组件样式保留，新代码不要使用。

## Typography

- **Sans:** Inter Variable；回退系统字体栈（`-apple-system`、`Segoe UI Variable`、`Microsoft YaHei`）。
- **Mono:** JetBrains Mono Variable；用于 eyebrow、区块索引、meta、标签、表单 label、页脚。
- **Display / Hero:** `clamp(46px, 6.6vw, 92px)` / 680 / `-0.045em`，中文标题第二行使用渐变文字。
- **Page title:** `clamp(38px, 5.2vw, 60px)` / 680 / `-0.035em`。
- **正文:** 15.5–16.5px / 1.75–1.85；正文颜色用 `--text-2`，标题用 `--text-1`。
- **Micro label:** 10–11px mono / `+0.14em ~ +0.22em` / uppercase。

## Layout

- **Container:** `1180px`，桌面左右 `32px`，移动端 `20px`。
- **Desktop nav:** 顶部 sticky `68px`，全宽背景模糊 + `1px` 分隔线；链接是 mono uppercase，激活态底部青色短线。
- **Mobile nav:** 隐藏 top nav，保留底部胶囊 Tabbar（首页/文章/摄影/树洞 + 更多 Sheet）。
- **Footer:** 顶部细线，三栏 mono 信息（版权 / 身份 / GitHub · Email）。
- **Section rhythm:** 区块之间 `56–64px`；首页 hero `padding-top: 104px`。

## Components（primitives）

`design-system.css` 中的基础件：`.btn`（primary/secondary/ghost）、`.chip` / `.chip-accent`、`.stat-pill`、`.ai-badge`、`.ios-input`、`.panel` 相关（`.glass-*` 已降级为平面 panel）、`.icon-btn`、`.page-title` / `.page-subtitle`、`.section-head`、`.back-link`、`.back-to-top`、`.modal-backdrop`、`.panel-header` / `.panel-title`。

## Style Layer Architecture

```text
apps/web/src/styles/
  design-system.css   # Tailwind 入口 + tokens + base + shell + primitives
  content.css         # 文章列表 / 文章正文 / 搜索 / 评论 / 音频 / Mermaid（+ legacy-content.css 迁移层）
  pages.css           # 首页 / 关于 / 摄影 / 后台 / 树洞 / 浮层（+ legacy-pages.css 迁移层）
```

- 新样式一律写入 `design-system.css` / `content.css` / `pages.css`，使用 token，不再引入新的一次性颜色。
- `legacy-*.css` 是迁移期的旧页面样式（chat / 相册 lightbox / 上传等），只允许收缩，不再新增。
- 旧 `globals.css`、`redesign.css` 与 `shared/theme`（外观模式、玻璃强度、壁纸）已移除。

## Page Status

| 页面 / 组件 | 状态 |
| --- | --- |
| 首页 | ✅ AI PM hero / meta strip / 精选文章 / 能力矩阵 / Now strip |
| 文章列表 / 详情 / 搜索 | ✅ 新卡片、mono meta、深色正文与代码块 |
| 关于 | ✅ AI PM 叙事 + 经历/学习/教育样式 |
| 摄影 & 后台 & 登录 | ✅ 深色画廊、Instagram 式弹窗、上传面板、后台列表、登录卡片 |
| 树洞 | ✅ 深色聊天布局、顶栏标题、气泡、菜单与输入面板 |
| 音频播放器 / Mermaid | ✅ 平面控件、深色图表与缩放浮层 |
| 移动端 | ✅ 底栏导航、更多 Sheet、单列卡片、移动端整页详情 |

已验证：管理员登录 → 上传（多图/单图）→ 画廊 → 弹窗 → 删除的完整链路；评论区、搜索、Mermaid 缩放、移动端布局；全站 Playwright 巡检无 console/page error。

## Decisions Log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-10-17 | 以 AI Native 深色视觉取代 Liquid Glass | 用户明确不满意原视觉，转向 AI 产品经理定位 |
| 2026-10-17 | 站点只保留深色主题 | 用户明确「不需要浅色」；移除外观面板与玻璃强度设置 |
| 2026-10-17 | 设计系统重构为 styles/ 分层 | 原 3000 行 globals.css 职责混杂；token/primitives 与页面样式解耦 |
| 2026-10-17 | 完成相册 / 上传 / 树洞 / 音频 / Mermaid 的视觉迁移 | 全站页面不再依赖 Liquid Glass 旧视觉；legacy 层只保留结构样式 |
| 2026-10-17 | `legacy-*.css` 迁移层 | 相册 lightbox、chat、上传等复杂控件先保留旧样式，按页面逐步重写 |

## Reference

- 视觉方向概念稿：`.tools/browser/concept-shots/a-ai-native.png`
- 旧设计系统：`docs/adr/0005-liquid-glass-design-system.md`（已被 ADR-0012 取代）
