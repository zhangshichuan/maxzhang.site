'use server'

import { streamChat, type ChatErrorCode } from '@/src/features/chat/services'

export type { ChatErrorCode }

export async function chatStream(
  message: string,
  fingerprint: string,
): Promise<ReadableStream | { error: ChatErrorCode }> {
  return streamChat(message, fingerprint)
}
