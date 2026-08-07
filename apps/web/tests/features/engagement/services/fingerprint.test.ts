import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findFirstMock, createMock } = vi.hoisted(() => ({
  findFirstMock: vi.fn(),
  createMock: vi.fn(),
}))

vi.mock('@/src/server/db', () => ({
  prisma: {
    viewLog: {
      findFirst: findFirstMock,
      create: createMock,
    },
  },
}))

import { registerFingerprint } from '@/src/features/engagement/services'

describe('指纹登记服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('会在指纹缺失时直接返回', async () => {
    await expect(registerFingerprint('', 'zh')).resolves.toBeUndefined()

    expect(findFirstMock).not.toHaveBeenCalled()
    expect(createMock).not.toHaveBeenCalled()
  })

  it('会在指纹已存在时跳过写入', async () => {
    findFirstMock.mockResolvedValue({ id: 1 })

    await expect(registerFingerprint('fp-1', 'zh')).resolves.toBeUndefined()

    expect(createMock).not.toHaveBeenCalled()
  })

  it('会在首次访问首页时创建指纹日志', async () => {
    findFirstMock.mockResolvedValue(null)

    await registerFingerprint('fp-1', 'zh')

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { fingerprint: 'fp-1' },
    })
    expect(createMock).toHaveBeenCalledWith({
      data: {
        fingerprint: 'fp-1',
        slug: 'home',
        locale: 'zh',
      },
    })
  })
})
