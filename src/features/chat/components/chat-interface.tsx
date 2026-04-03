'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { chatStream } from '@/src/features/chat/server-actions'
import type { ChatErrorCode } from '@/src/features/chat/services/chat-stream'
import { getThumbmark } from '@thumbmarkjs/thumbmarkjs'
import { useTranslations } from 'next-intl'

/**
 * 消息结构体
 * @interface Message
 */
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

/**
 * 错误码到翻译 key 的映射
 * 将 Server Action 返回的错误码映射到 i18n 翻译文件中的 key
 */
const ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  INVALID_FINGERPRINT: 'invalidFingerprint',
  RATE_LIMIT: 'rateLimit',
  MESSAGE_TOO_LONG: 'messageTooLong',
  INVALID_MESSAGE: 'networkError',
  UPSTREAM_ERROR: 'upstreamError',
}

/**
 * 聊天组件
 * 支持流式响应的打字机效果
 * - SSE 流式接收后端数据
 * - 实时打字机动画展示
 * - 频率限制与指纹验证
 * - 完整的国际化支持
 */
export function ChatInterface() {
  const t = useTranslations('Chat')

  // 消息列表状态
  const [messages, setMessages] = useState<Message[]>([])
  // 输入框内容
  const [input, setInput] = useState('')
  // 是否正在流式接收数据
  const [isStreaming, setIsStreaming] = useState(false)

  // DOM 引用
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 打字机动画相关 refs
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  /** 完整的累积内容（所有 SSE 返回的内容累加） */
  const fullContentRef = useRef('')
  /** 当前打字机显示到的位置索引 */
  const displayIndexRef = useRef(0)
  /** 当前正在打字的消息 ID */
  const messageIdRef = useRef<string | null>(null)

  /**
   * 滚动到底部
   * 每当消息列表变化时自动滚动到最新消息
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * 清除打字机定时器
   */
  const clearTypewriter = useCallback(() => {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }
  }, [])

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => clearTypewriter()
  }, [clearTypewriter])

  /**
   * 打字机 tick 函数
   * 每隔一段时间（12ms）增加显示索引，更新 UI
   * @param id - 消息 ID，用于定位要更新的是哪条消息
   */
  const tick = useCallback(
    (id: string) => {
      // 如果还没显示到完整内容，继续显示下一个字符
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
        // 内容显示完毕，停止打字机
        clearTypewriter()
      }
    },
    [clearTypewriter],
  )

  /**
   * 启动打字机动画
   * 每次新内容到达时会调用此函数，从当前位置继续打字
   * @param id - 消息 ID
   */
  const startTypewriter = useCallback(
    (id: string) => {
      // 先清除之前的定时器
      clearTypewriter()

      // 如果是新的消息，重置显示索引
      if (messageIdRef.current !== id) {
        messageIdRef.current = id
        displayIndexRef.current = 0
      }

      // 如果还有未显示的内容，启动打字机
      if (displayIndexRef.current < fullContentRef.current.length) {
        typewriterRef.current = setInterval(() => tick(id), 12)
      }
    },
    [clearTypewriter, tick],
  )

  /**
   * 设置错误消息
   * 根据错误码从翻译文件中获取对应的错误信息
   * @param errorCode - 错误码
   */
  const setError = useCallback(
    (errorCode: ChatErrorCode) => {
      clearTypewriter()
      setMessages((prev) => {
        const updated = [...prev]
        const lastMsg = updated[updated.length - 1]
        if (lastMsg?.id === messageIdRef.current) {
          if (errorCode === 'MESSAGE_TOO_LONG') {
            // 消息过长错误需要传入最大字符数参数
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

  /**
   * 提交消息处理
   * 1. 获取浏览器指纹
   * 2. 调用 Server Action 获取流
   * 3. 解析 SSE 数据并触发打字机动画
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    // 创建用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    // 创建助手消息占位
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    }
    setMessages((prev) => [...prev, assistantMessage])

    // 重置 refs
    fullContentRef.current = ''
    displayIndexRef.current = 0
    messageIdRef.current = assistantMessage.id

    try {
      // 获取浏览器指纹
      const thumbmark = await getThumbmark()
      // 调用 Server Action（会在内部验证指纹和频率限制）
      const result = await chatStream(userMessage.content, thumbmark.thumbmark)

      // 如果返回的是错误对象，处理错误
      if ('error' in result) {
        setError(result.error)
        setIsStreaming(false)
        return
      }

      // 开始读取流数据
      const reader = result.getReader()
      const decoder = new TextDecoder()
      // SSE 缓冲区，处理跨 chunk 的不完整数据
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 解码数据块并追加到缓冲区
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // 解析 SSE 格式: "data: content\n\n"
        // 可能一次收到多个事件，需要循环处理
        let contentStart = 0
        while (true) {
          // 查找 data: 前缀
          const dataIndex = buffer.indexOf('data: ', contentStart)
          if (dataIndex === -1) break

          // 查找行尾（换行符）
          const lineEnd = buffer.indexOf('\n', dataIndex)
          if (lineEnd === -1) break

          // 提取内容（去掉 "data: " 前缀）
          const content = buffer.slice(dataIndex + 6, lineEnd)
          // 保留剩余的缓冲区内容供下次处理
          buffer = buffer.slice(lineEnd + 1)
          contentStart = 0

          // 累积到完整内容
          fullContentRef.current += content
          // 触发打字机从当前位置继续显示
          startTypewriter(assistantMessage.id)
        }
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

  /**
   * 键盘事件处理
   * Enter 提交消息，Shift+Enter 换行
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* 消息列表区域 */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.length === 0 && <div className="py-20 text-center text-muted-foreground">{t('emptyState')}</div>}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              <pre className="font-sans text-sm whitespace-pre-wrap">{message.content}</pre>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入表单 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          disabled={isStreaming}
          className="max-h-50 min-h-11 flex-1 resize-none rounded-lg border bg-background px-4 py-3"
          rows={1}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isStreaming ? t('sending') : t('send')}
        </button>
      </form>
    </div>
  )
}
