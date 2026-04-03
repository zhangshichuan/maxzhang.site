import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getViewCountMock, findFirstMock, upsertMock, createMock, transactionMock } = vi.hoisted(() => ({
  getViewCountMock: vi.fn(),
  findFirstMock: vi.fn(),
  upsertMock: vi.fn(),
  createMock: vi.fn(),
  transactionMock: vi.fn(),
}))

vi.mock('@/src/features/engagement/queries', () => ({
  getViewCount: getViewCountMock,
}))

vi.mock('@/src/server/db', () => ({
  prisma: {
    viewLog: {
      findFirst: findFirstMock,
      create: createMock,
    },
    postView: {
      upsert: upsertMock,
    },
    $transaction: transactionMock,
  },
}))

import { incrementView } from '@/src/features/engagement/services'

describe('阅读数服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('会在指纹缺失时返回 null', async () => {
    await expect(incrementView('post-1', 'en', '')).resolves.toBeNull()

    expect(findFirstMock).not.toHaveBeenCalled()
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it('会在 24 小时内重复浏览时跳过写入', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })
    getViewCountMock.mockResolvedValue(9)

    await expect(incrementView('post-1', 'en', 'fp-1')).resolves.toBe(9)

    expect(findFirstMock).toHaveBeenCalled()
    expect(transactionMock).not.toHaveBeenCalled()
    expect(getViewCountMock).toHaveBeenCalledWith('post-1', 'en')
  })

  it('会在新浏览时 upsert 阅读数并创建日志', async () => {
    findFirstMock.mockResolvedValue(null)
    upsertMock.mockReturnValue('upsert-op')
    createMock.mockReturnValue('create-log-op')
    getViewCountMock.mockResolvedValue(10)

    await expect(incrementView('post-1', 'en', 'fp-1')).resolves.toBe(10)

    expect(upsertMock).toHaveBeenCalledWith({
      where: {
        slug_locale: {
          slug: 'post-1',
          locale: 'en',
        },
      },
      update: {
        views: {
          increment: 1,
        },
      },
      create: {
        slug: 'post-1',
        locale: 'en',
        views: 1,
      },
    })
    expect(createMock).toHaveBeenCalledWith({
      data: {
        fingerprint: 'fp-1',
        slug: 'post-1',
        locale: 'en',
      },
    })
    expect(transactionMock).toHaveBeenCalledWith(['upsert-op', 'create-log-op'])
  })
})
