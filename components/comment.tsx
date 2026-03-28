'use client'

import { addComment, getCommentCount, getComments, getRemainingComments, type Comment } from '@/lib/actions/comments'
import { getThumbmark } from '@thumbmarkjs/thumbmarkjs'
import { AlertCircle, Clock, MessageCircle, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

interface CommentProps {
	slug: string
	locale: string
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

export function Comment({ slug, locale }: CommentProps) {
	const t = useTranslations('Comment')
	const [comments, setComments] = useState<Comment[]>([])
	const [count, setCount] = useState<number | null>(null)
	const [remaining, setRemaining] = useState<number | null>(null)
	const [content, setContent] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	useEffect(() => {
		const init = async () => {
			try {
				const [loadedComments, commentCount] = await Promise.all([getComments(slug), getCommentCount(slug)])
				setComments(loadedComments)
				setCount(commentCount)

				const response = await getThumbmark()
				const remainingCount = await getRemainingComments(slug, response.thumbmark)
				setRemaining(remainingCount)
			} catch (err) {
				console.error('Failed to load comment data:', err)
				setCount(0)
				setRemaining(5)
			}
		}
		init()
	}, [slug])

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
				const result = await addComment(slug, content, fingerprint)

				if (result.success) {
					setContent('')
					setSuccess(true)
					const updatedComments = await getComments(slug)
					setComments(updatedComments)
					setCount(updatedComments.length)
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
		[content, isSubmitting, slug, t],
	)

	return (
		<div className="mt-12 border-t border-border pt-8">
			<div className="mb-6 flex items-center gap-2">
				<MessageCircle className="size-6 text-primary" />
				<h2 className="text-2xl font-bold">
					{t('title')}
					{count !== null && <span className="ml-2 text-lg font-normal text-muted-foreground">({count})</span>}
				</h2>
			</div>

			{/* Comment Form */}
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
					<div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
						{t('success')}
					</div>
				)}

				<div className="mt-4 flex justify-end">
					<button
						type="submit"
						disabled={!content.trim() || isSubmitting || remaining === 0}
						className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Send className="size-4" />
						{isSubmitting ? t('submitting') : t('submit')}
					</button>
				</div>
			</form>

			{/* Comments List */}
			{count !== null && count > 0 ? (
				<div className="space-y-6">
					{comments.map((comment) => (
						<div key={comment.id} className="bg-card rounded-lg border border-border p-4">
							<div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
								<span>{comment.fingerprint.slice(-10)}</span>
								<span>{formatDate(comment.createdAt, locale)}</span>
							</div>
							<div className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: comment.content }} />
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-muted-foreground">{t('empty')}</p>
			)}
		</div>
	)
}
