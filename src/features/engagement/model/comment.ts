export interface Comment {
  id: number
  slug: string
  fingerprint: string
  content: string
  createdAt: Date
  parentId: number | null
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
}
