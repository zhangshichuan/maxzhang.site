# ADR-0012: 以 AI Native 深色设计系统取代 Liquid Glass

Status: superseded by ADR-0013

Date: 2026-10-17

## Context

原设计系统（ADR-0005）采用 Apple iOS 27 Liquid Glass 视觉：深浅色自适应、可调玻璃强度、背景壁纸与外观面板。用户决定将个人定位从 Fullstack Developer 转向 AI 产品经理，并明确表示对原网页视觉不满意，要求「全新的网页视觉」，且「不需要浅色」。

设计方向在 3 个概念稿（AI 原生深色 / 编辑杂志 / 瑞士网格）中选定 Direction A：AI 原生 · 深色科技感。

同时发现原 `globals.css` 约 3000 行，混合了设计令牌、全局组件与页面级样式，难以维护；视觉重做正好推动一次设计系统重构。

## Decision

1. **视觉语言替换为 AI Native（深色-only）**：`#06070a` 深色底、极光渐变 + 72px 细网格、靛蓝 `#8b9dff` 与薄荷青 `#5eead4` 强调色、mono 功能标签、平面 panel 卡片、内容优先。
2. **移除浅色体系**：删除深浅色切换、外观面板、玻璃强度滑块与 `shared/theme` 外观模块；`html` 固定 `dark`，`theme-color` 固定 `#06070a`。
3. **重构为分层设计系统**：
   - `styles/design-system.css`：Tailwind 入口、设计令牌、base、应用外壳（导航/页脚/容器）、primitives。
   - `styles/content.css`：文章列表、正文、搜索、评论、音频、Mermaid。
   - `styles/pages.css`：首页、关于、摄影/后台、树洞、浮层。
   - `styles/legacy-content.css` / `legacy-pages.css`：迁移期保留的旧页面样式，只减不增。
4. **页面按方向 A 做设计还原**：首页 AI PM 人设、meta strip、能力矩阵、Now strip；文章与关于同步新视觉；摄影/树洞/后台保留结构，逐步精修。
5. **内容定位**：站内身份从 Fullstack Developer 改为 AI Product Manager；首页、SEO title/description、页脚、关于页叙事同步更新。

## Considered Options

- **保留 Liquid Glass 只换配色**：改动最小，但无法达到用户想要的「全新视觉」，也解决不了 CSS 职责混杂问题。
- **编辑杂志 / 瑞士网格方向**：差异化更强，但与「AI 产品经理 + 工程底子」的定位匹配度不如深色科技感；概念稿阶段用户选择 A。
- **完整一次性重写所有页面控件样式**：最彻底，但相册 lightbox / 上传 / chat 等复杂控件回归风险高；采用 legacy 迁移层渐进替换。

## Consequences

- 站点不再支持浅色模式，`Appearance` 相关 i18n、组件、localStorage 偏好全部移除。
- 所有新样式必须使用 `styles/` 中的 token 与 primitives；`legacy-*.css` 为迁移债，后续按页面清空。
- 设计还原仍需继续：相册 lightbox、上传弹窗、树洞细节、Mermaid / 音频控件等仍使用迁移层样式。
- 设计系统文档：`DESIGN.md`；设计术语：`CONTEXT.md`。
