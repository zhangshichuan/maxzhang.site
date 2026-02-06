FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 standalone 构建产物（包含必要的 node_modules 和 server.js）
COPY --chown=nextjs:nodejs standalone/ ./

# 复制静态资源（Next.js 要求这两部分必须手动复制到正确位置）
COPY --chown=nextjs:nodejs static/ ./.next/static
COPY --chown=nextjs:nodejs public/ ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
