# Design System: Max Zhang

> **Source of truth:** the two approved homepage renders
> `variant-night.png` (Night) and `variant-night-light.png` (Day).
> Everything in this document is derived from those two images first;
> inner-page patterns are the same primitives applied to new content.
>
> **Status:** Night Instrument is the site-wide theme. `/` and `/zh` are the
> reference implementation; every other route uses the same shell, rail, meta
> row, hairlines, type scale, and Day/Night tokens.
>
> **Replaces:** Fashion Editorial, AI Native, Flow Field, MZ/OS, Kinetic Index,
> Glitch Core, Liquid Glass.

---

## 1. Product Context

- **What this is:** Max Zhang's personal site, a TanStack Start monolith with
  writing, photography, about, search, tree hole, admin, and login.
- **Who it is for:** hiring teams, AI product peers, readers of product writing,
  and photography/design peers.
- **Brand position:** Product-minded AI builder in Chengdu. Turning model
  capability into products people actually trust.
- **Job of the homepage:** within 30 seconds, show who you are, what you shipped,
  how you work, and make the next step obvious: read a piece or send an email.
- **Languages:** English by default, Chinese under `/zh`. On a first visit to
  an unprefixed path, the device's primary language decides: `zh-*` redirects
  to `/zh`, everything else stays English. A stored `mz-locale` choice wins,
  and explicit `/zh` URLs always stay Chinese. Both locales share one type
  system; Chinese never shrinks its type just to fit a Latin layout.

---

## 2. Direction

**A quiet instrument panel for a person who ships AI products.**

The page behaves like a well-used instrument: numbered sections, status lights,
measured bars, and hairline rules. The person and the judgment stay in front;
the interface only points attention at the right place.

### Principles visible in the demos

1. **Person before system.** The portrait, name, and claim dominate the hero.
2. **Instrument, not dashboard.** Bars, indices, and status dots explain
   something. They are never decoration.
3. **Hairlines, not cards.** Hierarchy comes from 1px rules, whitespace, and
   contrast. No shadows, glass, or large radii.
4. **Two lights, one instrument.** Day and Night share one layout and one set
   of roles. Light is not a color inversion.
5. **Hold still.** Motion is limited to color, rule drawing, and short reveals.

### Non-negotiables

- No purple, aurora gradients, glassmorphism, neon glow, scanlines, or glitch.
- No Bodoni, fashion mastheads, vermilion rules, or magazine issue numbers.
- No card shadows, large rounded corners, or floating glass toolbars.
- No fake live data, fake terminals, or fake monitoring walls.
- Photography stays in full color. Never grayscale or invert it.
- Every animation has a `prefers-reduced-motion` fallback.

---

## 3. Modes and Tokens

### Modes

- `html[data-theme="dark"]` is the signature mode; light is a first-class daily mode.
- On a first visit the device's `prefers-color-scheme` decides the mode. A
  stored `mz-theme` choice wins, and a manual toggle writes that override.
- Each mode sets its own `color-scheme`.
- The Day/Night control sits next to the locale switch, with two icon buttons:
  sun = light, moon = dark. The active mode uses a mint fill and `aria-pressed`.
- The choice is stored in `localStorage` under `mz-theme`.
- An inline boot script sets `data-theme` before first paint, so there is no
  flash. `?theme=light|dark` is supported for screenshots and overrides storage.
- When no override exists, live `prefers-color-scheme` changes update the page.

### Color roles

