# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm monorepo:

- `apps/web/` — the TanStack Start (Vite + Nitro) website:
  - `src/routes/` — file-based routes (zh has no URL prefix, en lives under `/en`)
  - `src/features/<domain>/` — business code split into `components/`, `queries/`, `services/`, `server-functions/`, `model/`
  - `src/shared/` — cross-domain utilities and components
  - `src/server/` — server infrastructure (Prisma client)
  - `articles/{zh,en}/*.mdx` — article content, 28 per locale
  - `messages/{locale}.json` — i18n strings
  - `tests/` — Vitest tests mirroring `src/features/`
- `apps/services/tts/` — FastAPI + edge-tts streaming service (managed with uv)
- `docs/adr/` — architecture decision records

Do not commit build output: `.output/`, `src/features/posts/generated/`, and `generated/` (Prisma) are generated at build time.

## Build, Test, and Development Commands

Run everything from the repo root:

- `pnpm dev` — start the Vite dev server on :3000 (regenerates MDX first)
- `pnpm build` — generate MDX, build `.output/`, and type-check
- `pnpm start` — run the production server from `.output/`
- `pnpm lint` — tsc, eslint --fix, prettier, then prisma format
- `pnpm test` / `pnpm test:watch` — run Vitest once / in watch mode
- `pnpm db:migrate` / `pnpm db:studio` — Prisma migrations / database UI
- TTS service: `cd apps/services/tts && uv sync && uv run uvicorn app.main:app --port 8001`

## Coding Style & Naming Conventions

- No semicolons, single quotes, 2-space indentation, 120-character lines, trailing commas (enforced by Prettier and ESLint).
- Four-layer architecture: routes only compose; data reads live in `queries/`, writes in `services/`, client-safe entry points in `server-functions/` via `createServerFn`.
- Server-only modules MUST end with `.server.ts` (e.g., `queries/posts.server.ts`); importing one from client code fails the build on purpose.
- MDX frontmatter requires `title`, `date`, `summary`, `tags`, `category` (`Frontend` | `Backend` | `DevOps`), and `author`.

## Testing Guidelines

- Vitest runs in a node environment; tests mirror `src/features/` under `tests/`.
- Use dynamic `import()` with `vi.resetModules()` for isolation, and declare mocks with top-level `vi.mock()`.
- Server functions compile to RPC stubs in unit tests; test the underlying queries/services instead.

## Commit & Pull Request Guidelines

- Conventional Commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:` (enforced by husky + commitlint).
- PRs: describe what changed and why, link related issues, and add screenshots for UI changes.
- Pushes to `main` trigger a production deployment — validate locally before merging.

## Agent-Specific Notes

- Never edit `src/features/posts/generated/` or commit build artifacts.
- Article audio is generated on demand from a content hash; no audio files live in the repository.
