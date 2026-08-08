# Repository Guidelines

Contributor guide for the Max Zhang personal-site monorepo.

## Project Structure & Module Organization

- `apps/web/` — TanStack Start (Vite + Nitro) website. Routes in `src/routes/` (en has no prefix, zh under `/zh`); business code in `src/features/<domain>/` split into `components/`, `queries/`, `services/`, `server-functions/`, `model/`; shared code in `src/shared/`.
- `apps/web/articles/{zh,en}/*.mdx` — article content, 28 per locale; `apps/web/messages/{locale}.json` — i18n strings; `apps/web/tests/` — Vitest tests mirroring `src/features/`.
- `apps/services/tts/` — FastAPI + edge-tts streaming service (managed with uv).
- `apps/services/chat/` — Go chat service that proxies DeepSeek with SSE streaming.
- `docs/adr/` — architecture decision records.

Never commit build output: `.output/`, `src/features/posts/generated/`, and `generated/` (Prisma) are produced at build time.

## Build, Test, and Development Commands

- `pnpm dev` — regenerate MDX and start the Vite dev server on :3000.
- `pnpm build` — generate MDX, build `.output/`, and type-check.
- `pnpm start` — run the production server from `.output/`.
- `pnpm lint` — tsc, ESLint --fix, Prettier, then Prisma format.
- `pnpm test` / `pnpm test:watch` — run Vitest once / in watch mode.
- TTS service: `cd apps/services/tts && uv sync && uv run uvicorn app.main:app --port 8001`.

## Coding Style & Naming Conventions

- No semicolons, single quotes, 2-space indentation, 120-character lines, trailing commas (enforced by Prettier and ESLint).
- Four-layer architecture: routes only compose; data reads live in `queries/`, writes in `services/`, client-safe entry points in `server-functions/` via `createServerFn`.
- Server-only modules MUST end with `.server.ts` (e.g., `queries/posts.server.ts`); importing one from client code fails the build.
- MDX frontmatter requires `title`, `date`, `summary`, `tags`, `category` (`Frontend` | `Backend` | `DevOps`), and `author`.

## Testing Guidelines

- Vitest runs in a node environment; tests mirror `src/features/` under `tests/`.
- Use dynamic `import()` with `vi.resetModules()` and top-level `vi.mock()` for isolation.
- Server functions compile to RPC stubs in tests; test the underlying queries/services instead.
- Go chat service: `cd apps/services/chat && go test ./...`.

## Commit & Pull Request Guidelines

- Conventional Commits (enforced by husky + commitlint): `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`.
- PRs: describe what changed and why, link related issues, and add screenshots for UI changes.
- Pushes to `main` trigger a production deployment — validate locally before merging.

## Agent-Specific Notes

- Never edit `src/features/posts/generated/` or commit build artifacts.
- Article audio is generated on demand from a content hash; no audio files live in the repository.
