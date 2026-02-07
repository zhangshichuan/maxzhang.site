import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'

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

export function getPostSlugs() {
	if (!fs.existsSync(postsDirectory)) {
		return []
	}
	return fs.readdirSync(postsDirectory).filter((file) => file.match(/\.mdx?$/))
}

export function getPostBySlug(slug: string): Post {
	const realSlug = slug.replace(/\.mdx?$/, '')

	// 尝试查找 .mdx 或 .md 文件
	let fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
	if (!fs.existsSync(fullPath)) {
		fullPath = path.join(postsDirectory, `${realSlug}.md`)
	}

	const fileContents = fs.readFileSync(fullPath, 'utf8')
	const { data, content } = matter(fileContents)

	// 使用 reading-time 库计算阅读时间
	const stats = readingTime(content)

	return {
		slug: realSlug,
		title: data.title,
		date: data.date ? new Date(data.date).toISOString().split('T')[0] : '', // YYYY-MM-DD
		summary: data.summary || '',
		content,
		readTime: stats,
		tags: data.tags || [],
		author: data.author || '匿名', // 默认值
		category: data.category || '未分类', // 默认值
		...data,
	}
}

export function getAllPosts(): Post[] {
	const slugs = getPostSlugs()
	const posts = slugs
		.map((slug) => getPostBySlug(slug))
		// 按日期降序排序
		.sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
	return posts
}
