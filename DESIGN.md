# Design System: Max Zhang

> **Status:** Homepage migrated. `/` and `/zh` run Night Instrument with the Day/Night toggle; inner pages keep the Fashion Editorial shell until they are migrated.
>
> **Current direction:** Night Instrument (2026-11). Dark is the signature mode; light is a first-class mode, not an inversion.
>
> **Replaces:** Fashion Editorial, AI Native, Flow Field, MZ/OS, Kinetic Index, Liquid Glass.

---

## 1. Product Context

- **What this is:** Max Zhang 的个人网站，基于 TanStack Start 的单体应用。包含首页、写作、摄影、关于、搜索、树洞、后台与登录。
- **Who it is for:** 招聘方、AI 产品同行、产品写作读者、摄影与设计同行。
- **Brand position:** AI 产品经理。把模型能力，做成用户真正信任的产品。
- **Job of the homepage:** 30 秒内让人知道你是谁、做成过什么、怎么工作，并愿意继续读一篇文章或发一封邮件。
- **Content language:** 英文默认，中文在 `/zh`。两种语言共用同一套排版规则，中文不缩小字号来硬塞。

---

## 2. Design Direction

### One sentence

**A quiet instrument panel for a person who ships AI products.**

不是“AI 公司官网”，也不是“个人作品集模板”。它像一台被长期使用的仪器：有刻度、有状态、有数据，但不喧哗。人物和判断仍然是主角，界面只是把注意力引到正确的位置。

### Five principles

1. **Instrument, not dashboard.** 数据条、状态点和编号是叙事工具，不是装饰。每个数字都要能回答问题。
2. **Person before system.** 肖像、姓名、主张和判断优先于网格。系统感服务于人，不取代人。
3. **Hairlines, not cards.** 用 1px 线、留白和对比建立层级。不用阴影、玻璃、圆角来假装层级。
4. **Data as narrative.** 案例先讲约束和决策，再给 before/after。数字必须带上下文。
5. **Two lights, one instrument.** 深色和浅色是同一台仪器的两种照明，不是两套设计。所有 token、组件和状态必须成对定义。

### Non-negotiables

- 不用紫色、极光渐变、玻璃拟态、霓虹发光、扫描线、故障艺术。
- 不用 Bodoni、时装刊头、朱红细线、杂志期号。
- 不用卡片阴影、大圆角、悬浮玻璃工具栏。
- 不用假实时数据、假终端、假监控墙。
- 浅色模式不是简单反色：照片、图表、面板和状态色都要单独调。
- 任何动效都必须有 `prefers-reduced-motion` 降级。

---

## 3. Theme Model

### Modes

- `html[data-theme="dark"]`：默认，品牌签名模式。
- `html[data-theme="light"]`：完整支持的日常模式。
- 每个模式都设置对应的 `color-scheme`。
- 主题切换按钮放在页面右上角的 meta bar，标签在 `Day` 和 `Night` 之间切换，使用 `aria-pressed`。
- 选择写入 `localStorage`，键名 `mz-theme`。
- 首屏防闪烁：在 `<head>` 里用内联脚本在绘制前设置 `data-theme`。
- 首次访问默认深色。是否跟随系统 `prefers-color-scheme` 仍是一个开放决策，见第 11 节。

### Color roles

| Role       | Dark                    | Light                 | Use                                     |
| ---------- | ----------------------- | --------------------- | --------------------------------------- |
| Background | `#0a0e11`               | `#fafcfb`             | Page canvas                             |
| Panel      | `#10161b`               | `#ffffff`             | Case panel, personnel card, contact     |
| Panel 2    | `#0d1318`               | `#edf0ee`             | Rail, secondary surface                 |
| Ink        | `#e9e5dc`               | `#101613`             | Primary text                            |
| Muted      | `rgba(233,229,220,.52)` | `rgba(16,22,19,.58)`  | Body secondary, labels                  |
| Muted 2    | `rgba(233,229,220,.34)` | `rgba(16,22,19,.36)`  | Meta, disabled, notes                   |
| Line       | `rgba(233,229,220,.13)` | `rgba(16,22,19,.12)`  | Hairline borders                        |
| Line 2     | `rgba(233,229,220,.06)` | `rgba(16,22,19,.06)`  | Inner rules, tracks                     |
| Mint       | `#8fe3c0`               | `#0b7a63`             | Active, positive, links, primary action |
| Mint dim   | `rgba(143,227,192,.16)` | `rgba(11,122,99,.13)` | Pulse halo, fills                       |
| Amber      | `#ffb35c`               | `#8a5a00`             | Cost, attention, caution                |
| Amber dim  | `rgba(255,179,92,.14)`  | `rgba(138,90,0,.12)`  | Amber fills                             |
| Red        | `#ff6b5a`               | `#b42318`             | Errors only                             |

