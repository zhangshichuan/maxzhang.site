import { prisma } from '@/src/server/db'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 50
const RATE_WINDOW = 60 * 60 * 1000
const MAX_MESSAGE_LENGTH = 2000

const cleanupExpired = () => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now >= record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

export type ChatErrorCode =
  | 'INVALID_FINGERPRINT'
  | 'RATE_LIMIT'
  | 'MESSAGE_TOO_LONG'
  | 'INVALID_MESSAGE'
  | 'UPSTREAM_ERROR'

export const chatStreamTestUtils = {
  resetRateLimitState() {
    rateLimitMap.clear()
  },
}

export async function streamChat(
  message: string,
  fingerprint: string,
): Promise<ReadableStream | { error: ChatErrorCode }> {
  cleanupExpired()

  if (!fingerprint) {
    return { error: 'INVALID_FINGERPRINT' }
  }

  const viewLog = await prisma.viewLog.findFirst({
    where: { fingerprint },
  })

  if (!viewLog) {
    return { error: 'INVALID_FINGERPRINT' }
  }

  const now = Date.now()
  const record = rateLimitMap.get(fingerprint)

  if (record && now < record.resetTime) {
    if (record.count >= RATE_LIMIT) {
      return { error: 'RATE_LIMIT' }
    }
    record.count += 1
  } else {
    rateLimitMap.set(fingerprint, { count: 1, resetTime: now + RATE_WINDOW })
  }

  if (!message || typeof message !== 'string') {
    return { error: 'INVALID_MESSAGE' }
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: 'MESSAGE_TOO_LONG' }
  }

  const response = await fetch('http://host.docker.internal:8000/api/v1/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message.trim() }),
    signal: AbortSignal.timeout(60 * 1000),
  })

  if (!response.ok) {
    return { error: 'UPSTREAM_ERROR' }
  }

  return response.body as ReadableStream
}
