import { FeaturedPosts } from '@/src/features/posts'
import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { marqueeTechs, skillMatrix } from '@/src/shared/skills'
import { HomeHero } from './home-hero'

function MarqueeSpan() {
  const MARQUEE_TECHS = marqueeTechs
  return (
    <>
      {MARQUEE_TECHS.flatMap((tech, i) => {
        const els = [<span key={tech}>{tech}</span>]
        if (i < MARQUEE_TECHS.length - 1) {
          els.push(
            <span key={`d-${i}`} className="dot">
              {'\u25CF'}
            </span>,
          )
        }
        return els
      })}
      <span className="dot">{'\u25CF'}</span>
    </>
  )
}

export function HomePage({ posts }: { posts: PostSummaryWithViews[] }) {
  return (
    <>
      <HomeHero />

      <FeaturedPosts posts={posts} />

      <section>
        <div className="sec-head">
          <span className="bracket">[Skill Matrix]</span>
          <div className="line"></div>
        </div>
        <div className="spec-grid">
          {skillMatrix.map((s) => (
            <div key={s.title} className="spec-item">
              <div className="icon">{s.icon}</div>
              <div className="title">{s.title}</div>
              <div className="list" dangerouslySetInnerHTML={{ __html: s.items.join('<br>') }} />
            </div>
          ))}
        </div>
      </section>

      <div className="marquee">
        <div className="marquee-inner">
          <MarqueeSpan />
          <MarqueeSpan />
        </div>
      </div>
    </>
  )
}