Rules:

- Mint is the only primary accent. Amber is reserved for cost or attention. Red is for errors, never decoration.
- Text on mint-filled buttons uses the page background color. In light mode, that is `#f9fbfa`, not pure white.
- Portraits and photography stay in color. Do not force grayscale. Light mode may lift brightness slightly; never invert.
- Light mode uses a neutral white canvas and cool gray panels. Do not use warm cream, beige, or terracotta as the base; that reads as Claude-style editorial, not an instrument.
- Charts, bars and track fills must use the same role tokens, not one-off colors.

### Tokens

All production tokens use the `--ni-` prefix to avoid colliding with the old theme during migration:

```css
:root {
  --ni-bg: #0a0e11;
  --ni-panel: #10161b;
  --ni-panel-2: #0d1318;
  --ni-ink: #e9e5dc;
  --ni-muted: rgba(233, 229, 220, 0.52);
  --ni-muted-2: rgba(233, 229, 220, 0.34);
  --ni-line: rgba(233, 229, 220, 0.13);
  --ni-line-2: rgba(233, 229, 220, 0.06);
  --ni-mint: #8fe3c0;
  --ni-mint-dim: rgba(143, 227, 192, 0.16);
  --ni-amber: #ffb35c;
  --ni-amber-dim: rgba(255, 179, 92, 0.14);
  --ni-red: #ff6b5a;
}

html[data-theme='light'] {
  --ni-bg: #fafcfb;
  --ni-panel: #ffffff;
  --ni-panel-2: #edf0ee;
  --ni-ink: #101613;
  --ni-muted: rgba(16, 22, 19, 0.58);
  --ni-muted-2: rgba(16, 22, 19, 0.36);
  --ni-line: rgba(16, 22, 19, 0.12);
  --ni-line-2: rgba(16, 22, 19, 0.06);
  --ni-mint: #0b7a63;
  --ni-mint-dim: rgba(11, 122, 99, 0.13);
  --ni-amber: #8a5a00;
  --ni-amber-dim: rgba(138, 90, 0, 0.12);
  --ni-red: #b42318;
}
```

---

## 4. Typography

### Families

- **Latin body and display:** Inter Variable, already self-hosted via `@fontsource-variable/inter`.
- **Labels and data:** JetBrains Mono Variable, already self-hosted via `@fontsource-variable/jetbrains-mono`.
- **Chinese:** Noto Sans SC or the system CJK fallback (`WenQuanYi Zen Hei`, `PingFang SC`, `Microsoft YaHei`). Do not shrink Chinese to fit an English line.
- **No serif display faces.** No Bodoni, Didot, or fashion mastheads.

### Scale

| Role          | Size                       | Weight | Line height | Tracking            |
| ------------- | -------------------------- | ------ | ----------- | ------------------- |
| Hero h1       | `clamp(48px, 6vw, 78px)`   | 480    | 1.01        | `-0.055em`          |
| Section h2    | `clamp(22px, 2.3vw, 29px)` | 470    | 1.1         | `-0.035em`          |
| Case title    | `clamp(34px, 3.8vw, 50px)` | 450    | 1.02        | `-0.055em`          |
| Contact title | `clamp(34px, 4vw, 54px)`   | 440    | 1           | `-0.055em`          |
| Body          | `15.5px`                   | 400    | 1.65        | `0`                 |
| Small body    | `12.5–13px`                | 400    | 1.55        | `0`                 |
| Mono label    | `9–10px`                   | 400    | 1.5         | `0.12em`, uppercase |
| Metric value  | `clamp(34px, 3.3vw, 50px)` | 430    | 1           | `-0.06em`           |

Rules:

- Numbers use `font-variant-numeric: tabular-nums`.
- Mono labels never go below 9px. If a label cannot fit, shorten the copy, don't shrink the type.
- Body line length: 45–55 characters. Headline line length: 10–13 characters.
- Chinese text uses normal tracking, not the wide mono tracking.
- Links use mint and an underline or persistent bottom border. Hover never removes the affordance.

---

## 5. Layout

### Shell

- Page max width: 1440px.
- Content inner max width: 1160px.
- Desktop rail: 216px, fixed to the viewport, full viewport height.
- Gutters: `clamp(22px, 4vw, 58px)`.
- Grid: 12 columns on desktop, gap 24–44px.
- Breakpoints: `1120px` (rail collapses), `900px` (hero and case stack), `700px` (single column, compact meta).

### Homepage rhythm

