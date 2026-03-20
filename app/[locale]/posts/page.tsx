import { getAllPosts } from '@/lib/posts'
import { PostsClient } from '@/components/posts-client'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>
}): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'PostsPage' })

	return {
		title: `${t('title')} - Max Zhang`,
		description: 'Read my thoughts on software development, design, and more.',
	}
}

export default async function PostsPage() {
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
