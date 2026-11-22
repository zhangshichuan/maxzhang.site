import { useState, useRef, useEffect, useCallback } from 'react'
import { getThumbmark } from '@thumbmarkjs/thumbmarkjs'
import { MoreVertical, Send } from 'lucide-react'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { cn } from '@/src/shared/utils/cn'
import { chatStream } from '@/src/features/chat/server-functions'
import type { ChatErrorCode } from '@/src/features/chat/services/chat-stream.server'
import { getGuest, guestName, localizedText, MAX_TABLE_GUESTS, type Guest, type GuestId } from '../model/guests'
import type { ChatMessage } from '../model/message'
import {
  addDailyCredits,
  clearLastTable,
  clearSession,
  loadDailyCredits,
  loadLastTable,
  loadSession,
  localDateKey,
  persistSession,
  pruneOldSessions,
  saveLastTable,
} from '../model/session'
import { GuestMark } from './guest-mark'
import { GuestPicker } from './guest-picker'

const DAILY_CREDIT_LIMIT = 100
const MAX_INPUT_LENGTH = 2000

const ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  INVALID_FINGERPRINT: 'invalidFingerprint',
  INVALID_GUEST: 'invalidGuest',
  BUSY: 'busy',
  RATE_LIMIT: 'rateLimit',
  DAILY_LIMIT: 'dailyLimit',
  SERVICE_BUSY: 'serviceBusy',
  SERVICE_DAILY_LIMIT: 'serviceDailyLimit',
  MESSAGE_TOO_LONG: 'messageTooLong',
  INVALID_MESSAGE: 'networkError',
  UPSTREAM_ERROR: 'upstreamError',
}

type StreamEvent =
  | { type: 'guest_start'; guest?: GuestId }
  | { type: 'delta'; guest?: GuestId; text?: string }
  | { type: 'guest_end'; guest?: GuestId }
  | { type: 'done' }
  | { type: 'error'; code?: string }

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// 浏览器里最多留 400 条（100 轮 × 4 条），但每次只把最近 200 条、
// 6 万字符以内的上下文发给服务端。群聊每位宾客都会收到同一份历史，
// 再长就会让一轮输入成本迅速放大。
const MAX_REQUEST_MESSAGES = 200
const MAX_REQUEST_CHARS = 60_000

function trimHistoryForServer(messages: ChatMessage[]): ChatMessage[] {
  const sliced = messages.slice(-MAX_REQUEST_MESSAGES)
  const kept: ChatMessage[] = []
  let total = 0
  for (let index = sliced.length - 1; index >= 0; index -= 1) {
    const message = sliced[index]
    if (kept.length > 0 && total + message.content.length > MAX_REQUEST_CHARS) break
    kept.unshift(message)
    total += message.content.length
  }
  const firstUser = kept.findIndex((message) => message.role === 'user')
  return firstUser > 0 ? kept.slice(firstUser) : kept
}

/** 个别模型会在开头复读「【姓名】」，这里做一层兜底清理。 */
function stripGuestPrefix(content: string, guest: Guest): string {
  const names = [guest.name.zh, guest.name.en, guest.short.zh, guest.short.en]
  let text = content.trimStart()
  for (const name of names) {
    for (const prefix of [`【${name}】`, `[${name}]`, `${name}：`, `${name}:`]) {
      if (text.startsWith(prefix)) {
        text = text.slice(prefix.length).trimStart()
      }
    }
  }
  return text
}

function Typing({ label }: { label: string }) {
  return (
    <span className="ch-typing" aria-label={label}>
      <i />
      <i />
      <i />
    </span>
  )
}

