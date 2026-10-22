import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useLocale, useTranslations } from '@/src/i18n/client'
import FlowField from './flow-field'

interface Kpi {
  label: string
  value: string
  unit: string
  note: string
}

interface Principle {
  title: string
  body: string
}

interface MethodItem {
  title: string
  body: string
}

interface WritingSeries {
  title: string
  body: string
}

interface Fact {
  label: string
  value: string
}

const stripStop = (value: string) => value.replace(/[。.]$/, '')

export function HomePage({ posts }: { posts: PostSummaryWithViews[] }) {
  const tHome = useTranslations('HomePage')
  const tHero = useTranslations('HomePage.hero')
  const flow = useTranslations('HomePage.flow')
  const tCase = useTranslations('HomePage.case')
  const tPrinciples = useTranslations('HomePage.principles')
  const tMethod = useTranslations('HomePage.method')
  const tFeatured = useTranslations('HomePage.featuredPosts')
  const tContact = useTranslations('HomePage.contact')
  const tPosts = useTranslations('PostsPage')
  const tAbout = useTranslations('AboutPage')
  const locale = useLocale()

  const kpis = tHome.raw<Kpi[]>('kpis') ?? []
  const principles = tPrinciples.raw<Principle[]>('items') ?? []
  const methods = tMethod.raw<MethodItem[]>('items') ?? []
  const series = tPosts.raw<WritingSeries[]>('series') ?? []
  const facts = tAbout.raw<Fact[]>('facts') ?? []
  const featuredPosts = posts.slice(0, 3)

  const headline2 = stripStop(tHero('headline2'))
  const zhProductTail = locale === 'zh' && headline2.endsWith('产品') ? '产品' : ''
  const headline2Head = zhProductTail ? headline2.slice(0, -zhProductTail.length) : headline2

  return (
    <div className="flow-home">
      <FlowField />

      {/* ============ HERO ============ */}
      <section className="hero" id="top" aria-labelledby="heroTitle">
        <div className="hero-inner container">
          <div className="hero-copy" id="heroCopy">
            <p className="hero-eyebrow">
              <span className="mono">{flow('brand')}</span>
              <span className="eyebrow-dot" aria-hidden="true" />
              <span className="mono">{tHero('eyebrow')}</span>
            </p>
            <h1 className="hero-title" id="heroTitle">
              <span className="ln">{tHero('headline1')}</span>
              <span className="ln">
                {headline2Head}
                {zhProductTail ? <span className="keep">{zhProductTail}</span> : null}
                <span className="stop" aria-hidden="true" />
                <span className="sr-only">.</span>
              </span>
            </h1>
            <p className="hero-en">{flow('heroEn')}</p>
            <p className="hero-lede">{tHero('lede')}</p>
            <div className="hero-actions">
              <a className="btn btn-solid" href="mailto:zsc.guru@qq.com">
                {tHero('email')}{' '}
                <span className="arr" aria-hidden="true">
                  ↗
                </span>
              </a>
              <Link className="btn-link" href="/posts">
                {tHero('notes')}{' '}
                <span className="arr" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-foot">
          <div className="hero-foot-inner">
            <a className="scroll-cue" href="#numbers" data-jump>
              {flow('scrollCue')} <span className="cue-line" aria-hidden="true" />
            </a>
            <p className="hero-meta">{flow('heroMeta')}</p>
          </div>
        </div>
      </section>

      {/* ============ NUMBERS ============ */}
      <section className="chapter" id="numbers" data-chapter="true" aria-labelledby="numbersTitle">
        <div className="container">
          <h2 className="sr-only" id="numbersTitle">
            {flow('numbersTitle')}
          </h2>
          <div className="numbers-grid">
            <div className="sheet numbers-sheet reveal">
              <div className="chapter-head">
                <p className="chapter-label">
                  <span className="tick" aria-hidden="true" />
                  {flow('numbersLabel')}
                </p>
                <p className="chapter-no">01 / 07</p>
              </div>
              {kpis.map((kpi) => (
                <div className="stat-row" key={kpi.label}>
                  <div className="stat-info">
                    <span className="stat-label">{kpi.label}</span>
                    <span className="stat-note">{kpi.note}</span>
                  </div>
                  <div className="stat-value">
                    <span className="stat-num">{kpi.value}</span>
                    {kpi.unit ? <span className="stat-unit">{kpi.unit}</span> : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="glyph-stage" aria-hidden="true">
              <span className="glyph-cap">{flow('glyphCap')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CASE ============ */}
      <section className="chapter" id="case" data-chapter="true" aria-labelledby="caseTitle">
        <div className="container">
          <div className="sheet case-sheet">
            <div className="chapter-head">
              <p className="chapter-label">
                <span className="tick" aria-hidden="true" />
                {flow('caseLabel')}
              </p>
              <p className="chapter-no">02 / 07</p>
            </div>
            <h2 className="case-title reveal" id="caseTitle">
              {tCase('name')}
            </h2>
            <div className="rule-sweep" aria-hidden="true" />
            <div className="case-rows">
              <div className="case-row">
                <p className="case-label">{flow('caseScenario')}</p>
                <p className="case-big">{tCase('context')}</p>
              </div>
              <div className="case-row">
                <p className="case-label">{flow('caseDecision')}</p>
                <p className="case-big">{tCase('decision')}</p>
              </div>
              <div className="case-row">
                <p className="case-label">{flow('caseResult')}</p>
                <div>
                  <div className="case-metrics">
                    <div className="case-metric">
                      <span className="metric-xl accent">+80%</span>
                      <span className="metric-cap">{kpis[2]?.note ?? '跨部门协作'}</span>
                    </div>
                    <div className="case-metric">
                      <span className="metric-cost">¥2.5–3 → ¥0.5–1</span>
                      <span className="metric-cap">{locale === 'zh' ? '单条视频成本' : 'cost per video'}</span>
                    </div>
                  </div>
                  <p className="case-big small">{tCase('result')}</p>
                </div>
              </div>
              <div className="case-row">
                <p className="case-label">{flow('caseRole')}</p>
                <p className="case-big small">{tCase('role')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRINCIPLES ============ */}
      <section className="chapter" id="principles" data-chapter="true" aria-labelledby="principlesTitle">
        <div className="container">
          <div className="sheet chapter-panel">
            <div className="chapter-head">
              <p className="chapter-label">
                <span className="tick" aria-hidden="true" />
                {flow('principlesLabel')}
              </p>
              <p className="chapter-no">03 / 07</p>
            </div>
            <h2 className="chapter-title reveal" id="principlesTitle">
              {tPrinciples('title')}
            </h2>
            <div className="rule-sweep" aria-hidden="true" />
            <div className="principles-open">
              {principles.map((item, index) => (
                <div className="principle" key={item.title}>
                  <span className="principle-idx">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="principle-statement">{item.title}</p>
                    <p className="principle-note">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ METHOD ============ */}
      <section className="chapter" id="method" data-chapter="true" aria-labelledby="methodTitle">
        <div className="container">
          <div className="sheet chapter-panel">
            <div className="chapter-head">
              <p className="chapter-label">
                <span className="tick" aria-hidden="true" />
                {flow('methodLabel')}
              </p>
              <p className="chapter-no">04 / 07</p>
            </div>
            <h2 className="chapter-title reveal" id="methodTitle">
              {tMethod('title')}
            </h2>
            <div className="rule-sweep" aria-hidden="true" />
            <div className="method-grid">
              {methods.map((item, index) => (
                <div className="method-col" key={item.title}>
                  <div className="method-top">
                    <span className="method-step">STEP {String(index + 1).padStart(2, '0')}</span>
                    <span className="method-seed" aria-hidden="true" />
                  </div>
                  <h3 className="method-title">{item.title}</h3>
                  <p className="method-desc">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ WRITING ============ */}
      <section className="chapter" id="writing" data-chapter="true" aria-labelledby="writingTitle">
        <div className="container">
          <div className="sheet chapter-panel">
            <div className="chapter-head">
              <p className="chapter-label">
                <span className="tick" aria-hidden="true" />
                {flow('writingLabel')}
              </p>
              <p className="chapter-no">05 / 07</p>
            </div>
            <div className="writing-grid">
              <div className="writing-left">
                <h2 className="writing-title reveal" id="writingTitle">
                  {tFeatured('title')}
                </h2>
                <p className="writing-desc">{tFeatured('description')}</p>
                <Link className="btn-link" href="/posts">
                  {tFeatured('viewAll')}{' '}
                  <span className="arr" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
              <div className="writing-right">
                <ul className="series-list">
                  {series.map((item, index) => (
                    <li className="series-row" key={item.title}>
                      <span className="series-idx">{String(index + 1).padStart(2, '0')}</span>
                      <span className="series-title">{item.title}</span>
                      <span className="series-desc">{item.body}</span>
                    </li>
                  ))}
                </ul>
                <div className="published">
                  <span className="published-label">{flow('published')}</span>
                  <ul>
                    {featuredPosts.map((post) => (
                      <li className="article-row" key={post.slug}>
                        <Link href={`/posts/${post.slug}`}>
                          {post.title}
                        </Link>
                        <span className="article-arr" aria-hidden="true">
                          ↗
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section className="chapter" id="about" data-chapter="true" aria-labelledby="aboutTitle">
        <div className="container">
          <div className="sheet chapter-panel">
            <div className="chapter-head">
              <p className="chapter-label">
                <span className="tick" aria-hidden="true" />
                {flow('aboutLabel')}
              </p>
              <p className="chapter-no">06 / 07</p>
            </div>
            <div className="about-grid">
              <div>
                <h2 className="about-h reveal" id="aboutTitle">
                  <span className="ln">{flow('aboutTitle')}</span>
                </h2>
                <p className="about-body">{flow('aboutBody')}</p>
                <Link className="btn-link" href="/about">
                  {flow('readMore')}{' '}
                  <span className="arr" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
              <dl className="spec">
                {facts.map((fact) => (
                  <div className="spec-row" key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>
                      {fact.value === (locale === 'zh' ? '开放 AI 产品岗位' : 'Open to AI product roles') ? (
                        <span className="status-dot" aria-hidden="true" />
                      ) : null}
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section className="contact" id="contact" data-chapter="true" aria-labelledby="contactTitle">
        <div className="container">
          <div className="chapter-head">
            <p className="chapter-label">
              <span className="tick" aria-hidden="true" />
              {flow('contactLabel')}
            </p>
            <p className="chapter-no">07 / 07</p>
          </div>
          <h2 className="contact-title reveal" id="contactTitle">
            <span className="contact-pre">{stripStop(tContact('title'))}</span>
            <span className="contact-stop" aria-hidden="true" />
            <span className="sr-only">.</span>
          </h2>
          <div className="contact-sheet">
            <p className="contact-body">{tContact('text')}</p>
            <div className="contact-actions">
              <a className="btn btn-solid" href="mailto:zsc.guru@qq.com">
                {tContact('email')}{' '}
                <span className="arr" aria-hidden="true">
                  ↗
                </span>
              </a>
              <a className="btn-link" href="https://github.com/zhangshichuan" target="_blank" rel="noopener noreferrer">
                {tContact('github')}{' '}
                <span className="arr" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
