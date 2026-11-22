/**
 * 聊天功能模块导出文件
 *
 * 集中导出聊天模块的所有公开API，包括组件、服务端操作和类型定义
 */

export { ChatInterface } from './components'
export { chatStream } from './server-functions'
export { GUESTS, GUEST_IDS, MAX_TABLE_GUESTS } from './model/guests'
export type { Guest, GuestId } from './model/guests'
export type { ChatMessage } from './model/message'
export type { ChatErrorCode } from './services/chat-stream.server'
