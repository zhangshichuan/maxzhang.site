import { HomeHero } from '@/src/features/home'
import { FeaturedPosts, getAllPostsWithViews } from '@/src/features/posts'
import { skillMatrix, marqueeTechs } from '@/src/shared/skills'

const MARQUEE_TECHS = marqueeTechs

function MarqueeSpan() {
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

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const posts = await getAllPostsWithViews(locale).then((p) => p.slice(0, 3))

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
