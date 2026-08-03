/**
 * 文章 → TTS 纯文本提取
 *
 * 与旧 generate-audio.py 的 strip_mdx 保持同一套规则：
 * 去掉 frontmatter（getPostBySlug 已剥离）、代码块、markdown 语法和 HTML。
 */
export function stripMdxToPlainText(content: string): string {
  let text = content
  text = text.replace(/^---[\s\S]*?---\n/, '')
  text = text.replace(/^#{1,6}\s+/gm, '')
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')
  text = text.replace(/_([^_]+)_/g, '$1')
  text = text.replace(/```[\s\S]*?```/g, '')
  text = text.replace(/`([^`]+)`/g, '$1')
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  text = text.replace(/!\[.*?\]\([^)]+\)/g, '')
  text = text.replace(/^[-*+]\s+/gm, '')
  text = text.replace(/^\d+\.\s+/gm, '')
  text = text.replace(/<[^>]+>/g, '')
  text = text.replace(/---/g, '')
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}

/**
 * TTS 友好预处理：全大写缩写拆成字母逐个朗读。
 */
export function preprocessForTts(text: string): string {
  return text.replace(/([A-Z])(?=[A-Z])/g, '$1 ')
}
