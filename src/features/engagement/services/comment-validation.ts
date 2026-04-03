const MAX_COMMENT_LENGTH = 1000
const MAX_COMMENTS_PER_DAY = 5

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

export const engagementRules = {
  maxCommentLength: MAX_COMMENT_LENGTH,
  maxCommentsPerDay: MAX_COMMENTS_PER_DAY,
}
