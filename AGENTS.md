# Repository Guidelines

Contributor guide for the Max Zhang personal-site monorepo. Deeper references: `README.md`, `apps/web/ARCHITECTURE.md`, `DESIGN.md`, `docs/adr/`.

## Project Structure

- `apps/web/` — TanStack Start (Router + Vite + Nitro), React 19, Tailwind 4, Prisma/SQLite. It is not Next.js: `.next/` and `next-env.d.ts` are stale leftovers; build output is `.output/`.
- Routes: `src/routes/_en/` serves English at unprefixed URLs, `src/routes/zh/` serves Chinese under `/zh`; pages normally exist in both. `src/routeTree.gen.ts` is generated but tracked — don't hand-edit it; let dev/build regenerate it.
- i18n helpers live in `apps/web/i18n/routing.ts` (outside `src/`), strings in `apps/web/messages/{en,zh}.json`. The URL decides locale; a boot script redirects Chinese-language first visits to `/zh`, with a stored `mz-locale` choice winning.
- Feature code lives in `src/features/<domain>/{components,queries,services,server-functions,model}`. Routes only compose; reads go in `queries/`, writes/orchestration in `services/`, client-callable entrypoints in `server-functions/`. Shared code is in `src/shared`, server infrastructure in `src/server`.
- Pages and other features should import a feature through its `index.ts`, not deep paths. Server-only modules MUST end in `.server.ts`; importing one from client code fails the build. Public barrels must not re-export `.server.ts` modules.
- Alias `@/*` maps to `apps/web/*`: imports are `@/src/features/...`, `@/i18n/routing`, `@/messages/en.json`.
- Content: `apps/web/articles/{en,zh}/*.mdx`, paired by slug. Required frontmatter: `title`, `date`, `summary`, `tags`, `category` (`Frontend` | `Backend` | `DevOps`), `author`. Optional: `updated`, `aiAssisted`. Writing is published immediately. MDX is compiled into gitignored `src/features/posts/generated/`.
- Backends: `apps/services/tts` (FastAPI + edge-tts, :8001), `apps/services/chat` (Go stdlib + DeepSeek, :9000), `apps/services/storage` (NestJS + sharp, :9001).

## Commands

- Requires Node 22+, pnpm 10, Python 3.12+/uv, Go 1.22+.
- Setup: copy `apps/web/.env.example` to `apps/web/.env` before `pnpm install`; postinstall runs `prisma generate` and needs `DATABASE_URL`.
- First run: `pnpm db:migrate` creates `apps/web/prisma/dev.db`. `pnpm dev` warns but does not migrate.
- `pnpm dev` — `scripts/dev.mjs` starts Web :3000, TTS :8001, chat :9000, storage :9001. It kills whatever already holds those ports; missing `uv`/`go` skips that service. Variants: `pnpm dev:web`, `pnpm dev:services`, `pnpm dev:otel`; use `pnpm dev:clean` when Vite/TanStack cache causes stale "Invalid server function ID" errors.
- `pnpm build` — generate MDX → Vite build → `tsc --noEmit`; `pnpm start` serves `.output/`. Quick typecheck: `pnpm lint:tsc` (also regenerates MDX).
- `pnpm lint` mutates files: tsc → `eslint --fix` → `prettier --write` → `prisma format`. Husky's pre-commit runs it and then `git add -u`.
- Tests: `pnpm test` / `pnpm test:watch`. Single file: `pnpm --filter web exec vitest run tests/features/posts/queries/posts.test.ts`. Go: `cd apps/services/chat && go test ./...`. Storage has no tests; run `pnpm --filter storage typecheck`.

## Conventions & Gotchas

- Prettier: no semicolons, single quotes, 2 spaces, 120 columns, trailing commas.
- Vitest runs in node over `tests/**/*.test.ts`, mirroring `src/features/`. Use top-level `vi.mock()`, dynamic `import()` with `vi.resetModules()`, and mock `@/src/server/db`. Server functions are RPC stubs in tests — test the underlying query/service.
- `DESIGN.md` is the current visual source of truth (Night Instrument, light + dark); the AI Native/dark-only notes still in `CONTEXT.md` and some CSS headers are historical. `CONTEXT.md` remains the terminology glossary.
- 夜宴 guest IDs must stay in sync across `apps/services/chat/personas.go` (map + `guestOrder`), `apps/services/chat/personas/*.md`, and `apps/web/src/features/chat/model/guests.ts`.
- Photo uploads: dev writes to `apps/web/public/photos`, production mounts `photos_data` at `.output/public/photos`. Hotlink protection is implemented twice (`vite.config.ts` dev plugin and `apps/web/server/middleware/hotlink.ts`); change both.
- Never edit or commit `.output/`, `apps/web/src/features/posts/generated/`, or `apps/web/generated/` (Prisma client). Article audio is generated on demand; the repo stores no audio files.
- Local env lives in per-service gitignored `.env` files. For chat, `.env` overrides shell env; for the other services shell env wins. Production secrets come from CI/deploy, not `.env`.
- Conventional Commits are enforced by husky + commitlint. Pushing `main` triggers the production deploy (Docker rebuild, Prisma migrate, restart); validate locally before merging.
