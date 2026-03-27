FROM node:lts-alpine

WORKDIR /ops

# 安装 dotenv（prisma.config.ts 需要，standalone 输出不包含）
RUN npm init -y && npm install prisma dotenv

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 standalone 构建产物（包含必要的 node_modules 和 server.js）
COPY --chown=nextjs:nodejs standalone/ ./

# 复制静态资源（Next.js 要求这两部分必须手动复制到正确位置）
COPY --chown=nextjs:nodejs static/ ./.next/static
COPY --chown=nextjs:nodejs public/ ./public

# 创建数据目录用于 SQLite 持久化
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

# 启动前执行最新的数据库迁移，确保数据库结构是最新的
CMD ["sh", "-c", "/ops/node_modules/.bin/prisma migrate deploy && exec node server.js"]
