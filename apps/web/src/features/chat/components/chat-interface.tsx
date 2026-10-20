import '@/src/styles/paper-chat.css'
import { useState, useRef, useEffect, useCallback } from 'react'
import { chatStream } from '@/src/features/chat/server-functions'
import type { ChatErrorCode } from '@/src/features/chat/services/chat-stream.server'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import { getThumbmark } from '@thumbmarkjs/thumbmarkjs'
import { MoreVertical, Send } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_PREFIX = 'maxzhang.chat.'
const DAILY_ROUND_LIMIT = 100
const MAX_INPUT_LENGTH = 2000

const ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  INVALID_FINGERPRINT: 'invalidFingerprint',
  RATE_LIMIT: 'rateLimit',
  DAILY_LIMIT: 'dailyLimit',
  SERVICE_DAILY_LIMIT: 'serviceDailyLimit',
  MESSAGE_TOO_LONG: 'messageTooLong',
  INVALID_MESSAGE: 'networkError',
  UPSTREAM_ERROR: 'upstreamError',
}

/** 本地日期 key（YYYY-MM-DD） */
const localDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const sessionKey = (date: string) => `${STORAGE_PREFIX}${date}`

/** 清理 3 天前的会话（只保留最近 3 天） */
const pruneOldSessions = () => {
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const cutoff = localDateKey(twoDaysAgo)
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith(STORAGE_PREFIX)) continue
    if (key.slice(STORAGE_PREFIX.length) < cutoff) {
      localStorage.removeItem(key)
    }
  }
}

/** 读取今天的会话；空助手消息（流式中断残留）会被过滤 */
const loadTodaySession = (): Message[] => {
  try {
    pruneOldSessions()
    const raw = localStorage.getItem(sessionKey(localDateKey()))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (message): message is Message =>
        typeof message === 'object' &&
        message !== null &&
        typeof (message as Message).id === 'string' &&
        ((message as Message).role === 'user' || (message as Message).role === 'assistant') &&
        typeof (message as Message).content === 'string' &&
        (message as Message).content.trim().length > 0,
    )
  } catch {
    return []
  }
}

/** 按日期持久化会话到 localStorage */
const persistSession = (session: Message[]) => {
  try {
    localStorage.setItem(sessionKey(localDateKey()), JSON.stringify(session))
  } catch {
    // 隐私模式或存储满时静默失败
  }
}

