# syntax=docker/dockerfile:1

FROM node:22-slim AS builder

WORKDIR /repo

ENV NPM_CONFIG_REGISTRY="https://registry.npmmirror.com"

COPY package.json ./
RUN npm install

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV PORT=9001

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs
COPY --from=builder --chown=nodejs:nodejs /repo/dist ./dist

RUN mkdir -p /data/photos && chown -R nodejs:nodejs /data/photos

USER nodejs

EXPOSE 9001

CMD ["node", "dist/main.js"]