| Role       | Dark                    | Light                 | Use                                     |
| ---------- | ----------------------- | --------------------- | --------------------------------------- |
| Background | `#0a0e11`               | `#ffffff`             | Page canvas                             |
| Panel      | `#10161b`               | `#ffffff`             | Case panel, personnel card, contact     |
| Panel 2    | `#0d1318`               | `#f5f7f6`             | Rail, secondary surface                 |
| Ink        | `#e9e5dc`               | `#101613`             | Primary text                            |
| Muted      | `rgba(233,229,220,.52)` | `rgba(16,22,19,.60)`  | Secondary text, labels                  |
| Muted 2    | `rgba(233,229,220,.34)` | `rgba(16,22,19,.36)`  | Meta, indices, disabled                 |
| Line       | `rgba(233,229,220,.13)` | `rgba(16,22,19,.12)`  | Hairline borders                        |
| Line 2     | `rgba(233,229,220,.06)` | `rgba(16,22,19,.06)`  | Inner rules, bar tracks                 |
| Mint       | `#8fe3c0`               | `#0b7a63`             | Primary accent, links, active, positive |
| Mint dim   | `rgba(143,227,192,.16)` | `rgba(11,122,99,.13)` | Halo, fills, tags                       |
| Amber      | `#ffb35c`               | `#8a5a00`             | Cost, attention, caution                |
| Amber dim  | `rgba(255,179,92,.14)`  | `rgba(138,90,0,.12)`  | Amber fills                             |
| Red        | `#ff6b5a`               | `#b42318`             | Errors only                             |
| On mint    | `#07100c`               | `#f9fbfa`             | Text on a mint-filled button            |

### Rules

- Mint is the only primary accent. Amber marks cost or attention. Red is for
  errors and never decoration.
- Buttons filled with mint use the page background as their text color.
- Light mode uses a neutral canvas and cool gray surfaces. Do not introduce warm
  cream, beige, or terracotta.
- Dark mode shows the 72px page grid at very low opacity; light mode uses a
  clean, grid-free canvas so it reads as paper white.
- Charts, bars, and track fills use role tokens, never one-off colors.

### Token block

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
  --ni-on-mint: #07100c;
}

html[data-theme='light'] {
  --ni-bg: #ffffff;
  --ni-panel: #ffffff;
  --ni-panel-2: #f5f7f6;
  --ni-ink: #101613;
  --ni-muted: rgba(16, 22, 19, 0.6);
  --ni-muted-2: rgba(16, 22, 19, 0.36);
  --ni-line: rgba(16, 22, 19, 0.12);
  --ni-line-2: rgba(16, 22, 19, 0.06);
  --ni-mint: #0b7a63;
  --ni-mint-dim: rgba(11, 122, 99, 0.13);
  --ni-amber: #8a5a00;
  --ni-amber-dim: rgba(138, 90, 0, 0.12);
  --ni-red: #b42318;
  --ni-on-mint: #f9fbfa;
}
```

---

## 4. Typography

### Families

- **Body and display:** Inter Variable, self-hosted through
  `@fontsource-variable/inter`.
- **Labels, indices, and data:** JetBrains Mono Variable, self-hosted through
  `@fontsource-variable/jetbrains-mono`.
- **Chinese:** the same stacks, falling back to PingFang SC / Noto Sans SC.
  Chinese headings keep normal letter-spacing and a slightly looser line height.

### Scale in use

| Role           | Size                       | Weight | Tracking   | Notes                        |
| -------------- | -------------------------- | ------ | ---------- | ---------------------------- |
| Hero H1        | `clamp(48px, 6vw, 78px)`   | 480    | `-0.055em` | Max 12.5ch, line-height 1.01 |
| Page H1        | `clamp(40px, 5vw, 64px)`   | 470    | `-0.05em`  | Inner pages, same rhythm     |
| Section title  | `clamp(22px, 2.3vw, 29px)` | 470    | `-0.035em` | Section header               |
| Case H3        | `clamp(34px, 3.8vw, 50px)` | 450    | `-0.055em` | Max 10ch                     |
| Metric value   | `clamp(34px, 3.3vw, 50px)` | 430    | `-0.06em`  | Tabular numerals             |
| Body           | `15.5px`                   | 400    | `-0.012em` | Line-height 1.55             |
| Secondary body | `12.5–13px`                | 400    | 0          | Line-height 1.55             |
| Mono label     | `9–10px`                   | 400    | `0.1em`    | Uppercase, JetBrains Mono    |
| Article prose  | `17px`                     | 400    | `0`        | Line-height 1.7, max 720px   |

- Mono labels are always uppercase in English and keep `0.04em` tracking in
  Chinese.
- Numbers use tabular figures (`font-variant-numeric: tabular-nums`).
- Do not use more than two weights per block.

---

## 5. Layout

### Shell

- **Page max width:** 1440px, centered.
- **Content inner max width:** 1160px.
- **Desktop rail:** 216px, fixed to the viewport, full viewport height.
- **Rail background:** `--ni-panel-2`; right border `1px solid --ni-line`.
- **Main column:** starts after the rail; inner content centered inside the
  1160px column with `clamp(22px, 4vw, 58px)` gutters.
- **Meta row:** 34px top padding, bottom hairline; path on the left, status and
  Day/Night control on the right.
- **Footer:** hairline top, mono links, always at the end of the content column.
- **Breakpoints:** `1120px` rail collapses to a top bar; `900px` hero and case
  stack; `700px` single column, compact meta, rail becomes a top bar with a
  menu button that expands the full navigation.

### Rail contents (top to bottom)

1. `MZ®` wordmark.
2. Role and year: `Product-minded AI builder` / `Portfolio / 2026`.
3. Primary navigation, each row numbered `01–07` and separated by hairlines:
   `01 Overview → /`, `02 Writing → /posts`, `03 Photography → /photos`,
   `04 About → /about`, `05 Search → /search`, `06 Tree hole → /chat`,
   `07 Contact → /#contact`. The active destination uses `--ni-mint` and
   `aria-current="page"`.
