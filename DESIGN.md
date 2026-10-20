# Design System — Max Zhang

> Current theme: **Flow Field · Dark**（2026-10-20 起，固定深色，无浅色模式/无主题切换）。
> 历史：MZ/OS 工作台（ADR-0013）→ Flow Field 浅色纸面（ADR-0014）→ 固定深色。

## Product Context

- **What this is:** Max Zhang 的个人网站（TanStack Start 单体应用）：概览 / 写作 / 摄影 / 树洞 / 关于，中英双语。
- **Who it's for:** 招聘方、AI 产品同行、产品写作读者。
- **Brand position:** 「把模型能力，翻译成人们愿意用的产品。」AI 产品经理 + 十年全栈工程。
- **Project type:** 内容型个人站；设计本身要像一件产品，但正文必须可读。

## Aesthetic Direction — Flow Field / Dark

- **Direction:** 暖黑纸面上的粒子流场。粒子像被风推着走，光标是风源，滚动是风，章节切换是冲击波；粒子只做氛围与转场。
- **Decoration level:** 低饱和度、高留白。1px 细线、mono 小标签、深色 sheet 面板；没有卡片阴影、没有渐变玻璃。
- **Mood:** 冷静、克制、暗房编辑感。像一张会呼吸的黑纸。
- **核心原则：正文永远压在粒子之上。** 粒子进入 HTML 面板视野时被压暗；文字是真实 HTML，不进入 canvas。
- **单色系克制：** 暖黑 + 暖白 + 一点朱红；红色只用于状态、序号、箭头与冲击波提示。
- **固定深色：** 不提供浅色主题、不跟随系统、不写 theme toggle；`color-scheme: dark`。

## Design Tokens

唯一来源：`apps/web/src/styles/flow.css`（在 `design-system.css` 之后加载，覆盖旧 token）。

| 类别 | Token | 值 |
| --- | --- | --- |
| Surface | `--paper` / `--paper-deep` / `--panel` | `#0b0a08` / `#17130f` / `#12100d` |
| Sheet | `--sheet`（页面级） | `#14110d` |
| Text | `--ink` / `--ink-70` / `--ink-55` / `--ink-40` | `#ece7dc` / 70% / 55% / 40% |
| Line | `--line` / `--line-strong` | `rgba(236,231,220,.14)` / `rgba(236,231,220,.28)` |
| Accent | `--red` | `#ff4b2f`（状态、序号、箭头、冲击波） |
| Type (Latin) | Inter Variable | 正文 15–17px；标题 800–900、紧字距 |
| Type (Mono) | JetBrains Mono | 9–10px 大写标签、编号、元信息 |
| Type (CJK) | 系统中文（PingFang / Microsoft YaHei） | 跟随 Inter 字号阶梯 |
| Radius | 2px | 面板与按钮直角，接近纸张裁切 |
| Motion | `cubic-bezier(.16,1,.3,1)` | 章节冲击波、标题遮罩、+80% 聚形 |

## Layout

- **首页：** 全宽 hero（巨型紧字距标题 + 流场）→ 数字 sheet（10+ / 0→1 / +80%，+80% 由粒子聚形）→ 案例 sheet → 三条判断 → 四步方法 → 写作 → 关于 → 联系（句号粒子收束）。
- **内页：** 1280px 内容列；写作列表与文章页 760px 可读正文；关于页巨型标题 + 彩色 4:5 头像 + facts/experience sheet。
- **摄影：** 暗房档案式索引（masthead + facts + 图版 grid + portal lightbox + 上传 sheet）。
- **搜索 / 树洞 / 后台：** 同一套深色 paper/sheet 语言；搜索为索引式结果行，树洞为固定 880px 会话面板 + 底部输入区，后台为深色档案卡与照片索引表。
- **导航：** 固定深色条，下滑隐藏、上滑出现；首页锚点 `data-jump` 带冲击波 + 遮罩转场。
- **页脚：** STATUS / BASE / tagline / 版权，外加低频入口（GitHub、Email、摄影、搜索、树洞）。

## Motion

- 单张 fixed Canvas 2D 流场：桌面 2200 / 移动 950 颗粒子，DPR ≤ 2；curl-noise 势场、寿命与重生、墨迹拖尾（暖白粒子 + 朱红点缀）。
- 光标 170px 涡流；滚动注入垂直风；章节进入触发径向冲击波。
- `+80%` 由离屏文字采样聚形；联系页句号由粒子收束成光点。
- 降级：`prefers-reduced-motion` 与 `?static=1` 渲染静态墨迹海报；`document.hidden` 暂停 rAF；Canvas 2D 不可用时退化为纯 HTML。

## Pages

- `/`、`/zh`：流场首页。
- `/posts`、`/posts/$slug`：深色写作索引 + 760px 阅读版式；不使用粒子。
- `/about`：深色个人档案 + 静态风场线插画 + 彩色头像。
- `/photos`、`/search`、`/chat`、`/admin`、`/login`：深色重做；功能与接口不变。
- 404：深色 `404` + 明确回退。

## Editing Rules

1. 正文可读性优先于粒子效果；任何章节进入时，粒子必须让位。
2. 不引入紫色渐变、玻璃拟态、霓虹、卡片阴影；朱红只做点缀。
3. 固定深色，不新增 light-mode 分支或主题切换。
4. 中文标题用系统黑体 + 紧字距；英文标题用 Inter 800/900；不要衬线混搭。
5. 任何动效都要有 `prefers-reduced-motion` 与静态 fallback。
