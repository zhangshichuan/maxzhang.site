# Design System — Max Zhang · 摄影模块

## Product Context

- **What this is:** 个人站（TanStack Start）中的摄影画廊模块：自选作品展示、弹窗沉浸观看、Letters 留言、管理端上传/删除。
- **Who it's for:** 作者本人维护，访客浏览；中英双语（`/photos` 与 `/zh/photos`）。
- **Space/industry:** 个人策展画廊。视觉参照 Instagram 的网格节奏与 Apple iOS Liquid Glass 的质感。
- **Project type:** 内容型个人站的功能模块（列表 + 弹窗查看 + 上传管理）。

## Aesthetic Direction

- **Direction:** Liquid Gallery —— 网格纪律 + 玻璃配角
- **Decoration level:** minimal。照片承载全部视觉重量；玻璃只属于导航、按钮、浮层这些「工具」。
- **Mood:** 照片是唯一主角，界面退到幕后。像翻一个安静、整齐、无噪音的相册：Instagram 的「那味儿」来自统一网格节奏和界面隐身，iOS 的高级感来自克制排版、玻璃工具层与流畅动效。
- **核心原则：照片不穿玻璃。** 网格中的照片直接坐在底色上，无圆角卡片、无投影、无边框；hover 才出现信息层。

## Interaction Model（本次核心决策）

- **列表即入口，弹窗即详情。** 点击 tile 打开沉浸弹窗，不离开列表页，浏览循环是「扫一眼 → 点开看 → 回来继续扫」。
- **深链：** 弹窗打开时地址栏写 `#photo/<slug>`，可分享；浏览器后退键关闭弹窗；`hashchange` 与弹窗状态同步。
- **桌面弹窗：** 左图右栏（`minmax(0,1fr) + 360px`）。图区使用主题背景（浅色白 / 深色近黑），图片 `object-fit: contain`，最高约 70vh；右栏放标题、日期/地点/标签、可折叠 EXIF、评论与输入框。
- **移动端弹窗：** 小红书式整页滚动详情 —— 全屏 `100dvh` 无圆角，图片在上（全宽、限高 65dvh、`object-fit: cover`、可滑动切换，超长图默认裁切显示，点「查看原图」展开完整图、再点收起），内容区在下随页面滚动；关闭按钮悬浮在照片右上角。
- **键盘与触控：** ESC 关闭，← → 切换；触屏左右滑动切换。
- **兼容：** 原 `/photos/:slug` 路由保留为 302 重定向到 `/photos#photo/<slug>`，避免外链失效；SEO/分享链接不破坏。

## Gallery Grid（列表）

- 桌面 3 列；缝隙 2–3px（发丝级）；tile 固定 4:5 比例，`object-fit: cover`。
- 无圆角、无阴影、无卡片背景；hover 时照片轻微放大（scale 1.035）+ 底部渐变露出标题与张数。
- 张数徽标（≥2 张时）：右上角磨砂小胶囊，白字 11px。
- **移动端：小红书式瀑布流。** 2 列 CSS columns（缝隙 8px），卡片圆角 14px、浅色底、细边框；图片保持自然比例（不做裁切）；卡片下方是两行截断的标题，再往下是作者头像（M）+ 作者名 + 评论数。
- 列表头部沿用全站 glass header 与 `page-title`；上传入口只在 `/admin` 管理后台，摄影页不出现。

## Upload（上传）

- 面板形态：桌面右上浮层（380px）/ 移动端底部 sheet（全宽）。
- Dropzone 支持点击与拖拽，选中后立即渲染缩略图网格（最多 10 张）。
- 每张缩略图可单独移除；封面可指定（对应 `coverIndex`），封面标记为小胶囊「封面」。
- 字段：中文标题（必填）、英文标题、地点（GPS 自动回填、可手改）、标签（逗号分隔）。
- 发布成功后跳转列表并直接打开新作品弹窗（`#photo/<slug>`）。

## Admin & Login（管理）

- 管理后台：图片优先列表 —— 56px 缩略图 + 标题 + 日期/张数；hover 才露出删除按钮，删除需确认。
- 登录页：居中玻璃卡片（沿用现有），保持 iOS 输入框规范与口令锁定态。

## Typography

