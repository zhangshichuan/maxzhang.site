/**
 * Prisma数据库客户端配置
 *
 * 配置Prisma ORM客户端，使用Better-SQLite3适配器
 * 在开发环境中使用全局单例避免热重载时创建多个连接
 */

import { PrismaClient } from '@/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// 全局Prisma客户端单例，避免热重载时创建多个数据库连接
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 导出Prisma客户端实例，优先使用全局单例
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL, // 从环境变量获取数据库URL
    }),
  })

// 在开发环境中将Prisma客户端保存到全局变量，避免热重载时重复创建
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
