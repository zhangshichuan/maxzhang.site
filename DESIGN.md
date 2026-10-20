# Design System — Max Zhang

> Current theme: **Flow Field**（2026-10-20 起）。上一版 MZ/OS 见 `docs/adr/0013`，已被 `docs/adr/0014` 取代。

## Product Context

- **What this is:** Max Zhang 的个人网站（TanStack Start 单体应用）：概览 / 写作 / 摄影 / 树洞 / 关于，中英双语。
- **Who it's for:** 招聘方、AI 产品同行、产品写作读者。
- **Brand position:** 「把模型能力，翻译成人们愿意用的产品。」AI 产品经理 + 十年全栈工程。
- **Project type:** 内容型个人站；设计本身要像一件产品，但正文必须可读。

## Aesthetic Direction — Flow Field

- **Direction:** 暖纸上的墨点流场。粒子像被风推着走，光标是风源，滚动是风，章节切换是冲击波；粒子只做氛围与转场。
- **Decoration level:** 低饱和度、高留白。1px 细线、mono 小标签、纸色 sheet 面板；没有卡片阴影、没有渐变玻璃。
- **Mood:** 冷静、手作、编辑感。像一张会呼吸的纸，而不是一个 AI 仪表盘。
- **核心原则：正文永远压在粒子之上。** 粒子进入 HTML 面板视野时被压暗；文字是真实 HTML，不进入 canvas。
- **单色系克制：** 暖纸 + 墨 + 一点朱红；红色只用于状态、序号、箭头与冲击波提示。

## Design Tokens

唯一来源：`apps/web/src/styles/flow.css`（在 `design-system.css` 之后加载，覆盖旧 token）。

| 类别 | Token | 值 |
| --- | --- | --- |
| Surface | `--paper` / `--paper-deep` | `#f2eee6` / `#e8e2d5` |
| Ink | `--ink` / `--ink-70` / `--ink-55` / `--ink-40` | `#141414` / 70% / 55% / 40% |
| Line | `--line` / `--line-strong` | `rgba(20,20,20,.14)` / `rgba(20,20,20,.28)` |
| Accent | `--red` | `#d33a1e`（状态、序号、箭头、冲击波） |
| Panel | `--panel` | `rgba(242,238,230,.94)` |
| Type (Latin) | Inter Variable | 正文 15–17px；标题 800–900、紧字距 |
| Type (Mono) | JetBrains Mono | 9–10px 大写标签、编号、元信息 |
| Type (CJK) | 系统中文（PingFang / Microsoft YaHei） | 跟随 Inter 字号阶梯 |
| Radius | 2px | 面板与按钮直角，接近纸张裁切 |
| Motion | `cubic-bezier(.16,1,.3,1)` | 章节冲击波、标题遮罩、+80% 聚形 |

## Layout

- **首页：** 全宽 hero（巨型紧字距标题 + 流场）→ 数字 sheet（10+ / 0→1 / +80%，+80% 由粒子聚形）→ 案例 sheet → 三条判断 → 四步方法 → 写作 → 关于 → 联系（句号粒子收束）。
- **内页：** 1280px 内容列；写作列表与文章页 760px 可读正文；关于页 186px 标题 + 4:5 黑白头像 + facts/experience sheet。
- **导航：** 固定纸面条，下滑隐藏、上滑出现；脚本 `data-jump` 锚点带冲击波 + 纸面遮罩转场。
- **页脚：** STATUS / BASE / 一句 tagline / 版权，外加低频入口（GitHub、Email、摄影、搜索、树洞）。

## Motion

- 单张 fixed Canvas 2D 流场：桌面 2200 / 移动 950 颗粒子，DPR ≤ 2；curl-noise 势场、寿命与重生、墨迹拖尾。
- 光标 170px 涡流；滚动注入垂直风；章节进入触发径向冲击波。
- `+80%` 由离屏文字采样聚形；联系页句号由粒子收束成墨点。
- 降级：`prefers-reduced-motion` 与 `?static=1` 渲染静态墨迹海报；`document.hidden` 暂停 rAF；Canvas 2D 不可用时退化为纯 HTML。

## Pages

- `/`、`/zh`：流场首页。
- `/posts`、`/posts/$slug`：纸面写作索引 + 760px 阅读版式；不使用粒子。
- `/about`：纸面个人档案 + 静态风场线插画。
- `/photos`、`/search`、`/chat`、后台：功能不变，纸面 token 换肤。
- 404：纸面 `404` + 明确回退。

## Editing Rules

1. 正文可读性优先于粒子效果；任何章节进入时，粒子必须让位。
2. 不引入紫色渐变、玻璃拟态、霓虹、卡片阴影；朱红只做点缀。
3. 首页每增加一个区块，先删掉一个旧区块。
4. 中文标题用系统黑体 + 紧字距；英文标题用 Inter 800/900；不要衬线混搭。
5. 任何动效都要有 `prefers-reduced-motion` 与静态 fallback。
