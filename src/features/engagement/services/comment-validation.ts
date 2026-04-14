/**
 * 评论验证服务
 *
 * 提供评论内容验证和互动规则管理
 */
const MAX_COMMENT_LENGTH = 1000
const MAX_COMMENTS_PER_DAY = 5

/**
 * 验证评论输入
 *
 * @param content - 评论内容
 * @param fingerprint - 用户指纹标识
 * @returns 验证结果，成功返回修剪后的内容，失败返回错误信息
 */
export function validateCommentInput(
  content: string,
  fingerprint: string,
):
  | { ok: true; trimmedContent: string }
  | {
      ok: false
      error: string
    } {
  if (!fingerprint) {
    return { ok: false, error: 'Invalid fingerprint' }
  }

  const trimmedContent = content.trim()
  if (trimmedContent.length === 0) {
    return { ok: false, error: 'Comment cannot be empty' }
  }
  if (trimmedContent.length > MAX_COMMENT_LENGTH) {
    return { ok: false, error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` }
  }

  return {
    ok: true,
    trimmedContent,
  }
}

/**
 * 互动规则配置对象
 *
 * 包含评论长度限制和每日评论数量限制等规则
 */
export const engagementRules = {
  maxCommentLength: MAX_COMMENT_LENGTH,
  maxCommentsPerDay: MAX_COMMENTS_PER_DAY,
}