1. Rail: brand, vertical nav, availability, locale, issue number.
2. Meta row: portfolio path, system status, Day/Night toggle.
3. Hero: 7/4 grid, h1, Chinese line, lede, actions, personnel card.
4. Metrics: four instrument panels with values and 2px bars.
5. Selected signal: case narrative + panel with before/after bars and workflow.
6. Operating principles: three rows, amber index.
7. Method: four steps on a shared line.
8. Writing: four-column rows, category and date.
9. Contact: bordered panel with a 3px mint left edge.
10. Footer: mono meta, muted, 1px top border.

### Surfaces

- Radius: `0` everywhere.
- Borders: `1px` hairlines. The contact panel and rail may use a `3px` mint edge.
- Shadows: none. Depth comes from contrast and spacing.
- Background: page-level 72px grid lines at very low opacity in dark mode. Light mode uses a clean, grid-free canvas.
- Rail on mobile: becomes a top bar; hide vertical nav, keep brand and theme toggle in the meta row.

---

## 6. Components

### Rail nav

- Index number + label, mono.
- 1px top border per item, 1px bottom border on the group.
- Hover: mint text. Active: mint text plus a 2px mint left marker.
- Mobile: hidden, replaced by the top bar and a "More" sheet.

### Theme toggle

- Small bordered control in the meta row.
- Dot uses mint. Label is `Day` in dark mode and `Night` in light mode.
- `aria-pressed` reflects light mode.
- Persists to `localStorage`; no layout shift on toggle.
- Keyboard focus: 2px mint outline with 2px offset.

### Personnel card

- Panel surface, 1px border, no shadow.
- Image aspect ratio `4 / 4.5`, full color. Do not desaturate portraits.
- Top row: live indicator, "Fig. 01".
- Caption: name, role, location, availability tag.
- On mobile, card goes full width below the hero copy.

### Metric instrument

- Four columns on desktop, two at 900px, one at 700px.
- Label row: name + index (mono).
- Value: large, tabular.
- Track: 2px line; fill uses mint, or amber for cost/attention.
- Note: 7.5–9px mono, muted 2. Never use a metric without a note.

### Section header

- Index in mint, title in ink, action link on the right.
- Bottom hairline. On mobile, stack the link below the title.

### Case panel

- Panel surface, 1px border.
- Header row: case number and year.
- Bar rows: label, value, 5px track.
- Workflow: four nodes with mint dots and a shared top line.
- No screenshots required; the diagram is the evidence.
- Results: before/after with amber for cost and mint for improvement.

### Principles

- Three rows or three columns depending on width.
- Amber index, title 19–24px, body 13px.
- Top hairline per row. No cards, no icons.

### Method

- Four steps across one line on desktop.
- Mint dot on the line, index, title, body.
- On mobile, stack with a vertical line.

### Writing row

- Index, title, category, date, arrow.
- Hover: mint title and 8px left shift.
- On mobile, hide category/date and keep title + arrow.

### Contact

- Panel surface with a 3px mint left border.
- Title, email, status line.
- Email is a real `mailto:` link, not a button.

### Footer

- Mono, muted, 1px top border.
- Brand, navigation, social, copyright.
- No oversized marquee.

---

## 7. Page Templates

### Homepage `/` and `/zh`

The approved prototype. Dark and light modes. This is the first implementation target.

### Writing `/posts`, `/posts/$slug`

- Keep the rail on desktop; article column max 720px.
- Article header: title, date, category, reading time.
- Body: 16px, line-height 1.7, max 68ch.
- Code blocks: panel surface, 1px border, no rounded corners, Shiki dark theme in dark mode and a light theme token set in light mode.
- Comments and view counts keep their current behavior; only the visual layer changes.

### Photography `/photos`

- Contact-sheet index: 3 columns desktop, 2 tablet, 1 mobile.
- Image frames: 1px border, no shadow, mono captions.
- Lightbox: panel background, mint close control, keyboard navigation.
- Upload sheet: same tokens, not a separate admin style.

### About `/about`

- Personnel file layout: portrait, facts, experience, principles.
- Portrait stays in full color in both modes.
- Facts use a two-column definition list; no cards.

### Search `/search`

- Command-palette style panel with a large input.
- Focus ring mint. Results are rows with title, category, date.
- Empty state: one sentence and a link back to writing.

### Chat `/chat`

- Fixed conversation panel with a clear input at the bottom.
- User messages: mint fill, dark text.
- Assistant messages: panel surface, 1px border.
- Streaming indicator: mint pulse, reduced-motion safe.

### Admin and login

- Same tokens, denser spacing.
- Admin defaults to dark even if the public site was toggled light; document this in the admin header.
- Login: one panel, one primary action, no illustration.

### 404

- Large mono `404`, one sentence, one link back home.

---

## 8. Interaction and Accessibility

### Motion

