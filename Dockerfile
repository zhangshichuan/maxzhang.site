FROM node:lts-slim

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=""

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# 复制 standalone 构建产物
COPY --chown=nextjs:nodejs standalone/ ./
COPY --chown=nextjs:nodejs static/ ./.next/static
COPY --chown=nextjs:nodejs public/ ./public

# 创建数据目录
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
