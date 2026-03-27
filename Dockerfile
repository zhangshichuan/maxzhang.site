FROM node:lts-alpine

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ==========================================
# 工作区 1: Prisma 运维专属环境
# ==========================================
WORKDIR /prisma-ops
# 复制 Prisma 配置文件到这个独立目录
COPY --chown=nextjs:nodejs prisma/ ./prisma/
COPY --chown=nextjs:nodejs prisma.config.ts ./
RUN npm init -y && npm install prisma dotenv

# ==========================================
# 工作区 2: Next.js 运行专属环境
# ==========================================
WORKDIR /app
# 完美复制 standalone 产物，它自己带了完整的运行时依赖
COPY --chown=nextjs:nodejs standalone/ ./
COPY --chown=nextjs:nodejs static/ ./.next/static
COPY --chown=nextjs:nodejs public/ ./public

# 创建 SQLite 持久化数据目录，并统一赋予 nextjs 用户权限
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data /prisma-ops

USER nextjs

EXPOSE 3000

# ==========================================
# 串联启动逻辑：先去运维区干活，再回业务区启动
# ==========================================
CMD ["sh", "-c", "cd /prisma-ops && ./node_modules/.bin/prisma migrate deploy && cd /app && exec node server.js"]