- Theme toggle: 150–200ms color and border transition.
- Hover: 150–200ms color, 8px shift for writing rows.
- Live dot: 2.6s pulse, opacity and halo only.
- No parallax, particles, scanlines, glitch, auto-playing video.
- `prefers-reduced-motion: reduce` disables the pulse, shift and any transform.

### Accessibility

- Body text contrast: at least 4.5:1 in both modes.
- Mono labels: at least 4.5:1; do not rely on size alone.
- Focus: visible 2px mint outline or 1px mint underline on every interactive element.
- Touch targets: at least 44×44px on mobile.
- Theme toggle: real `<button>`, `aria-pressed`, keyboard operable.
- Rail nav: real `<nav>` with `aria-label`.
- Do not use color alone to signal state. Pair mint with a label or icon.
- Test with keyboard, 200% zoom, and reduced motion.

---

## 9. Implementation Map

### New files

- `apps/web/src/styles/instrument.css`: the new source of truth. All selectors use the `ni-` prefix or are nested under `.ni-shell` / `.ni-home` during migration.
- `apps/web/src/shared/components/night/night-shell.tsx`
- `apps/web/src/shared/components/night/night-rail.tsx`
- `apps/web/src/shared/components/night/theme-toggle.tsx`
- `apps/web/src/shared/components/night/night-meta.tsx`
- `apps/web/src/features/home/components/night-home.tsx`

### Loading order

- Add `instrument.css` after `fashion.css` in `src/routes/__root.tsx` during migration.
- The `ni-` prefix prevents collisions with `fashion.css`, `final.css`, `flow.css` and the `paper-*` files.
- After the homepage is verified, migrate posts, photos, about, search, chat and admin, then remove the old theme files.

### Theme boot

- Set `data-theme` in an inline script in the document head before first paint.
- Read `localStorage.getItem('mz-theme')`.
- Fallback to `dark`.
- Set `color-scheme` in CSS per theme.
- Expose `window.__setTheme` only if needed for tests; prefer a React context.

### Data and behavior

- No changes to queries, services, server functions, Prisma schema or API contracts.
- Keep the existing locale routing: English has no prefix, Chinese is `/zh`.
- Keep comments, views, audio, photography and chat behavior unchanged.
- Do not change article content or metadata.

### Verification

- Run `pnpm --filter web lint:tsc`, `pnpm --filter web test`, `pnpm --filter web build`.
- Check dark and light at 1440, 1024, 768 and 390 widths.
- Check keyboard focus, reduced motion, and first-paint theme.
- Screenshot both themes for the approved record.

---

## 10. Migration Plan

1. Create a branch for the homepage migration.
2. Add `instrument.css` and the `Night*` components.
3. Replace the homepage composition only; keep the old navbar/footer on inner pages for now.
4. Verify dark/light, mobile, keyboard and build.
5. Migrate writing and article pages.
6. Migrate photography, about, search, chat, admin and login.
7. Remove `fashion.css`, `paper-*.css`, and the old theme tokens after all pages pass.
8. Update this document with the final token names and any decisions made during implementation.

---

## 11. Open Decisions

- **First-visit theme:** dark only, or follow `prefers-color-scheme` when no stored choice? Current recommendation: dark, because it is the signature mode.
- **Rail on article pages:** keep the rail for navigation, or collapse to a top bar for reading focus? Current recommendation: keep the rail on desktop, hide on mobile.
- **Photography layout:** contact sheet vs single column. Current recommendation: contact sheet, because the work is the content.
- **Admin default:** follow the public theme or always dark? Current recommendation: always dark for the admin surface.
- **Chinese font:** load Noto Sans SC, or rely on the platform CJK stack? Current recommendation: platform stack first, add Noto Sans SC only if the rendering is inconsistent.

---

## 12. Do / Don't

### Do

- Use hairlines, spacing and type scale for hierarchy.
- Use mint for active/positive and amber for cost/attention.
- Keep the instrument frame around the person, not the other way around.
- Show before/after with context.
- Write labels in plain language. Short, concrete, no hype.
- Test both themes before calling a page done.

### Don't

- Don't use purple, aurora, glass, neon, scanlines or glitch.
- Don't use Bodoni, serif display faces or vermilion magazine rules.
- Don't add card shadows, rounded corners or floating glass toolbars.
- Don't use fake live data or a dashboard that pretends to monitor something.
- Don't invert images for light mode.
- Don't shrink mono labels below 9px to make a layout work.
- Don't ship a page in only one theme.

---

## 13. Reference

- Approved direction: **C / Night Instrument**.
- Prototype: `~/.gstack/projects/zhangshichuan-maxzhang.site/designs/homepage-theme-20261121/night-instrument.html`
- Dark screenshot: `variant-night.png`
- Light screenshot: `variant-night-light.png`
- Approved record: `approved.json`