4. Availability block: live dot, location (`Chengdu, China`), working scope,
   last update.
5. Locale switch, Day/Night icon pair, and issue number pinned to the bottom.
6. At `700px` and below: brand, Day/Night pair, locale, and a 44px menu button;
   the same seven links expand below the top bar as a vertical hairline list.

### Meta row copy

| Page        | Left label                                   |
| ----------- | -------------------------------------------- |
| Home        | `Chengdu / 2026 / Product-minded AI builder` |
| Writing     | `Writing / 2026 / Index`                     |
| Article     | `Writing / 2026 / File`                      |
| About       | `File / 2026 / About`                        |
| Photography | `Archive / 2026 / Photography`               |
| Search      | `Index / 2026 / Search`                      |
| Tree hole   | `Channel / 2026 / Tree hole`                 |
| Admin       | `Private / 2026 / Admin`                     |
| Login       | `Private / 2026 / Access`                    |

The right side shows `Open to AI product collaborations`. On small screens the
status hides; the Day/Night control lives in the rail/top bar instead.

---

## 6. Homepage Anatomy (reference implementation)

1. **Hero** — 7/4 grid.
   - Left: mint rule + mono kicker, H1 with mint final phrase, Chinese line,
     lede, primary mint button `Inspect the work ↗`, ghost button `Open channel`.
   - Right: personnel card. Panel border, 11px inset, top row with live dot and
     `Fig. 01`, full-color portrait (4:4.5 crop), caption with name, role,
     location, and a mint `OPEN / 2026` tag.
2. **Metrics** — four equal panels separated by hairlines.
   - Mono label and mint index, large value with mono unit, 2px bar, mono note.
   - The retention metric uses amber.
3. **Section header** — mint index, title, right-aligned underlined mono link.
   Used unchanged by every following section.
4. **Selected signal** — 1.05/0.95 grid.
   - Left: large H3 with mint phrase, lede, two fact columns (`Context`,
     `Decision`) with amber labels.
   - Right: panel with header (`Case 01 / AI video pipeline`, year), three
     measured bars, and a four-step flow with mint dots.
5. **Operating principles** — three rows: amber index, 19–24px title, muted body.
6. **Method** — four columns with mint dots on the top rule, index, title, body.
7. **Writing** — list rows: index, title, category, date, mint arrow. Hover
   shifts the row 8px and turns the title mint.
8. **Contact** — panel with 3px mint left edge. Large two-line statement,
   underlined email, status and short body on the right.
9. **Footer** — mono row with brand, page links, GitHub/email/tree hole, and
   copyright/location.

---

## 7. Shared Components

### Kicker

Mono, uppercase, muted; preceded by a 28px mint rule. Used at the top of every
page and major section intro.

### Button

- Primary: mint fill, `--ni-on-mint` text, mono 10px uppercase, 44px minimum
  height, square corners.
