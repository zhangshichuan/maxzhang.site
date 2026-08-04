import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { FeaturedPosts } from '@/src/features/posts'
import { flattenSkills, skillMatrix } from '@/src/shared/skills'
import { HomeHero } from './home-hero'

export function HomePage({ posts }: { posts: PostSummaryWithViews[] }) {
  return (
    <>
      <HomeHero />

      <FeaturedPosts posts={posts} />

      <section>
        <div className="section-head">
          <span className="section-title">Skill Matrix</span>
          <div className="section-line"></div>
        </div>
        <div className="skill-grid">
          {skillMatrix.map((s) => (
            <div key={s.title} className="skill-card">
              <div className="skill-icon">{s.icon}</div>
              <div className="skill-title">{s.title}</div>
              <div className="skill-list">{flattenSkills(s.items).join(' · ')}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
