# Design System — Max Zhang

## Product Context

- **What this is:** Max Zhang 的个人网站（TanStack Start 单体应用）：概览 / 写作 / 摄影 / 树洞 / 关于，中英双语。
- **Who it's for:** 招聘方、AI 产品同行、产品写作读者。
- **Brand position:** 「把模型能力，翻译成人们愿意用的产品」——AI 产品经理 + 十年全栈工程。
- **Project type:** 内容型个人站，设计本身要像一件产品。

## Aesthetic Direction — MZ/OS（2026-10-18 起）

- **Direction:** 工作台 / 控制台。网站不是一页页作品集，而是一个可操作的 AI 产品界面：系统栏、文件式导航、面板、状态行、终端。
- **Decoration level:** 极低。没有渐变、没有玻璃、没有大图；只有 1px 线、mono 标签、荧光绿状态色。
- **Mood:** 安静、精确、工程师式的克制；记忆点来自结构而不是特效。
- **核心原则：界面退后，判断在前。** 每个面板只承担一件事：KPI、案例、方法、写作、联系。
- **Dark only:** 站点只有深色主题，不提供浅色或跟随系统切换（`html.dark` 固定）。

## Design Tokens

唯一来源：`apps/web/src/styles/design-system.css`；页面级新样式在 `styles/os.css`。

| 类别     | Token                                         | 值                                                        |
| -------- | --------------------------------------------- | --------------------------------------------------------- |
| Surface  | `--surface-0` / `--surface-1` / `--surface-2` | `#050708` / `#0a0d10` / `#0d1115`                         |
| Text     | `--text-1` / `--text-2` / `--text-3`          | `#d6dfe4` / `#94a6ae` / `rgba(148,166,174,.5)`            |
| Border   | `--border-1` / `--border-2`                   | `#182126` / `#27343c`                                     |
| Brand    | `--accent`                                    | `#8bffb0`（荧光绿，状态与数字）                           |
| Support  | `--amber` / `--red`                           | `#ffb86b` / `#ff6b6b`                                     |
| Gradient | `--gradient-text`                             | `linear-gradient(100deg,#d6dfe4,#8bffb0)`（仅标题第二行） |
| Buttons  | `--gradient-button` / `--gradient-button-fg`  | `#8bffb0` / `#04110a`                                     |
| Radius   | `--radius-xs/sm/md/lg`                        | `2 / 2 / 4 / 6px`（控制台式直角）                         |
| Motion   | `--ease-out`                                  | `cubic-bezier(.22,1,.36,1)`                               |
| Code     | `--code-bg`                                   | `#070a0c`                                                 |

兼容别名（`--bg` / `--label` / `--separator` / `--fill`）只服务尚未迁移的旧控件；新代码用语义 token。

## Typography

- **Sans:** Inter Variable；回退系统字体栈（中文用 Microsoft YaHei）。
- **Mono:** JetBrains Mono Variable；系统栏、路径、面板头、元信息、标签、页脚、终端一律 mono。
- **Hero:** `clamp(40px, 5.6vw, 76px)` / 630 / `-0.045em`，第二行荧光绿。
- **Page title:** `clamp(34px, 4.4vw, 54px)` / 620 / `-0.04em`。
- **正文:** 14–15px / 1.75–1.9；正文用 `--text-2`，标题用 `--text-1`。
- **Micro label:** 8–10px mono / `+0.1em ~ +0.18em` / uppercase。

## Layout & Shell

- **Container:** `1440px`；桌面左右 `28px`，移动端 `20px`。
- **System bar:** sticky `46px`，`MZ/OS` + 当前路径（`~/overview` 等）+ 三个主导航 + 搜索/更多/语言；移动端只留品牌与图标。
- **Mobile dock:** 固定底部，概览 / 写作 / 关于 / 更多；低圆角、1px 边框。
- **Footer:** 状态行：品牌 / 状态 / 地点 / tagline / GitHub · Email；移动端折成多行。
- **Page rhythm:** 首屏上下 `30–40px`；面板之间 `16px`；无大留白。
- **Responsive:** ≤1100 隐藏 tagline；≤900 面板改单列、方法论 2×2；≤767 单列、KPI 三列压缩、页面底部留出 dock 空间。

