import { getAllPosts } from '@/lib/posts'
import { PostsClient } from '@/components/posts-client'

export const metadata = {
	title: '文章库 - Max Zhang',
	description: 'Read my thoughts on software development, design, and more.',
}

export default function PostsPage() {
	// 获取所有文章数据
	const posts = getAllPosts()

	// 动态计算所有文章中出现过的唯一标签
	const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)))

	// 动态计算所有文章中出现过的唯一分类
	const allCategories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))

	return (
		<PostsClient 
			posts={posts} 
			allTags={allTags} 
			allCategories={allCategories} 
		/>
	)
}