- Ghost: 1px `--ni-line` border, ink text; hover turns mint.
- Text link: mono label with a 1px bottom border; hover turns mint.

### Panel

1px hairline border, `--ni-panel` background, square corners. Used for the
personnel card, case panel, contact block, lightbox rail, chat shell, and admin
surfaces. Padding is 20px unless the contents are a table or image.

### Index

Mono numerals in `--ni-muted-2` by default, mint for section indices and amber
for principle rows.

### Tag / chip

Mono 9px, 1px border, square. Mint border/text for the active state; neutral
hairline for inactive. On light mode the active chip may use `--ni-mint-dim`.

### Bar / track

- 2px for metrics, 5px for case bars.
- Track: `--ni-line-2`.
- Fill: `--ni-mint`; amber for cost/caution.
- Width comes from a `--w` custom property.

### Status dot

6px circle in mint with a 4px `--ni-mint-dim` halo. Availability rows use a
static dot; streaming chat uses a pulse that is disabled under reduced motion.

---

## 8. Page Templates

These are the same primitives applied to the rest of the site. They are not
separate visual systems.

### Writing index (`/posts`)

1. Page head: kicker `Personnel file / Writing`, H1 `Writing`, description and
   note in the right column.
2. Metrics row: entries, categories, tags, latest update.
3. `01 Writing plan`: three-column series grid, same as Method.
4. `02 Index`: filter chips for categories and tags, then list rows.
   Each row: index, title, summary, date · reading time · views · comments,
   category, tags, mint arrow.
5. Empty state: panel with mono code `000`, a short line, and a clear action.

### Article (`/posts/$slug`)

1. Kicker: category / reading time.
2. H1 in page-title scale, max 18ch.
3. Meta row: date, author, views, comments, AI-assisted tag.
4. Tools row: audio player on the left, tags on the right.
5. Prose column max 720px: 17px body, 1.7 line height, hairline code blocks,
   mint links, tables with hairline borders, figures with mono captions.
6. Comments section below a section header; comment cards use hairline
   separators, mono fingerprints, and mint reply actions.
7. Back-to-top as a square hairline button aligned to the content column's
   right edge, never pinned to the viewport edge on wide screens.

### About (`/about`)

1. Page head: kicker `Profile`, H1 `About`, status and location on the right.
2. `01 Intro`: two-column, copy left, full-color portrait panel right with
   `Plate 01` caption.
3. `02 Record`: facts list on the left (mono labels, ink values), experience
   timeline on the right (period, role, company, note). Hairline rows.
4. `03 Contact`: the homepage contact panel, reused verbatim.

### Photography (`/photos`)

1. Page head: kicker `Archive`, H1 `Photography`, description and facts
   (works, frames, author, year) on the right.
2. Metrics row: works, frames, author, range.
3. Grid: 3 columns on desktop, 2 on tablet, 1 on mobile. Each tile is a
   1px-bordered panel with a full-color image, index `01`, optional frame
   count, caption, date/location, tags, and comment count.
4. Lightbox: portal overlay, image left and instrument rail right. Close button
   top right, arrow keys, swipe, ESC. EXIF is a collapsed details row.
5. Empty state: `000` panel with a short line.

### Search (`/search`)

1. Page head: H1 `Search` and a full-width hairline search field with a mint
   focus ring.
2. Filter panels: Category and Tag chip rows, each with a count.
3. Status row: result count on the left, active filters and `Clear all` on the
   right.
4. Results: the same list row as Writing, with title, meta, summary, and tags.
5. Empty states: `Enter a keyword` and `No results`, both in a panel.

### Tree hole (`/chat`)

- Full-height app page inside the shell; no footer.
- Header: live dot, session date, round count, title, subtitle, status pill,
  and a menu for clearing history.
- Body: local-only message thread. User messages align right with a mint-dim
  surface; assistant messages align left with a panel surface. Mono labels
  `You`, `Tree Hole`, `Listening`.
- Composer docked at the bottom: textarea, mint send button, keyboard hint,
  character count.
- Empty state explains the experiment and privacy in one short block.

