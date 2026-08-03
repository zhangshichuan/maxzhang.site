export { Comment } from './components'
export { CommentDisplay } from './components'
export { ViewCounter } from './components'
export { ViewDisplay } from './components'
export {
  getCommentCount,
  getCommentCounts,
  getComments,
  getRemainingComments,
  getViewCount,
  getViewCounts,
} from './queries'
export { addComment, incrementView } from './server-functions'
export type { Comment as CommentModel, CommentWithReplies } from './model'
