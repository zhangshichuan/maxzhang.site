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

const ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  INVALID_FINGERPRINT: 'invalidFingerprint',
  RATE_LIMIT: 'rateLimit',
  MESSAGE_TOO_LONG: 'messageTooLong',
  INVALID_MESSAGE: 'networkError',
  UPSTREAM_ERROR: 'upstreamError',
}

export function ChatInterface() {
  const t = useTranslations('Chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fullContentRef = useRef('')
  const displayIndexRef = useRef(0)
  const messageIdRef = useRef<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const setError = useCallback(
    (errorCode: ChatErrorCode) => {
      clearTypewriter()
      setMessages((prev) => {
        const updated = [...prev]
        const lastMsg = updated[updated.length - 1]
        if (lastMsg?.id === messageIdRef.current) {
          if (errorCode === 'MESSAGE_TOO_LONG') {
            lastMsg.content = t('errors.messageTooLong', { max: 2000 })
          } else {
            lastMsg.content = t(`errors.${ERROR_MESSAGES[errorCode]}`)
          }
        }
        return updated
      })
    },
    [clearTypewriter, t],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
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
        data: { message: userMessage.content, fingerprint: thumbmark.thumbmark },
      })

      if ('error' in result) {
        setError(result.error)
        setIsStreaming(false)
        return
      }

      for await (const chunk of result) {
        fullContentRef.current += chunk
        startTypewriter(assistantMessage.id)
      }
    } catch (error) {
      console.error('Error:', error)
      clearTypewriter()
      setMessages((prev) => {
        const updated = [...prev]
        const lastMsg = updated[updated.length - 1]
        if (lastMsg?.id === assistantMessage.id) {
          lastMsg.content = t('errors.networkError')
        }
        return updated
      })
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
    <div className="flex h-full flex-col">
      <div className="section-head">
        <h1 className="section-title">{t('title')}</h1>
        <div className="section-line"></div>
      </div>

      <div className="chat-messages" style={{ minHeight: 'calc(100vh - 360px)' }}>
        {messages.length === 0 && <div className="empty-state">{t('emptyState')}</div>}
        {messages.map((message) => (
          <div key={message.id} className={`chat-bubble ${message.role}`}>
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-shell">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          disabled={isStreaming}
          className="chat-input"
          rows={1}
        />
        <button type="submit" disabled={isStreaming || !input.trim()} className="chat-send" aria-label={t('send')}>
          <Send className="size-4" />
        </button>
      </form>
    </div>
  )
}