export function ChatInterface() {
  const t = useTranslations('Chat')
  const locale = useLocale()

  const [hydrated, setHydrated] = useState(false)
  const [view, setView] = useState<'lobby' | 'chat'>('lobby')
  const [guests, setGuests] = useState<GuestId[]>([])
  const [draftGuests, setDraftGuests] = useState<GuestId[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isLimited, setIsLimited] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sessionDate, setSessionDate] = useState('')
  const [dailyCredits, setDailyCredits] = useState(0)

  const bodyRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const confirmClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 最近一次请求的上下文：出错后「重试」会用同一份历史重发，不重复用户消息。
  const lastAttemptRef = useRef<{ content: string; history: ChatMessage[]; guests: GuestId[] } | null>(null)

  const limited = isLimited || dailyCredits >= DAILY_CREDIT_LIMIT
  const speakingGuest = activeMessageId
    ? (messages.find((message) => message.id === activeMessageId)?.guest ?? null)
    : null
  const displayDate = sessionDate ? sessionDate.replace(/-/g, '.') : '----.--.--'
  const creditsLabel = String(Math.min(dailyCredits, DAILY_CREDIT_LIMIT)).padStart(2, '0')
  const currentGuest = guests.length === 1 ? getGuest(guests[0]) : null
  const placeholder = currentGuest
    ? t('placeholderOne', { name: guestName(currentGuest, locale, true) })
    : t('placeholderGroup')
  const sendHint = locale === 'zh' ? 'ENTER 发言 · SHIFT+ENTER 换行' : 'ENTER TO SEND · SHIFT+ENTER FOR NEWLINE'
  const canRetry =
    !limited &&
    lastAttemptRef.current !== null &&
    lastAttemptRef.current.guests.join('|') === guests.join('|') &&
    !isStreaming

  const status = limited
    ? { key: 'limit', label: 'LIMIT', className: 'ch-status--limit' }
    : isStreaming
      ? { key: 'live', label: 'LISTENING', className: 'ch-status--live' }
      : errorText
        ? { key: 'notice', label: 'NOTICE', className: 'ch-status--notice' }
        : { key: 'ready', label: 'READY', className: 'ch-status--ready' }

  useEffect(() => {
    const today = localDateKey()
    setSessionDate(today)
    setDailyCredits(loadDailyCredits(today))
    pruneOldSessions()
    const last = loadLastTable()
    if (last && last.date === today) {
      setGuests(last.guests)
      setDraftGuests(last.guests)
      setMessages(loadSession(last.guests))
      setView('chat')
    } else if (last) {
      clearLastTable()
    }
    setHydrated(true)
  }, [])

  // 换桌回来时从名录顶部开始；进入对话时滚到最新一条。
  useEffect(() => {
    if (view === 'lobby' || messages.length === 0) {
      const body = bodyRef.current
      body?.scrollTo({ top: 0 })
      // 输入框卸载后浏览器可能做一次滚动锚定，下一帧再压一次。
      const frame = requestAnimationFrame(() => body?.scrollTo({ top: 0 }))
      return () => cancelAnimationFrame(frame)
    }
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' })
  }, [messages, view, isStreaming])

  // 桌面端进入桌子时自动聚焦；流式结束后也把焦点还给输入框。
  // 移动端（触摸为主要指针的设备）不自动聚焦，避免每次回复后都弹出输入法。
  useEffect(() => {
    if (hydrated && view === 'chat' && !isStreaming && !limited && !window.matchMedia('(pointer: coarse)').matches) {
      inputRef.current?.focus()
    }
  }, [hydrated, view, isStreaming, limited])

  // 输入框随内容长高，最高 132px 后内部滚动。
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`
  }, [input])

  /**
   * 聊天页使用整页禁滚 + 内部滚动布局：
   * 用 visualViewport 的高度实时驱动容器高度，保证移动端键盘弹起时
   * 输入框始终可见（iOS/Android 的 visualViewport 都会随键盘收缩）。
   */
  useEffect(() => {
    const updateViewport = () => {
      const viewport = window.visualViewport
      const height = viewport ? viewport.height : window.innerHeight
      const root = document.documentElement
      root.style.setProperty('--chat-vh', `${height}px`)
      // iOS 键盘弹起时 visual viewport 会整体上移，页面随之对齐，避免输入区被裁切。
      root.style.setProperty('--chat-vv-top', `${viewport ? viewport.offsetTop : 0}px`)
      if (viewport && viewport.height < window.innerHeight - 1) {
        root.classList.add('chat-keyboard-open')
      } else {
        root.classList.remove('chat-keyboard-open')
      }
    }

    updateViewport()
    const viewport = window.visualViewport
    viewport?.addEventListener('resize', updateViewport)
    viewport?.addEventListener('scroll', updateViewport)
    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)
    return () => {
      viewport?.removeEventListener('resize', updateViewport)
      viewport?.removeEventListener('scroll', updateViewport)
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
      document.documentElement.style.removeProperty('--chat-vh')
      document.documentElement.style.removeProperty('--chat-vv-top')
      document.documentElement.classList.remove('chat-keyboard-open')
    }
  }, [])

  useEffect(() => {
    return () => {
      if (confirmClearTimerRef.current) clearTimeout(confirmClearTimerRef.current)
    }
  }, [])

  // 点击菜单外部时收起，同时重置确认态
  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
        setConfirmClear(false)
        if (confirmClearTimerRef.current) clearTimeout(confirmClearTimerRef.current)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  const showError = useCallback(
    (errorCode: ChatErrorCode) => {
      const key = ERROR_MESSAGES[errorCode] ?? 'networkError'
      setErrorText(t(`errors.${key}`, { max: MAX_INPUT_LENGTH }))
      if (errorCode === 'DAILY_LIMIT' || errorCode === 'SERVICE_DAILY_LIMIT') {
        setIsLimited(true)
      }
    },
    [t],
  )

  const startTable = useCallback((selection: GuestId[]) => {
    const nextGuests = Array.from(new Set(selection)).slice(0, MAX_TABLE_GUESTS)
    if (nextGuests.length === 0) return
    setGuests(nextGuests)
    setDraftGuests(nextGuests)
    setMessages(loadSession(nextGuests))
    setView('chat')
    saveLastTable(nextGuests)
    setErrorText(null)
    setConfirmClear(false)
    setMenuOpen(false)
    lastAttemptRef.current = null
  }, [])

  const toggleGuest = useCallback((id: GuestId) => {
    setDraftGuests((current) => {
      if (current.includes(id)) return current.filter((guest) => guest !== id)
      if (current.length >= MAX_TABLE_GUESTS) return current
      return [...current, id]
    })
  }, [])

  const choosePreset = useCallback((preset: GuestId[]) => {
    setDraftGuests(preset.slice(0, MAX_TABLE_GUESTS))
  }, [])

  const openLobby = useCallback(() => {
    if (isStreaming) return
    setDraftGuests(guests)
    setView('lobby')
    setMenuOpen(false)
    setConfirmClear(false)
    lastAttemptRef.current = null
  }, [guests, isStreaming])

  /**
   * 发送一轮对话：把事件流里的 guest_start / delta / guest_end 翻译成
   * 桌边一位位宾客的发言。所有宾客说完后，整轮一起持久化。
   */
  const send = useCallback(
    async (content: string, history: ChatMessage[]) => {
      if (guests.length === 0) return
      setErrorText(null)
      const userMessage: ChatMessage = {
        id: createId(),
        role: 'user',
        content,
      }
      const nextMessages = [...history, userMessage]
      lastAttemptRef.current = { content, history, guests }
      setMessages(nextMessages)
      persistSession(guests, nextMessages)
      setInput('')
      setIsStreaming(true)
      setActiveMessageId(null)

      const generated: ChatMessage[] = []
      let currentId: string | null = null
      let currentGuestId: GuestId | null = null
      let currentContent = ''
      let streamError: ChatErrorCode | null = null
      let failedBeforeStream = false

      const finalizeCurrent = () => {
        if (!currentId || !currentGuestId) return
        const id = currentId
        const guest = currentGuestId
        const content = stripGuestPrefix(currentContent, getGuest(guest))
        if (content.trim()) {
          generated.push({ id, role: 'assistant', content, guest })
          setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, content } : message)))
        } else {
          setMessages((prev) => prev.filter((message) => message.id !== id))
        }
        currentId = null
        currentGuestId = null
        currentContent = ''
        setActiveMessageId(null)
      }

      const handleLine = (line: string) => {
        const trimmed = line.trim()
        if (!trimmed) return
        let event: StreamEvent
        try {
          event = JSON.parse(trimmed) as StreamEvent
        } catch {
          return
        }

        switch (event.type) {
          case 'guest_start': {
            if (!event.guest || !guests.includes(event.guest)) return
            finalizeCurrent()
            const id = createId()
            const guest = event.guest
            currentId = id
            currentGuestId = guest
            currentContent = ''
            setMessages((prev) => [...prev, { id, role: 'assistant', content: '', guest }])
            setActiveMessageId(id)
            break
          }
          case 'delta': {
            if (!currentId || !currentGuestId) return
            currentContent += event.text ?? ''
            const id = currentId
            const content = currentContent
            setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, content } : message)))
            break
          }
          case 'guest_end': {
            finalizeCurrent()
            break
          }
          case 'error': {
            streamError = (event.code as ChatErrorCode | undefined) ?? 'UPSTREAM_ERROR'
            break
          }
          case 'done':
            break
        }
      }

      try {
        const thumbmark = await getThumbmark()
        const requestMessages = trimHistoryForServer(nextMessages)
        const result = await chatStream({
          data: {
            messages: requestMessages.map((message) => ({
              role: message.role,
              content: message.content,
              ...(message.guest ? { guest: message.guest } : {}),
            })),
            fingerprint: thumbmark.thumbmark,
            guests,
          },
        })

        if ('error' in result) {
          // 请求在真正开始流式输出前就被拒了：把这条用户消息撤回，
          // 内容放回输入框，避免白扣客户端的额度显示。
          failedBeforeStream = true
          setInput(content)
          showError(result.error)
          return
        }

        // 服务端已经接受这一轮，按宾客数扣显示额度（单聊 1 点、三人桌 3 点）。
        setDailyCredits(addDailyCredits(guests.length))

        let buffer = ''
        for await (const chunk of result) {
          buffer += chunk
          let newline = buffer.indexOf('\n')
          while (newline >= 0) {
            handleLine(buffer.slice(0, newline))
            buffer = buffer.slice(newline + 1)
            newline = buffer.indexOf('\n')
          }
        }
        if (buffer.trim()) handleLine(buffer)
        finalizeCurrent()
      } catch (error) {
        // 上游/网络失败是预期状态，用 warn 记录，避免在控制台留下 error。
        console.warn('Night banquet request failed:', error)
        finalizeCurrent()
        showError('UPSTREAM_ERROR')
      } finally {
        const baseMessages = failedBeforeStream ? history : nextMessages
        const finalMessages = [...baseMessages, ...generated]
        setMessages(finalMessages)
        persistSession(guests, finalMessages)
        setIsStreaming(false)
        setActiveMessageId(null)
        if (streamError) showError(streamError)
      }
    },
    [guests, showError],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const content = input.trim()
    if (!content || isStreaming || limited || view !== 'chat') return
    void send(content, messages)
  }

  const retry = () => {
    const attempt = lastAttemptRef.current
    if (!attempt || isStreaming || limited || attempt.guests.join('|') !== guests.join('|')) return
    void send(attempt.content, attempt.history)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const clearHistory = () => {
    clearSession(guests)
    setMessages([])
    setErrorText(null)
    setConfirmClear(false)
    setMenuOpen(false)
    lastAttemptRef.current = null
    setActiveMessageId(null)
    if (confirmClearTimerRef.current) clearTimeout(confirmClearTimerRef.current)
  }

  const askClear = () => {
    setConfirmClear(true)
    if (confirmClearTimerRef.current) clearTimeout(confirmClearTimerRef.current)
    confirmClearTimerRef.current = setTimeout(() => setConfirmClear(false), 4000)
  }

  const cancelClear = () => {
    setConfirmClear(false)
    if (confirmClearTimerRef.current) clearTimeout(confirmClearTimerRef.current)
  }

  const toggleMenu = () => {
    setMenuOpen((open) => !open)
    if (menuOpen) {
      setConfirmClear(false)
      if (confirmClearTimerRef.current) clearTimeout(confirmClearTimerRef.current)
    }
  }

  return (
    <div className="ni-chat">
      <div className="ch-shell">
        <header className="ch-head">
          <div className="ch-head-ident">
            <div className="ch-session">
              <span className="ch-session-dot" aria-hidden="true" />
              <span className="ch-mono">{t('title')}</span>
              <span className="ch-mono ch-session-sep ch-meta-session" aria-hidden="true">
                /
              </span>
              <span className="ch-mono ch-session-date ch-meta-session">Table {displayDate}</span>
              {view === 'chat' && (
                <>
                  <span className="ch-mono ch-session-sep ch-meta-rounds" aria-hidden="true">
                    /
                  </span>
                  <span className="ch-mono ch-meta-rounds">
                    Quota {creditsLabel} / {DAILY_CREDIT_LIMIT}
                  </span>
                </>
              )}
            </div>
            <div className="ch-title-row">
              <h1 className="ch-title">{t('title')}</h1>
              <span className="ch-sub">{t('subtitle')}</span>
            </div>
            {hydrated && view === 'chat' && guests.length > 0 && (
              <div className="ch-table">
                {guests.map((id, index) => {
                  const guest = getGuest(id)
                  return (
                    <span className={cn('ch-table-guest', speakingGuest === id && 'is-speaking')} key={id}>
                      <span className="ch-mono ch-table-index">{String(index + 1).padStart(2, '0')}</span>
                      <GuestMark guest={guest} size="sm" />
                      <span>{guestName(guest, locale, true)}</span>
                    </span>
                  )
                })}
                <span className="ch-mono ch-table-quota">
                  Quota {creditsLabel} / {DAILY_CREDIT_LIMIT}
                </span>
                <button type="button" className="ch-table-change" onClick={openLobby} disabled={isStreaming}>
                  {t('changeTable')} ↻
                </button>
              </div>
            )}
          </div>
          <div className="ch-head-meta">
            <span className={cn('ch-status', status.className)}>
              <span className="ch-status-dot" aria-hidden="true" />
              {status.label}
            </span>
            {hydrated && view === 'chat' && (
              <div className="ch-menu" ref={menuRef}>
                <button
                  type="button"
                  className="ch-menu-btn"
                  onClick={toggleMenu}
                  aria-label={t('menu')}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  disabled={isStreaming}
                >
                  <MoreVertical size={15} strokeWidth={1.7} />
                </button>
                {menuOpen && (
                  <div className="ch-menu-panel" role="menu">
                    <button type="button" className="ch-menu-item" role="menuitem" onClick={openLobby}>
                      {t('changeTable')}
                    </button>
                    {confirmClear ? (
                      <>
                        <button type="button" className="ch-menu-item danger" role="menuitem" onClick={clearHistory}>
                          {t('clearConfirm')}
                        </button>
                        <button type="button" className="ch-menu-item" role="menuitem" onClick={cancelClear}>
                          {t('clearCancel')}
                        </button>
                      </>
                    ) : (
                      <button type="button" className="ch-menu-item danger" role="menuitem" onClick={askClear}>
                        {t('clear')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <div ref={bodyRef} className="ch-body" aria-busy={isStreaming}>
          {!hydrated ? (
            <p className="ch-loading ch-mono">SETTING THE TABLE…</p>
          ) : view === 'lobby' ? (
            <GuestPicker selected={draftGuests} onToggle={toggleGuest} onPreset={choosePreset} t={t} locale={locale} />
          ) : (
            <>
              {messages.length === 0 && (
                <div className="ch-empty ch-empty--table">
                  <div className="ch-empty-top">
                    <span className="ch-empty-mark" aria-hidden="true" />
                    <span className="ch-mono">Table {displayDate}</span>
                    <span className="ch-empty-line" aria-hidden="true" />
                    <span className="ch-mono">
                      {guests.length === 1 ? 'One on one' : `Round table · ${guests.length}`}
                    </span>
                  </div>
                  <p className="ch-empty-text">{t('emptyText')}</p>
                  <div className="ch-starters">
                    {(['starter1', 'starter2', 'starter3'] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className="ch-starter"
                        onClick={() => {
                          setInput(t(key))
                          inputRef.current?.focus()
                        }}
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                  <div className="ch-empty-meta">
                    <span className="ch-mono">{t('privacyShort')}</span>
                    <span className="ch-mono">{t('localOnly')}</span>
                  </div>
                </div>
              )}

              {messages.length > 0 && (
                <ol className="ch-thread">
                  {messages.map((message) => {
                    const guest = message.role === 'assistant' && message.guest ? getGuest(message.guest) : null
                    const isLive = message.id === activeMessageId
                    return (
                      <li
                        key={message.id}
                        className={cn('ch-msg', message.role === 'user' ? 'ch-msg--user' : 'ch-msg--assistant')}
                      >
                        {message.role === 'user' ? (
                          <span className="ch-msg-label">{t('you')}</span>
                        ) : guest ? (
                          <span className="ch-msg-head">
                            <GuestMark guest={guest} size="sm" />
                            <span className="ch-msg-name">{guestName(guest, locale, true)}</span>
                            <span className="ch-mono ch-msg-field">{localizedText(guest.field, locale)}</span>
                            <span className="ch-mono ch-msg-ai">{t('aiTag')}</span>
                            {isLive && <span className="ch-mono ch-msg-live">{t('speaking')}</span>}
                          </span>
                        ) : (
                          <span className="ch-msg-label">{t('guest')}</span>
                        )}
                        <div className="ch-bubble">
                          {message.content}
                          {isLive &&
                            (message.content === '' ? (
                              <Typing label={t('thinking')} />
                            ) : (
                              <span className="ch-caret" aria-hidden="true" />
                            ))}
                        </div>
                      </li>
                    )
                  })}
                  {isStreaming &&
                    !activeMessageId &&
                    messages.length > 0 &&
                    messages[messages.length - 1]?.role === 'user' && (
                      <li className="ch-msg ch-msg--assistant ch-msg--pending">
                        <span className="ch-msg-label ch-mono">{t('settingTable')}</span>
                        <div className="ch-bubble">
                          <Typing label={t('thinking')} />
                        </div>
                      </li>
                    )}
                </ol>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="ch-dock">
          {hydrated && view === 'lobby' ? (
            <div className="ch-tray">
              <div className="ch-tray-info">
                <span className="ch-mono ch-tray-count" aria-live="polite">
                  {t('tableCount', { count: draftGuests.length, max: MAX_TABLE_GUESTS })}
                </span>
                {draftGuests.length > 0 && (
                  <span className="ch-mono ch-tray-cost">{t('roundCost', { cost: draftGuests.length })}</span>
                )}
                <span className="ch-mono ch-tray-quota">
                  Quota {creditsLabel} / {DAILY_CREDIT_LIMIT}
                </span>
                {limited && <span className="ch-tray-limit">{errorText ?? t('errors.dailyLimit')}</span>}
                <div className="ch-tray-chips">
                  {draftGuests.length === 0 ? (
                    <span className="ch-tray-empty">{t('startHint')}</span>
                  ) : (
                    draftGuests.map((id, index) => {
                      const guest = getGuest(id)
                      return (
                        <button
                          key={id}
                          type="button"
                          className="ch-tray-chip"
                          onClick={() => toggleGuest(id)}
                          aria-label={t('removeGuest', { name: guestName(guest, locale, true) })}
                        >
                          <span className="ch-mono">0{index + 1}</span>
                          {guestName(guest, locale, true)}
                          <span aria-hidden="true">×</span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
              <button
                type="button"
                className="ch-start"
                disabled={draftGuests.length === 0 || limited}
                onClick={() => startTable(draftGuests)}
              >
                {t('start')} <span aria-hidden="true">↗</span>
              </button>
            </div>
          ) : hydrated && view === 'chat' ? (
            <>
              {(errorText || limited) && (
                <div className="ch-notice" role="alert">
                  <div className="ch-notice-main">
                    <span className="ch-notice-label">{limited ? t('limitLabel') : t('noticeLabel')}</span>
                    <p className="ch-notice-text">{errorText ?? t('errors.dailyLimit')}</p>
                  </div>
                  {!limited && canRetry && (
                    <button type="button" className="ch-retry" onClick={retry} disabled={isStreaming}>
                      {t('retry')} ↻
                    </button>
                  )}
                </div>
              )}

              {messages.length === 0 && (
                <p className="ch-privacy">
                  {t('privacyNote')} <Link href="/about">{t('privacySource')}</Link>
                </p>
              )}

              <form onSubmit={handleSubmit} className="ch-composer">
                <div className="ch-field">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    maxLength={MAX_INPUT_LENGTH}
                    disabled={isStreaming || limited}
                    enterKeyHint="send"
                    className="ch-input"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={isStreaming || limited || !input.trim()}
                    className="ch-send"
                    aria-label={isStreaming ? t('sending') : t('send')}
                  >
                    {isStreaming ? (
                      <span className="ch-send-busy" aria-hidden="true" />
                    ) : (
                      <Send size={15} strokeWidth={1.9} />
                    )}
                  </button>
                </div>
                <div className="ch-hint">
                  <span className="ch-mono ch-hint-tip">{sendHint}</span>
                  <span className="ch-mono ch-hint-count">
                    {input.length} / {MAX_INPUT_LENGTH}
                  </span>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
