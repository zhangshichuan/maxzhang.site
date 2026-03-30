import { PrismaClient } from '@/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

/**
 * Prisma 数据库客户端单例
 * 在生产环境外使用全局变量缓存，避免热更新时重复创建实例
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma 客户端实例
 * 使用 better-sqlite3 适配器连接 SQLite 数据库
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL,
    }),
  })

// 在非生产环境缓存实例，避免热更新重复创建
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
