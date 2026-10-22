# Design System — Max Zhang

> Current theme: **Fashion Editorial · Dark**（2026-10 起，固定深色，无浅色模式/无主题切换）。
> 历史：MZ/OS → Flow Field（暗色）→ Kinetic Index（已回退）→ Fashion Editorial。

## Product Context

- **What this is:** Max Zhang 的个人网站（TanStack Start 单体应用）：概览 / 写作 / 摄影 / 树洞 / 关于 / 搜索 / 后台，中英双语。
- **Who it's for:** 招聘方、AI 产品同行、产品写作读者。
- **Brand position:** AI 产品经理。把模型能力，做成用户真正信任的产品。
- **Project type:** 设计师作品集式个人站；首页要像时装杂志内页，内页保持可读。

## Aesthetic Direction — Fashion Editorial

- **Direction:** 暖黑背景上的时装 editorial 版式：超大 Bodoni 刊头、整幅嵌入肖像、朱红细节、细线编号、页脚大字 marquee。
- **Decoration level:** 高留白、极细线、mono 小标签、红色错位边框；不用卡片阴影、玻璃拟态、紫色渐变。
- **Mood:** 克制、昂贵、像一本个人作品集而不是产品官网。
- **核心原则：人物与版式是主角。** 动效只做页面的开合、呼吸与位移；不抢文字。
- **固定深色：** 不提供浅色主题、不跟随系统、不写 theme toggle；`color-scheme: dark`。

## Design Tokens

唯一来源：`apps/web/src/styles/fashion.css`（在 `final.css` 之后加载，最后覆盖 token 与 shell）。

| 类别 | Token | 值 |
| --- | --- | --- |
| Surface | `--zx-bg` / `--zx-bg-2` / `--zx-bg-3` | `#0b0908` / `#12100d` / `#14110d` |
| Text | `--zx-ink` / `--zx-ink-70` / `--zx-ink-52` / `--zx-ink-34` | `#f3ede4` / 70% / 52% / 34% |
| Line | `--zx-line` / `--zx-line-soft` | `rgba(243,237,228,.18)` / `rgba(243,237,228,.09)` |
| Accent | `--zx-cobalt` / `--zx-cobalt-bright` | `#d2411f` / `#e05a36`（状态、编号、箭头、marquee 点缀） |
| Display | Bodoni Moda 400 / italic | 刊头 118–300px；标题 42–200px；紧字距 |
| Body | Inter Variable | 12.5–15px 辅助文案；正文 1.7 行高 |
| Mono | JetBrains Mono | 7.5–10px 大写标签、编号、元信息 |
| Radius | 0 | 所有边框、按钮、输入框直角 |
| Motion | `cubic-bezier(.16,1,.3,1)` | 标题遮罩、肖像揭示、rule 绘制、marquee |

## Layout

- **首页：** 全屏 hero（Bodoni 双行刊头 + 角色行 + 斜体主张 + 小幅嵌入肖像 + 数字）→ 01 Index → 02 Case → 03 Principles → 04 Method → 05 Writing → 06 Contact（bone 反白区块）；页脚大字 marquee + 联系索引。
- **内页：** 1760px（2K 下 2120px）内容列；写作/文章页 760–900px 可读正文；关于页巨型标题 + 彩色肖像 + facts/experience sheet。
- **摄影：** 暗房档案式索引（masthead + facts + 图版 grid + portal lightbox + 上传 sheet）。
- **搜索 / 树洞 / 后台：** 同一套 fashion token 重做；搜索为索引式结果行，树洞为固定会话面板 + 底部输入区，后台为档案卡与照片索引表。
- **导航：** 固定 74px（2K 84px）细线条，MZ® 刊头 + mono 索引 + 期号 + 语言。
- **页脚：** 大字斜体 marquee + 四列联系索引。

## Motion

- 首屏：标题逐行遮罩上滑；肖像底边揭示后缓慢浮动；朱红 rule 从左绘制；eyebrow / 角色 / 主张 / CTA / 数字分层淡入。
- 滚动：`IntersectionObserver` 触发 `[data-reveal]`；页脚 marquee 持续滚动。
- 页面切换：朱红 veil 遮罩；顶部进度线。
- 光标：细点 + 跟随圆环 + 链接标签；仅精确指针设备。
- 降级：`prefers-reduced-motion` 下所有位移/遮罩关闭，内容直接呈现。

## Pages

- `/`、`/zh`：Fashion Editorial 首页。
- `/posts`、`/posts/$slug`：写作索引 + 可读文章版式。
- `/about`：个人档案 + 彩色肖像 + facts/experience。
- `/photos`、`/search`、`/chat`、`/admin`、`/login`：统一重做；功能与接口不变。
- 404：深色 `404` + 明确回退。

## Editing Rules

1. 正文可读性优先于动效；动效不能阻塞导航、输入和阅读。
2. 不引入紫色渐变、玻璃拟态、霓虹、卡片阴影；朱红只做点缀。
3. 固定深色，不新增 light-mode 分支或主题切换。
4. 英文标题用 Bodoni Moda；中文标题跟随系统宋/黑体；正文用 Inter。
5. 任何动效都要有 `prefers-reduced-motion` 与静态 fallback。
