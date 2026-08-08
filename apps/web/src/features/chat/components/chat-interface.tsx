import { useState, useRef, useEffect, useCallback } from 'react'
import { chatStream } from '@/src/features/chat/server-functions'
import type { ChatErrorCode } from '@/src/features/chat/services/chat-stream.server'
import { useTranslations } from '@/src/i18n/client'
import { getThumbmark } from '@thumbmarkjs/thumbmarkjs'
import { Send } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_PREFIX = 'maxzhang.chat.'
const DAILY_ROUND_LIMIT = 100

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
  // 会话只在客户端挂载后从 localStorage 加载，避免 SSR 空状态与客户端
  // 历史会话不一致导致的 hydration mismatch。
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isLimited, setIsLimited] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fullContentRef = useRef('')
  const displayIndexRef = useRef(0)
  const messageIdRef = useRef<string | null>(null)

  const rounds = messages.filter((message) => message.role === 'user').length
  const limited = isLimited || rounds >= DAILY_ROUND_LIMIT

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const saved = loadTodaySession()
    if (saved.length > 0) {
      setMessages(saved)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = input.trim()
    if (!content || isStreaming || limited) return

    setErrorText(null)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }
    const nextMessages = [...messages, userMessage]
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
      console.error('Error:', error)
      clearTypewriter()
      setMessages((prev) => prev.filter((message) => message.id !== assistantMessage.id))
      setErrorText(t('errors.networkError'))
      persistSession(nextMessages)
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="chat-shell flex h-full flex-col">
      <div className="section-head">
        <h1 className="section-title">{t('title')}</h1>
        <div className="section-line"></div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && <div className="empty-state">{t('emptyState')}</div>}
        {messages.map((message) => (
          <div key={message.id} className={`chat-bubble ${message.role}`}>
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {(errorText || limited) && <div className="chat-error">{errorText ?? t('errors.dailyLimit')}</div>}

      <form onSubmit={handleSubmit} className="chat-input-shell">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          disabled={isStreaming || limited}
          className="chat-input"
          rows={1}
        />
        <button
          type="submit"
          disabled={isStreaming || limited || !input.trim()}
          className="chat-send"
          aria-label={t('send')}
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  )
}
