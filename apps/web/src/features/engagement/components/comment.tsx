import {
  addComment,
  getCommentCount,
  getComments,
  getRemainingComments,
} from '@/src/features/engagement/server-functions'
import type { CommentWithReplies } from '@/src/features/engagement/model'
import { useTranslations } from '@/src/i18n/client'
import { getThumbmark } from '@thumbmarkjs/thumbmarkjs'
import { AlertCircle, Clock, MessageCircle, Reply, Send, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface CommentProps {
  slug: string
  locale: string
}

interface CommentItemProps {
  comment: CommentWithReplies
  locale: string
  depth: number
  remaining: number | null
  replyingTo: number | null
  replyContent: string
  isReplying: boolean
  replyError: string | null
  onReply: (commentId: number) => void
  onReplyContentChange: (content: string) => void
  onReplySubmit: (e: React.FormEvent, parentId: number) => void
  onCancelReply: () => void
  onRefresh?: () => Promise<void>
}

function formatDate(date: Date, locale: string): string {
  const d = new Date(date)
  return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * CommentItem — 递归渲染单条评论及其所有子回复
 *
 * 【算法复杂度】
 * - 时间复杂度: O(n)，其中 n 为该子树中的评论总数。
 *   每次递归调用处理一个节点，所有节点恰好被访问一次。
 * - 空间复杂度: O(h)，其中 h 为该子树的最大深度（递归调用栈深度）。
 *   由于使用 Map 在父组件构建树结构，此处无需额外查找开销。
 *
 * 【参数说明】
 * @param comment - 当前要渲染的评论节点（包含嵌套的 replies 数组）
 * @param locale - 用于格式化日期的语言环境
 * @param depth - 当前节点在树中的层级深度（根为 0），用于计算缩进
 * @param remaining - 用户今日剩余评论次数，控制是否显示回复按钮
 * @param replyingTo - 当前正在被回复的评论 ID（null 表示无展开的回复框）
 * @param replyContent - 回复输入框的当前内容
 * @param isReplying - 回复提交中状态（防止重复提交）
 * @param replyError - 回复提交失败时的错误信息
 * @param onReply - 打开回复框的回调，参数为被回复的评论 ID
 * @param onReplyContentChange - 回复内容变化时的回调
 * @param onReplySubmit - 提交回复表单的回调
 * @param onCancelReply - 取消回复的回调
 * @param onRefresh - 刷新评论列表的回调（提交成功后调用）
 *
 * 【UI 结构】
 *  - 左侧竖线连接线（depth > 0 时显示），模拟树形结构
 *  - 评论内容：指纹 + 时间戳 + HTML 安全内容
 *  - 回复按钮（hover 显示）
 *  - 回复表单（仅当 replyingTo === 当前评论 ID 时展开）
 *  - 子回复列表（递归调用 CommentItem，depth + 1）
 */
function CommentItem({
  comment,
  locale,
  depth,
  remaining,
  replyingTo,
  replyContent,
  isReplying,
  replyError,
  onReply,
  onReplyContentChange,
  onReplySubmit,
  onCancelReply,
}: CommentItemProps) {
  const t = useTranslations('Comment')

  // 【缩进计算】每层深度增加 16px，最大 64px 防止太靠右
  // 时间复杂度: O(1)
  // 空间复杂度: O(1)
  const indentPx = Math.min(depth * 16, 64)

  return (
    <div className="relative">
      {/* 【左侧连接线】仅在子回复层（depth > 0）显示，视觉上连接父子节点 */}
      {depth > 0 && <div className="absolute top-0 h-full w-px bg-border" style={{ left: `${indentPx - 8}px` }} />}

      {/* 【评论卡片主体】根据深度应用左侧缩进 */}
      <div
        className="cut-card border border-border bg-card p-4"
        style={{ marginLeft: depth > 0 ? `${indentPx}px` : '0' }}
      >
        {/* 评论元信息：指纹（后10位）+ 格式化时间 */}
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{comment.fingerprint.slice(-10)}</span>
          <span>{formatDate(comment.createdAt, locale)}</span>
        </div>

        {/* 评论正文：dangerouslySetInnerHTML 输出经 escapeHtml 转义的安全内容 */}
        <div className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: comment.content }} />

        {/* 【回复按钮】剩余次数 > 0 时显示，hover 变为 primary 颜色 */}
        {remaining !== null && remaining > 0 && (
          <button
            onClick={() => onReply(comment.id)}
            className="mt-2 flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <Reply className="size-3" />
            {t('reply')}
          </button>
        )}

        {/* 【回复表单】仅在当前评论是被回复目标时展开（replyingTo === comment.id） */}
        {replyingTo === comment.id && (
          <form onSubmit={(e) => onReplySubmit(e, comment.id)} className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              placeholder={t('replyPlaceholder')}
              maxLength={1000}
              disabled={isReplying}
              autoFocus
              className="min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{replyContent.length}/1000</span>
              <div className="flex gap-2">
                {/* 取消按钮：关闭回复框，清空内容 */}
                <button
                  type="button"
                  onClick={onCancelReply}
                  className="flex cursor-pointer items-center gap-1 px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-3" />
                  {t('cancel')}
                </button>
                {/* 提交按钮：disabled 当内容为空或提交中 */}
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isReplying}
                  className="flex cursor-pointer items-center gap-1 px-2 py-1 text-xs text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
                >
                  <Send className="size-3" />
                  {isReplying ? t('submitting') : t('submit')}
                </button>
              </div>
            </div>
            {/* 错误提示 */}
            {replyError && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                <AlertCircle className="size-3 shrink-0" />
                {replyError}
              </div>
            )}
          </form>
        )}

        {/* 【递归子回复】如果有子回复，递归渲染；每层 depth + 1 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply as CommentWithReplies}
                locale={locale}
                depth={depth + 1}
                remaining={remaining}
                replyingTo={replyingTo}
                replyContent={replyContent}
                isReplying={isReplying}
                replyError={replyError}
                onReply={onReply}
                onReplyContentChange={onReplyContentChange}
                onReplySubmit={onReplySubmit}
                onCancelReply={onCancelReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function Comment({ slug, locale }: CommentProps) {
  const t = useTranslations('Comment')
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 回复表单状态（全局单一表单）
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [replySuccess, setReplySuccess] = useState(false)

  const refreshComments = useCallback(async () => {
    const [loadedComments, commentCount] = await Promise.all([
      getComments({ data: { slug } }),
      getCommentCount({ data: { slug } }),
    ])
    setComments(loadedComments)
    setCount(commentCount)
  }, [slug])

  useEffect(() => {
    const init = async () => {
      try {
        await refreshComments()

        const response = await getThumbmark()
        const remainingCount = await getRemainingComments({
          data: { slug, fingerprint: response.thumbmark },
        })
        setRemaining(remainingCount)
      } catch (err) {
        console.error('Failed to load comment data:', err)
        setCount(0)
        setRemaining(5)
      }
    }
    init()
  }, [slug, refreshComments])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!content.trim() || isSubmitting) return

      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      try {
        const response = await getThumbmark()
        const fingerprint = response.thumbmark
        const result = await addComment({ data: { slug, content, fingerprint } })

        if (result.success) {
          setContent('')
          setSuccess(true)
          await refreshComments()
          setRemaining(result.remaining ?? 0)
          setTimeout(() => setSuccess(false), 3000)
        } else {
          setError(result.error || t('error'))
        }
      } catch {
        setError(t('error'))
      } finally {
        setIsSubmitting(false)
      }
    },
    [content, isSubmitting, slug, t, refreshComments],
  )

  const handleReplySubmit = useCallback(
    async (e: React.FormEvent, parentId: number) => {
      e.preventDefault()
      if (!replyContent.trim() || isReplying) return

      setIsReplying(true)
      setReplyError(null)
      setReplySuccess(false)

      try {
        const response = await getThumbmark()
        const fingerprint = response.thumbmark
        const result = await addComment({
          data: { slug, content: replyContent, fingerprint, parentId },
        })

        if (result.success) {
          setReplyContent('')
          setReplyingTo(null)
          setReplySuccess(true)
          await refreshComments()
          setRemaining(result.remaining ?? 0)
          setTimeout(() => setReplySuccess(false), 3000)
        } else {
          setReplyError(result.error || t('error'))
        }
      } catch {
        setReplyError(t('error'))
      } finally {
        setIsReplying(false)
      }
    },
    [replyContent, isReplying, slug, t, refreshComments],
  )

  const cancelReply = useCallback(() => {
    setReplyingTo(null)
    setReplyContent('')
    setReplyError(null)
  }, [])

  const openReply = useCallback((commentId: number) => {
    setReplyingTo(commentId)
    setReplyContent('')
    setReplyError(null)
  }, [])

  return (
    <div className="mt-12 border-t border-border pt-8">
      <div className="mb-6 flex items-center gap-2">
        <MessageCircle className="size-6 text-primary" />
        <h2 className="text-2xl font-bold">
          {t('title')}
          {count !== null && <span className="ml-2 text-lg font-normal text-muted-foreground">({count})</span>}
        </h2>
      </div>

      {/* 固定的评论表单，只生产老汉儿 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('placeholder')}
            maxLength={1000}
            disabled={isSubmitting || remaining === 0}
            className="min-h-30 w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{content.length}/1000</span>
            {remaining !== null && remaining < 5 && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {remaining === 0 ? t('noRemaining') : t('remaining', { count: remaining })}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
            {t('success')}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting || remaining === 0}
            className="btn btn-p"
            style={{ fontSize: 12, padding: '8px 20px' }}
          >
            <Send className="size-4" />
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>

      {/* Reply Success Message */}
      {replySuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
          {t('replySuccess')}
        </div>
      )}

      {/* Comments List */}
      {count !== null && count > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              locale={locale}
              depth={0}
              remaining={remaining}
              replyingTo={replyingTo}
              replyContent={replyContent}
              isReplying={isReplying}
              replyError={replyError}
              onReply={openReply}
              onReplyContentChange={setReplyContent}
              onReplySubmit={handleReplySubmit}
              onCancelReply={cancelReply}
              onRefresh={refreshComments}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      )}
    </div>
  )
}