export function ChatInterface() {
  const t = useTranslations('Chat')
  const locale = useLocale()
  // 会话只在客户端挂载后从 localStorage 加载，避免 SSR 空状态与客户端
  // 历史会话不一致导致的 hydration mismatch。
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isLimited, setIsLimited] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sessionDate, setSessionDate] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const confirmClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fullContentRef = useRef('')
  const displayIndexRef = useRef(0)
  const messageIdRef = useRef<string | null>(null)
  // 最近一次请求的上下文：出错后「重试」会用同一份历史重发，不重复用户消息。
  const lastAttemptRef = useRef<{ content: string; history: Message[] } | null>(null)

  const rounds = messages.filter((message) => message.role === 'user').length
  const limited = isLimited || rounds >= DAILY_ROUND_LIMIT

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    setSessionDate(localDateKey())
    const saved = loadTodaySession()
    if (saved.length > 0) {
      setMessages(saved)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 桌面端进入页面时自动聚焦；流式结束后也把焦点还给输入框
  // （发送期间输入框是 disabled 的，必须在重新可编辑后再聚焦）。
  // 移动端（触摸为主要指针的设备）不自动聚焦，避免每次进入/回复后
  // 都弹出输入法，由用户手动点击输入框触发。
  useEffect(() => {
    if (!isStreaming && !limited && !window.matchMedia('(pointer: coarse)').matches) {
      inputRef.current?.focus()
    }
  }, [isStreaming, limited])

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

  const clearTypewriter = useCallback(() => {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTypewriter()
  }, [clearTypewriter])

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

  const tick = useCallback(
    (id: string) => {
      if (displayIndexRef.current < fullContentRef.current.length) {
        displayIndexRef.current += 1
        setMessages((prev) => {
          const updated = [...prev]
          const target = updated.find((m) => m.id === id)
          if (target) {
            target.content = fullContentRef.current.slice(0, displayIndexRef.current)
          }
          return updated
        })
      } else {
        clearTypewriter()
      }
    },
    [clearTypewriter],
  )

  const startTypewriter = useCallback(
    (id: string) => {
      clearTypewriter()
      if (messageIdRef.current !== id) {
        messageIdRef.current = id
        displayIndexRef.current = 0
      }
      if (displayIndexRef.current < fullContentRef.current.length) {
        typewriterRef.current = setInterval(() => tick(id), 12)
      }
    },
    [clearTypewriter, tick],
  )

  const showError = useCallback(
    (errorCode: ChatErrorCode) => {
      clearTypewriter()
      setMessages((prev) => prev.filter((message) => message.id !== messageIdRef.current))
      setErrorText(t(`errors.${ERROR_MESSAGES[errorCode]}`))
      if (errorCode === 'DAILY_LIMIT') {
        setIsLimited(true)
      }
    },
    [clearTypewriter, t],
  )

  /**
   * 发送一轮对话：SSE 流式逻辑与原来保持一致，抽成独立函数，
   * 供表单提交与「重试」复用（重试复用出错那次的历史，不产生重复消息）。
   */
  const send = useCallback(
    async (content: string, history: Message[]) => {
      setErrorText(null)
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
      }
      const nextMessages = [...history, userMessage]
      lastAttemptRef.current = { content, history }
      setMessages(nextMessages)
      persistSession(nextMessages)
      setInput('')
      setIsStreaming(true)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      }
      setMessages((prev) => [...prev, assistantMessage])

      fullContentRef.current = ''
      displayIndexRef.current = 0
      messageIdRef.current = assistantMessage.id

      try {
        const thumbmark = await getThumbmark()
        const result = await chatStream({
          data: {
            messages: nextMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            fingerprint: thumbmark.thumbmark,
          },
        })

        if ('error' in result) {
          showError(result.error)
          persistSession(nextMessages)
          setIsStreaming(false)
          return
        }

        for await (const chunk of result) {
          fullContentRef.current += chunk
          startTypewriter(assistantMessage.id)
        }
        persistSession([...nextMessages, { ...assistantMessage, content: fullContentRef.current }])
      } catch (error) {
        // 上游/网络失败是预期状态，用 warn 记录，避免在控制台留下 error。
        console.warn('Chat request failed:', error)
        clearTypewriter()
        setMessages((prev) => prev.filter((message) => message.id !== assistantMessage.id))
        setErrorText(t('errors.networkError'))
        persistSession(nextMessages)
      } finally {
        setIsStreaming(false)
      }
    },
    [clearTypewriter, showError, startTypewriter, t],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const content = input.trim()
    if (!content || isStreaming || limited) return
    void send(content, messages)
  }

  const retry = () => {
    const attempt = lastAttemptRef.current
    if (!attempt || isStreaming || limited) return
    void send(attempt.content, attempt.history)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const clearHistory = () => {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index)
      if (key?.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key)
    }
    setMessages([])
    setErrorText(null)
    setConfirmClear(false)
    setMenuOpen(false)
    lastAttemptRef.current = null
    messageIdRef.current = null
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

  const displayDate = sessionDate ? sessionDate.replace(/-/g, '.') : '----.--.--'
  const roundsLabel = String(rounds).padStart(2, '0')
  const streamingId = isStreaming ? messageIdRef.current : null
  const sendHint = locale === 'zh' ? 'ENTER 发送 · SHIFT+ENTER 换行' : 'ENTER TO SEND · SHIFT+ENTER FOR NEWLINE'

  const status = limited
    ? { key: 'limit', label: 'LIMIT' }
    : isStreaming
      ? { key: 'live', label: 'LISTENING' }
      : errorText
        ? { key: 'notice', label: 'NOTICE' }
        : { key: 'ready', label: 'READY' }

  return (
    <div className="ch-page">
      <div className="ch-shell">
        <header className="ch-head">
          <div className="ch-head-ident">
            <div className="ch-session">
              <span className="ch-session-dot" aria-hidden="true" />
              <span className="ch-mono">Tree Hole</span>
              <span className="ch-mono ch-session-sep ch-meta-session" aria-hidden="true">
                /
              </span>
              <span className="ch-mono ch-session-date ch-meta-session">Session {displayDate}</span>
              <span className="ch-mono ch-session-sep ch-meta-rounds" aria-hidden="true">
                /
              </span>
              <span className="ch-mono ch-meta-rounds">
                Round {roundsLabel} / {DAILY_ROUND_LIMIT}
              </span>
            </div>
            <div className="ch-title-row">
              <h1 className="ch-title">{t('title')}</h1>
              <span className="ch-sub">{t('subtitle')}</span>
            </div>
          </div>
          <div className="ch-head-meta">
            <span className={`ch-status ch-status--${status.key}`}>
              <span className="ch-status-dot" aria-hidden="true" />
              {status.label}
            </span>
            {messages.length > 0 && (
              <div className="ch-menu" ref={menuRef}>
                <button
                  type="button"
                  className="ch-menu-btn"
                  onClick={toggleMenu}
                  aria-label={t('menu')}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <MoreVertical size={15} strokeWidth={1.7} />
                </button>
                {menuOpen && (
                  <div className="ch-menu-panel" role="menu">
                    {confirmClear ? (
                      <>
                        <button
                          type="button"
                          className="ch-menu-item danger"
                          role="menuitem"
                          onClick={clearHistory}
                        >
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

        <div className="ch-body" aria-busy={isStreaming}>
          {messages.length === 0 && (
            <div className="ch-empty">
              <div className="ch-empty-top">
                <span className="ch-empty-mark" aria-hidden="true" />
                <span className="ch-mono">Listening Session</span>
                <span className="ch-empty-line" aria-hidden="true" />
                <span className="ch-mono">{displayDate}</span>
              </div>
              <p className="ch-empty-text">{t('emptyState')}</p>
              <div className="ch-empty-meta">
                <span className="ch-mono">No messages yet</span>
                <span className="ch-mono">Local only</span>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <ol className="ch-thread">
              {messages.map((message) => {
                const isLive = streamingId !== null && message.id === streamingId
                return (
                  <li key={message.id} className={`ch-msg ch-msg--${message.role}`}>
                    <span className="ch-msg-label">
                      {message.role === 'user' ? 'You' : isLive ? 'Listening' : 'Tree Hole'}
                    </span>
                    <div className="ch-bubble">
                      {message.content}
                      {isLive &&
                        (message.content === '' ? (
                          <span className="ch-typing" aria-label={t('sending')}>
                            <i />
                            <i />
                            <i />
                          </span>
                        ) : (
                          <span className="ch-caret" aria-hidden="true" />
                        ))}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ch-dock">
          {(errorText || limited) && (
            <div className="ch-notice" role="alert">
              <div className="ch-notice-main">
                <span className="ch-notice-label">{limited ? 'Limit' : 'Notice'}</span>
                <p className="ch-notice-text">{errorText ?? t('errors.dailyLimit')}</p>
              </div>
              {!limited && lastAttemptRef.current && (
                <button type="button" className="ch-retry" onClick={retry} disabled={isStreaming}>
                  Retry ↻
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
                placeholder={t('placeholder')}
                aria-label={t('placeholder')}
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
                {isStreaming ? <span className="ch-send-busy" aria-hidden="true" /> : <Send size={15} strokeWidth={1.9} />}
              </button>
            </div>
            <div className="ch-hint">
              <span className="ch-mono ch-hint-tip">{sendHint}</span>
              <span className="ch-mono ch-hint-count">
                {input.length} / {MAX_INPUT_LENGTH}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
