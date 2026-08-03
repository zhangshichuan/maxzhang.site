import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link } from '@/src/i18n/client'

interface FeaturedPostsProps {
  posts: PostSummaryWithViews[]
}

function ProjectCard({ post, idx }: { post: PostSummaryWithViews; idx: number }) {
  return (
    <Link href={`/posts/${post.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="proj">
        <div className="idx">{String(idx + 1).padStart(2, '0')}</div>
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
        <div className="tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  return (
    <section>
      <div className="sec-head">
        <span className="bracket">[Featured articles]</span>
        <div className="line"></div>
      </div>
      <div className="proj-grid">
        {posts.map((post, idx) => (
          <ProjectCard key={post.slug} post={post} idx={idx} />
        ))}
      </div>
    </section>
  )
}
