import { createFileRoute } from '@tanstack/react-router'
import { createHash } from 'node:crypto'
import { getPostBySlug, preprocessForTts, stripMdxToPlainText } from '@/src/features/posts'

const VOICES: Record<string, string> = {
  zh: 'zh-CN-XiaoxiaoNeural',
  en: 'en-US-JennyNeural',
}

/**
 * 文章音频代理路由
 *
 * /api/tts/{locale}/{slug}.mp3
 *
 * 1. 从 MDX 提取纯文本并计算内容哈希（内容更新 → hash 变化 → 自动重新生成）
 * 2. 优先命中 TTS 缓存（支持 Range）；未命中时把文本 POST 给 TTS 服务实时合成
 * 3. 浏览器只跟同源 URL 打交道，无 CORS 问题
 */
export const Route = createFileRoute('/api/tts/$locale/$slug')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { locale, slug: slugWithExt } = params
        const slug = slugWithExt.replace(/\.mp3$/, '')

        let text: string
        try {
          const post = getPostBySlug(slug, locale)
          text = preprocessForTts(stripMdxToPlainText(post.content))
        } catch {
          return new Response('Post not found', { status: 404 })
        }

        if (!text) {
          return new Response('Empty text', { status: 400 })
        }

        const voice = VOICES[locale] ?? VOICES.zh
        const hash = createHash('sha256').update(text, 'utf8').digest('hex')
        const baseUrl = (process.env.TTS_BASE_URL ?? 'http://localhost:8001').replace(/\/$/, '')
        const ttsUrl = `${baseUrl}/tts/${hash}?voice=${encodeURIComponent(voice)}`
        const range = request.headers.get('range') ?? ''

        // 先试缓存
        let cached: Response
        try {
          cached = await fetch(ttsUrl, {
            headers: range ? { range } : {},
          })
        } catch {
          return new Response('TTS service unavailable', { status: 503 })
        }
        if (cached.ok || cached.status === 206) {
          return new Response(cached.body, {
            status: cached.status,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Accept-Ranges': cached.headers.get('accept-ranges') ?? 'bytes',
              ...(cached.headers.get('content-range') ? { 'Content-Range': cached.headers.get('content-range')! } : {}),
              'Cache-Control': 'public, max-age=86400',
            },
          })
        }
        if (cached.status !== 404) {
          return new Response('TTS upstream error', { status: 502 })
        }

        // 未命中：POST 文本触发实时合成；生成中（409）则退避重试
        for (let attempt = 0; attempt < 4; attempt += 1) {
          let generated: Response
          try {
            generated = await fetch(ttsUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, voice }),
            })
          } catch {
            return new Response('TTS service unavailable', { status: 503 })
          }
          if (generated.ok) {
            return new Response(generated.body, {
              headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=86400',
              },
            })
          }
          if (generated.status !== 409) break
          await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
        }

        return new Response('TTS upstream error', { status: 502 })
      },
    },
  },
})