## Components

- 面板：`.os-panel` + `.os-panel-head`（mono label / meta）。
- 数据：`.os-kpis` / `.os-kpi`、`.os-case-rows`、`.os-props`、`.os-timeline`。
- 方法：`.os-pipe` / `.os-pipe-step`。
- 终端：`.os-term-log` / `.os-term-form` / `.os-ps1`（首页交互彩蛋）。
- 写作：`.posts-series`、`.post-card` 文件行、`.sidebar-panel`。
- 文章：`.article-panel` / `.article-prose`（正文限宽 780px）。
- 关于：`.os-about-head` / `.os-about-grid` / `.os-about-avatar`。
- 404：`.os-404` / `command not found`。

## Style Layer Architecture

```text
apps/web/src/styles/
  design-system.css   # Tailwind 入口 + tokens + base + shell + primitives
  content.css         # 文章列表 / 文章正文 / 搜索 / 评论 / 音频 / Mermaid（+ legacy-content.css）
  pages.css           # 旧首页 / 关于 / 摄影 / 后台 / 树洞 / 浮层（+ legacy-pages.css）
  os.css              # MZ/OS：系统栏细节、首页、写作、文章、关于、404、控件修正
```

- 新页面与壳层样式写进 `os.css`；token 与新基础件更新在 `design-system.css`。
- `legacy-*` 仍是迁移层，只允许收缩；摄影/树洞/后台等控件依靠 token 继承新皮肤。
- 首页/关于已删除旧的 `nx-*` 结构，`os-*` 是唯一新页面语法。

## Page Status

| 页面 / 组件               | 状态                                                          |
| ------------------------- | ------------------------------------------------------------- |
| 概览                      | ✅ Hero + 3 KPI + 案例 + 三条判断 + 方法 + 写作 + 终端 + 联系 |
| 写作列表                  | ✅ 写作计划 + 文件式文章行 + 分类/标签面板                    |
| 文章详情                  | ✅ 路径 kicker + mono meta + 限宽正文 + 播放器/评论保留       |
| 关于                      | ✅ 自述 + 灰度头像 + INFO + 经历 + 联系                       |
| 摄影 / 搜索 / 树洞 / 后台 | ✅ 保留功能，使用新 token 着色                                |
| 404                       | ✅ `command not found` 终端语义                               |
| 移动端                    | ✅ 系统栏 + Dock + 单列面板                                   |

已验证：`tsc`、vitest 44/44、`pnpm build` 48 页预渲染；桌面 1440 / 移动 390 无横向溢出；Playwright 巡检无 console/page error。

## Decisions Log

| Date       | Decision                                    | Rationale                                                        |
| ---------- | ------------------------------------------- | ---------------------------------------------------------------- |
| 2026-10-17 | 以 AI Native 深色视觉取代 Liquid Glass      | 用户明确不满意原视觉，转向 AI 产品经理定位                       |
| 2026-10-17 | 站点只保留深色主题                          | 用户明确「不需要浅色」；移除外观面板与玻璃强度设置               |
| 2026-10-17 | 设计系统重构为 styles/ 分层                 | 原 3000 行 globals.css 职责混杂；token/primitives 与页面样式解耦 |
| 2026-10-18 | 选择 MZ/OS 工作台方向（设计探索 C）         | 用户要求「脱离常规」；工作台/控制台最能体现工程 + 产品双重身份   |
| 2026-10-18 | 导航 5→3，首页收敛为 7 个区块，新增终端彩蛋 | 按「乔布斯式」聚焦原则重写静态内容体系；课程内容改为系列文章     |

## Reference

- 设计探索：`design-exploration/DESIGN_EXPLORATION.md`
- 静态内容体系：`docs/copy/COPY_DECK.md`
- 旧设计系统：`docs/adr/0005-liquid-glass-design-system.md`（已被 ADR-0012 取代）
