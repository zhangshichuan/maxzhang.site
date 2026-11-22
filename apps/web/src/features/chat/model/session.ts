import type { ChatMessage } from './message'
import { isGuestId, MAX_TABLE_GUESTS, type GuestId } from './guests'

/**
 * 夜宴的本地会话：
 * - 每张桌子（宾客组合）单独一份，按日期存放，只保留最近 3 天。
 * - 页面刷新后恢复今天最后一张桌子；换桌不会清掉另一桌的记录。
 * - 只写 localStorage，不经过服务端。
 */
const STORAGE_PREFIX = 'maxzhang.banquet.'
const LAST_TABLE_KEY = `${STORAGE_PREFIX}last`
const CREDITS_SUFFIX = '.credits'
const MAX_STORED_MESSAGES = 400

export type LastTable = {
  date: string
  guests: GuestId[]
}

/** 本地日期 key（YYYY-MM-DD） */
export function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function tableKey(guests: GuestId[], date = localDateKey()): string {
  const sorted = [...new Set(guests)].sort()
  return `${STORAGE_PREFIX}${date}.${sorted.join('+')}`
}

function creditsKey(date = localDateKey()): string {
  return `${STORAGE_PREFIX}${date}${CREDITS_SUFFIX}`
}

/** 今天的全局额度计数（跨桌子）。服务端仍是最终权威，这里只是显示。 */
export function loadDailyCredits(date = localDateKey()): number {
  try {
    const raw = localStorage.getItem(creditsKey(date))
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0
  } catch {
    return 0
  }
}

/** 服务端接受一轮后，把本轮消耗的点数累加进今天的显示计数。 */
export function addDailyCredits(credits: number, date = localDateKey()): number {
  if (!Number.isFinite(credits) || credits <= 0) return loadDailyCredits(date)
  const next = loadDailyCredits(date) + Math.floor(credits)
  try {
    localStorage.setItem(creditsKey(date), String(next))
  } catch {
    // 隐私模式或存储满时静默失败。
  }
  return next
}

function validGuestList(value: unknown): value is GuestId[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_TABLE_GUESTS) return false
  const seen = new Set<string>()
  for (const id of value) {
    if (typeof id !== 'string' || !isGuestId(id) || seen.has(id)) return false
    seen.add(id)
  }
  return true
}

/** 清理 3 天前的桌子；只动夜宴自己的 key，不碰旧树洞记录。 */
export function pruneOldSessions(): void {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 2)
    const cutoff = localDateKey(cutoffDate)
    const remove: string[] = []
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key?.startsWith(STORAGE_PREFIX) || key === LAST_TABLE_KEY) continue
      const date = key.slice(STORAGE_PREFIX.length, STORAGE_PREFIX.length + 10)
      if (date && date < cutoff) remove.push(key)
    }
    for (const key of remove) localStorage.removeItem(key)
  } catch {
    // 隐私模式或存储不可用时静默失败。
  }
}

export function loadLastTable(): LastTable | null {
  try {
    const raw = localStorage.getItem(LAST_TABLE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const record = parsed as Partial<LastTable>
    if (typeof record.date !== 'string' || !validGuestList(record.guests)) return null
    return { date: record.date, guests: record.guests }
  } catch {
    return null
  }
}

export function saveLastTable(guests: GuestId[]): void {
  if (!validGuestList(guests)) return
  try {
    localStorage.setItem(LAST_TABLE_KEY, JSON.stringify({ date: localDateKey(), guests }))
  } catch {
    // 隐私模式或存储满时静默失败。
  }
}

export function clearLastTable(): void {
  try {
    localStorage.removeItem(LAST_TABLE_KEY)
  } catch {
    // 忽略。
  }
}

function validMessage(value: unknown, guests: GuestId[]): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false
  const message = value as Partial<ChatMessage>
  if (typeof message.id !== 'string' || (message.role !== 'user' && message.role !== 'assistant')) return false
  if (typeof message.content !== 'string' || message.content.trim().length === 0) return false
  if (message.role === 'assistant') {
    if (typeof message.guest !== 'string' || !isGuestId(message.guest) || !guests.includes(message.guest)) return false
  }
  return true
}

/** 读取某张桌子今天的记录；流式中断留下的空 assistant 消息会被过滤。 */
export function loadSession(guests: GuestId[]): ChatMessage[] {
  if (!validGuestList(guests)) return []
  try {
    const raw = localStorage.getItem(tableKey(guests))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((message) => validMessage(message, guests)).slice(-MAX_STORED_MESSAGES)
  } catch {
    return []
  }
}

export function persistSession(guests: GuestId[], messages: ChatMessage[]): void {
  if (!validGuestList(guests)) return
  try {
    const trimmed = messages.filter((message) => message.content.trim().length > 0).slice(-MAX_STORED_MESSAGES)
    localStorage.setItem(tableKey(guests), JSON.stringify(trimmed))
  } catch {
    // 隐私模式或存储满时静默失败。
  }
}

export function clearSession(guests: GuestId[]): void {
  if (!validGuestList(guests)) return
  try {
    localStorage.removeItem(tableKey(guests))
  } catch {
    // 忽略。
  }
}
