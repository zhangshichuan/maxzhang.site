import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'

// 定义文章存放目录：项目根目录下的 articles 文件夹
const postsDirectory = path.join(process.cwd(), 'articles')

export type ReadingTime = ReturnType<typeof readingTime>

export interface Post {
	slug: string
	title: string
	date: string
	summary: string
	content: string
	readTime: ReadingTime
	tags: string[]
	author: string
	category: string
}

/**
 * 获取特定语言的所有文章文件名（slugs）
 * @param locale - 语言环境 ('en' | 'zh')
 * @returns string[] - 包含 .md 或 .mdx 后缀的文件名列表
 */
export function getPostSlugs(locale: string = 'zh') {
	const localeDir = path.join(postsDirectory, locale)
	
	if (!fs.existsSync(localeDir)) {
		// 如果语言子目录不存在，尝试读取根目录（兜底）
		if (!fs.existsSync(postsDirectory)) return []
		return fs.readdirSync(postsDirectory).filter((file) => file.match(/\.mdx?$/))
	}
	
	return fs.readdirSync(localeDir).filter((file) => file.match(/\.mdx?$/))
}

/**
 * 根据 slug 获取单篇文章的详细信息
 * @param slug - 文章的文件名
 * @param locale - 语言环境
 * @returns Post - 文章对象
 */
export function getPostBySlug(slug: string, locale: string = 'zh'): Post {
	// 解码 URL 编码的 slug
	const realSlug = decodeURIComponent(slug).replace(/\.mdx?$/, '')

	// 尝试在语言子目录下查找
	let fullPath = path.join(postsDirectory, locale, `${realSlug}.mdx`)
	if (!fs.existsSync(fullPath)) {
		fullPath = path.join(postsDirectory, locale, `${realSlug}.md`)
	}

	// 如果子目录下没找到，尝试在根目录下查找（兜底）
	if (!fs.existsSync(fullPath)) {
		fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
		if (!fs.existsSync(fullPath)) {
			fullPath = path.join(postsDirectory, `${realSlug}.md`)
		}
	}

	// 如果还是没找到，抛出错误
	if (!fs.existsSync(fullPath)) {
		throw new Error(`Post not found: ${realSlug} in locale: ${locale}`)
	}

	// 读取文件内容
	const fileContents = fs.readFileSync(fullPath, 'utf8')
	const { data, content } = matter(fileContents)
	const stats = readingTime(content)

	return {
		slug: realSlug,
		title: data.title,
		date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
		summary: data.summary || '',
		content,
		readTime: stats,
		tags: data.tags || [],
		author: data.author || 'Max Zhang',
		category: data.category || 'Uncategorized',
		...data,
	}
}

/**
 * 获取特定语言的所有文章，并按日期降序排序
 * @param locale - 语言环境
 * @returns Post[] - 排序后的文章列表
 */
export function getAllPosts(locale: string = 'zh'): Post[] {
	const slugs = getPostSlugs(locale)
	const posts = slugs
		.map((slug) => {
			try {
				return getPostBySlug(slug, locale)
			} catch (e) {
				console.error(e)
				return null
			}
		})
		.filter((post): post is Post => post !== null)
		.sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
	return posts
}
