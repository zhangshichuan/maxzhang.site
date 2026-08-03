# syntax=docker/dockerfile:1

FROM node:22-slim AS builder

WORKDIR /repo

RUN corepack enable

# 容器内直连 npm registry 太慢，统一走 npmmirror
ENV NPM_CONFIG_REGISTRY="https://registry.npmmirror.com"
ENV COREPACK_NPM_REGISTRY="https://registry.npmmirror.com"

# prisma.config.ts 要求 DATABASE_URL；构建期 generate 用本地 SQLite 默认值即可
ENV DATABASE_URL="file:./prisma/dev.db"

# 先安装依赖（利用层缓存）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
# postinstall 会执行 prisma generate，需要 schema 在场
COPY apps/web/prisma apps/web/prisma
COPY apps/web/prisma.config.ts apps/web/prisma.config.ts
RUN pnpm install --frozen-lockfile

# 拷贝源码并构建（TanStack Start → .output）
COPY apps/web apps/web
RUN pnpm --filter web build

FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /repo/apps/web/.output ./.output
# 运行期 loader / TTS 文本提取需要文章源文件
COPY --from=builder --chown=nodejs:nodejs /repo/apps/web/articles ./articles

RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

USER nodejs

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