- 沿用全站系统字体栈：`-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI Variable', ...`（与 `globals.css` 的 `--font-sans` 一致）。
- **Display/Hero：** 40–68px / 800 / `-0.035em`（`clamp(40px, 7vw, 68px)`）
- **弹窗标题（caption）：** 22px / 700 / `-0.025em`
- **区块标题：** 24px / 700 / `-0.02em`
- **正文：** 16px / 400 / 1.55 行高，次级文字用 `--label-secondary`
- **Micro label（eyebrow、EXIF、表单项标签）：** 11px / 600 / `+0.12em` / uppercase
- **数据（EXIF、计数）：** 系统字体 + `font-variant-numeric: tabular-nums`

## Color

- **Approach:** restrained。颜色只做激活态与语义提示，照片本身是色彩来源。
- **Surface：** 浅色 `#FAFAFA` / 深色 `#0A0A0C`（列表底色，替换默认 `--bg`）
- **Viewer：** 弹窗观片区跟随系统深浅色（浅色用 `--bg`，深色用近黑 `--bg`），不再固定深色
- **Accent：** 浅色 `#0066CC` / 深色 `#0A84FF`，仅用于激活态、链接、主按钮
- **Labels / Hairs：** 沿用现有 `--label`、`--label-secondary`、`--label-tertiary`、`--separator`；tile 缝隙用 0.5px hairline
- **Semantic：** success `#34C759` / error `#FF3B30` / warning `#FF9500`
- **深浅模式策略：** 整个摄影模块（网格、卡片、弹窗、评论区）全部跟随系统深浅色；图片上方的悬浮控件（导航、计数器、关闭）保持磨砂深色以适配任意照片

## Spacing

- **Base unit:** 8px
- **Density:** 紧凑（网格）＋ 宽敞（详情/表单留白）
- **Scale:** 2(2) 4(4) 8(8) 12(12) 16(16) 24(24) 32(32) 48(48)
- 网格缝隙 2–3px；页面横向留白 24px（移动端 18px）；tile 信息层内边距 14px

## Layout

- **Approach:** grid-disciplined
- **容器：** 沿用全站 1080px max-width + 24px padding
- **列表：** 3 列（≥1024px）/ 2 列（<1024px），tile 4:5
- **弹窗：** 桌面 `min(1000px, 100vw − 48px) × min(720px, 100vh − 56px)`；移动端全屏
- **Border radius：** 弹窗 22px / 上传面板 24px / 输入框 12px / 胶囊 999px；**tile 无圆角**

## Motion

- **Approach:** intentional
- **Easing:** enter `cubic-bezier(0.22, 1.35, 0.36, 1)`；exit `ease`；move `ease-in-out`
- **弹窗：** 打开 0.34s `scale 0.96 → 1` + opacity；关闭 0.26s
- **图片切换：** 0.35s crossfade
- **Tile hover：** 信息层 0.22s 淡入，照片 0.45s 轻微放大
- **页面 reveal：** 0.7s ease-out，translateY(18px)

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-11 | 详情页改为弹窗（`#photo/<slug>` 深链） | Instagram 式浏览零跳转；后退键、分享、SEO 链接都不丢 |
| 2026-08-11 | Tile 固定 4:5 cover 裁切 | 网格节奏优先；详情看全图，管理端可指定封面 |
| 2026-08-11 | 照片脱离玻璃卡片 | 照片直接坐底色，玻璃只留工具层，避免「卡片感」稀释作品 |
| 2026-08-11 | 移动端改为小红书式瀑布流卡片 + 整页滚动详情 | 移动端手感优先：自然比例瀑布流、圆角卡片、浅色内容区；桌面端保持 Instagram 式纪律网格 |
| 2026-08-11 | 「读者来信」统一改为「评论」 | 命名统一，降低理解成本；英文同步改为 Comments |
| 2026-08-11 | 弹窗观片区跟随系统深浅色 | 用户要求整个摄影模块与站点深浅色模式一致，取代原先「始终近黑」的决定 |
| 2026-08-11 | 移动端超长图默认限高 65dvh 裁切显示 | 避免整页出现恐怖级长图；「查看原图」按钮可临时展开完整图 |
| 2026-08-11 | iOS 27 质感审计与修复 | 折叠菜单/浮层补齐 Liquid Glass（88% 玻璃 + 42px 模糊 + 高光 + 半透明内层）；弹窗关闭钮移到视口右上（照片外，Instagram 式）；照片上的悬浮控件统一玻璃配方；评论与摄影图标描边统一 1.75（SF 风格） |

## Reference

- 交互预览：`/tmp/design-consultation-preview-1786451468/index.html`（已归档到 gstack designs 目录）
- 现状实现：`apps/web/src/features/photos/`、`apps/web/src/globals.css`（十八·五 摄影模块）
