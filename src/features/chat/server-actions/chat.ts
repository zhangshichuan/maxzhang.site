'use server'

import { streamChat } from '@/src/features/chat/services'
import type { ChatErrorCode } from '@/src/features/chat/services/chat-stream'

export async function chatStream(
  message: string,
  fingerprint: string,
): Promise<ReadableStream | { error: ChatErrorCode }> {
  return streamChat(message, fingerprint)
}
