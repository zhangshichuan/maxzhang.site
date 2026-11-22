import type { GuestId } from './guests'

export type ChatRole = 'user' | 'assistant'

/** 浏览器里的完整消息：assistant 消息必须带上是哪位宾客说的。 */
export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  guest?: GuestId
}

/** 发给服务端的消息：不需要本地 id。 */
export type ChatWireMessage = {
  role: ChatRole
  content: string
  guest?: GuestId
}