### Admin and login

- Admin: page head, four metric panels, and a hairline table of works with
  cover thumb, caption, date, photo count, and delete action. Upload is a mint
  primary button.
- Login: centered panel, left stamp column with `Private archive` and access
  state, right form with a single passphrase field and mint submit button.
- Both use the same shell, rail, and meta row; no separate admin theme.

### 404

- Large `404` in display scale, mono kicker, one sentence, and a mint
  `Back to homepage` button. Rendered inside the same shell.

---

## 9. Motion

- Theme changes transition background, border, and color over 200ms.
- Section links and list rows may shift 8px on hover; titles turn mint.
- Bars draw from 0 to their width once on first paint, 500ms, ease-out.
- No parallax, no scroll-jacking, no looping background animation.
- Under `prefers-reduced-motion: reduce`, all transforms and reveals are
  disabled; content is fully visible immediately.
- Focus states are always visible: 2px mint outline, 2px offset, square corners.

---

## 10. Accessibility

- Skip link to `#ni-content` on every page.
- Rail nav is a real `<nav>` with `aria-label`; active page uses
  `aria-current="page"`.
- Theme toggle is a real `<button>` with `aria-pressed` and a destination label.
- Minimum 44px touch targets on mobile.
- Color is never the only signal: active states also use weight, border, or
  `aria-current`.
- Text contrast targets WCAG AA in both modes.
- Images always carry meaningful `alt`; decorative rules are `aria-hidden`.

### Mobile interaction

- The rail becomes a top bar: brand, Day/Night pair, locale, and a 44px menu
  button. The menu expands the same seven links as a vertical hairline list.
- Every primary control is at least 44×44px; text inputs and textareas are at
  least 16px to prevent iOS zoom.
- Composer, menu, and back-to-top respect `env(safe-area-inset-bottom/top)`.
- The tree hole page subtracts the measured rail height from `100dvh`, so the
  page itself never scrolls and the composer stays visible.
- Wide-screen back-to-top aligns to the content column, not the viewport edge.

---

## 11. Implementation Map

| Concern                 | File                                                           |
| ----------------------- | -------------------------------------------------------------- |
| Tokens, shell, homepage | `apps/web/src/styles/instrument.css`                           |
| Inner-page primitives   | `apps/web/src/styles/instrument-pages.css`                     |
| Theme boot + toggle     | `apps/web/src/shared/components/night/theme.ts`                |
| Language boot + choice  | `apps/web/src/shared/components/night/locale.ts`               |
| Rail                    | `apps/web/src/shared/components/night/night-rail.tsx`          |
| Meta row                | `apps/web/src/shared/components/night/night-meta.tsx`          |
| Shell + footer          | `apps/web/src/shared/components/night/night-shell.tsx`         |
| Homepage                | `apps/web/src/features/home/components/night-home.tsx`         |
| Writing index           | `apps/web/src/features/posts/components/posts-client.tsx`      |
| Article                 | `apps/web/src/features/posts/components/post-page.tsx`         |
| About                   | `apps/web/src/features/about/components/about-page.tsx`        |
| Photography             | `apps/web/src/features/photos/components/photos-index.tsx`     |
| Search                  | `apps/web/src/features/posts/components/search-client.tsx`     |
| Tree hole               | `apps/web/src/features/chat/components/chat-interface.tsx`     |
| Admin                   | `apps/web/src/features/photos/components/admin-console.tsx`    |
| Login                   | `apps/web/src/features/photos/components/admin-login-page.tsx` |
| 404                     | `apps/web/src/shared/components/not-found.tsx`                 |

### Rules for migration

1. Every page renders inside `NightShell`; no page keeps the old navbar or
   footer.
2. All page markup uses `ni-` classes and tokens. Legacy `fx-`, `pp-`, `se-`,
   `ph-`, `ab-`, `ch-`, `ad-` classes are removed as each page moves.
3. New colors or sizes are added to this document before they are added to CSS.
4. Light mode is verified on every page, not just the homepage.
5. No page ships without a `prefers-reduced-motion` check and a 44px mobile
   touch target.
