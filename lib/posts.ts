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
 * 获取所有文章的文件名（slugs）
 * @returns string[] - 包含 .md 或 .mdx 后缀的文件名列表
 */
export function getPostSlugs() {
	if (!fs.existsSync(postsDirectory)) {
		return []
	}
	return fs.readdirSync(postsDirectory).filter((file) => file.match(/\.mdx?$/))
}

/**
 * 根据 slug 获取单篇文章的详细信息
 * @param slug - 文章的文件名（可能包含 URL 编码）
 * @returns Post - 文章对象，包含元数据和内容
 */
export function getPostBySlug(slug: string): Post {
	// 解码 URL 编码的 slug（例如处理中文文件名），并移除文件后缀
	const realSlug = decodeURIComponent(slug).replace(/\.mdx?$/, '')

	// 尝试查找 .mdx 或 .md 文件
	// 优先查找 .mdx，如果不存在则查找 .md
	let fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
	if (!fs.existsSync(fullPath)) {
		fullPath = path.join(postsDirectory, `${realSlug}.md`)
	}

	// 读取文件内容
	const fileContents = fs.readFileSync(fullPath, 'utf8')
	// 使用 gray-matter 解析 frontmatter 元数据和正文内容
	const { data, content } = matter(fileContents)

	// 使用 reading-time 库计算阅读时间
	const stats = readingTime(content)

	return {
		slug: realSlug,
		title: data.title,
		date: data.date ? new Date(data.date).toISOString().split('T')[0] : '', // 格式化为 YYYY-MM-DD
		summary: data.summary || '',
		content,
		readTime: stats,
		tags: data.tags || [],
		author: data.author || '匿名', // 默认值
		category: data.category || '未分类', // 默认值
		...data,
	}
}

/**
 * 获取所有文章，并按日期降序排序
 * @returns Post[] - 排序后的文章列表
 */
export function getAllPosts(): Post[] {
	const slugs = getPostSlugs()
	const posts = slugs
		.map((slug) => getPostBySlug(slug))
		// 按日期降序排序（最新的在前面）
		.sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
	return posts
}
