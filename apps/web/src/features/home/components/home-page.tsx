import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useLocale } from '@/src/i18n/client'
import { useEffect, type CSSProperties } from 'react'
import Avatar from '@/src/features/about/avatar.jpg'
import { KineticField } from './kinetic-field'

interface HomePageProps {
  posts: PostSummaryWithViews[]
}

const copy = {
  en: {
    eyebrow: 'Portfolio 2026 — Shenzhen / Shanghai',
    role: 'AI Product Manager',
    lede: 'I turn model capability into products people trust. Ten years building products; the last two shipping AI systems.',
    scroll: 'Scroll to index',
    status: 'Open for select projects',
    ticker: ['AI product management', '0→1', 'Human in the loop', 'Designing trust', 'Retention +80%', 'Open for 2026'],
    sections: ['Index', 'Case', 'Principles', 'Method', 'Writing', 'Contact'],
    indexTitle: 'What I bring to the table.',
    indexKicker: '01 / Index',
    indexRows: [
      { value: '10+', unit: 'yrs', label: 'Years shipping products', note: 'From 0→1 launches to platform scale.' },
      { value: '0→1', unit: '', label: 'Products launched', note: 'Ambiguous model capability → a product people use.' },
      { value: '+80', unit: '%', label: 'Retention lift', note: 'Built the loop, not just the launch.' },
      { value: 'AI', unit: '/ ML', label: 'Native domain', note: 'Evaluation, guardrails, model-in-the-loop workflows.' },
    ],
    caseKicker: '02 / Case 01',
    caseTitle1: 'AI video',
    caseTitle2: 'production',
    caseAccent: 'pipeline',
    caseContext: 'A media team needed to ship far more video without adding headcount.',
    caseDecision: 'Rebuilt the workflow around a model-in-the-loop pipeline: brief → script → generation → review.',
    caseResult: 'Cross-team delivery velocity',
    caseResult2: 'Cost per video',
    caseValue1: '+80%',
    caseValue2: '¥2.5–3 → ¥0.5–1',
    caseRole: 'Role — Product lead / AI workflow design',
    ctaWork: 'Selected work',
    ctaContact: 'Get in touch',
    statsExperience: 'Experience',
    statsShipped: 'Shipped',
    statsRetention: 'Retention',
    yearsUnit: 'yrs',
    principlesKicker: '03 / Principles',
    principlesTitle: 'A point of view, not a process.',
    principles: [
      { title: 'Taste is a product skill.', body: 'Model output is infinite. Selection is the job.' },
      { title: 'Ship trust, not demos.', body: 'A demo shows capability; a product earns the second use.' },
      { title: 'The model is never the product.', body: 'The product is the workflow, the guardrails, the feedback loop.' },
    ],
    methodKicker: '04 / Method',
    methodTitle: 'How I work.',
    method: [
      { title: 'Frame the real job', body: 'Interrogate the workflow before touching the model.' },
      { title: 'Prototype the trust', body: 'Put the smallest real loop in front of real people.' },
      { title: 'Instrument the loop', body: 'Measure where judgment is lost, not just clicks.' },
      { title: 'Ship and learn', body: 'Small releases, brutal reviews, compounding quality.' },
    ],
    writingKicker: '05 / Writing',
    writingTitle: 'Thinking in public.',
    writingAll: 'All writing',
    contactKicker: '06 / Contact',
    contactTitle: ['Let’s build', 'something', 'intelligent.'],
    contactNote: 'AI product management · advisory · 2026',
    portraitAlt: 'Max Zhang',
    portraitCap: 'Fig. 01 — The human in the loop',
    badge: 'Open / 2026',
  },
  zh: {
    eyebrow: '作品集 2026 — 深圳 / 上海',
    role: 'AI 产品经理',
    lede: '把模型能力，做成用户真正信任的产品。十年产品经验，最近两年专注 AI 系统落地。',
    scroll: '向下浏览',
    status: '开放少量合作',
    ticker: ['AI 产品管理', '0→1', '人在回路', '设计信任', '留存 +80%', '2026 开放合作'],
    sections: ['索引', '案例', '原则', '方法', '写作', '联系'],
    indexTitle: '我能带来什么。',
    indexKicker: '01 / 索引',
    indexRows: [
      { value: '10+', unit: '年', label: '产品经验', note: '从 0→1 到平台化规模。' },
      { value: '0→1', unit: '', label: '从零到一', note: '把模糊的模型能力，变成用户会用的产品。' },
      { value: '+80', unit: '%', label: '留存提升', note: '不只是一次发布，而是持续运转的闭环。' },
      { value: 'AI', unit: '/ ML', label: '核心领域', note: '评测、护栏、模型在环工作流。' },
    ],
    caseKicker: '02 / 案例 01',
    caseTitle1: 'AI 视频',
    caseTitle2: '生产',
    caseAccent: '流水线',
    caseContext: '一个内容团队需要在不增加人力的前提下，产出更多视频。',
    caseDecision: '以模型在环重构流程：brief → 脚本 → 生成 → 审核。',
    caseResult: '跨团队交付效率',
    caseResult2: '单条视频成本',
    caseValue1: '+80%',
    caseValue2: '¥2.5–3 → ¥0.5–1',
    caseRole: '角色 — 产品负责人 / AI 工作流设计',
    ctaWork: '查看作品',
    ctaContact: '联系我',
    statsExperience: '经验',
    statsShipped: '从零到一',
    statsRetention: '留存',
    yearsUnit: '年',
    principlesKicker: '03 / 原则',
    principlesTitle: '观点，而不是流程。',
    principles: [
      { title: '品味是产品能力。', body: '模型输出是无限的，选择才是工作。' },
      { title: '交付信任，不是 demo。', body: 'demo 证明能力，产品赢得第二次使用。' },
      { title: '模型永远不是产品。', body: '产品是工作流、护栏和反馈闭环。' },
    ],
    methodKicker: '04 / 方法',
    methodTitle: '我的工作方式。',
    method: [
      { title: '先定义真问题', body: '在碰模型之前，先把工作流问清楚。' },
      { title: '先原型信任', body: '把最小的真实闭环，放到真实用户面前。' },
      { title: '度量闭环', body: '关注判断力在哪里流失，而不只是点击。' },
      { title: '发布与学习', body: '小步发布，严格复盘，让质量复利。' },
    ],
    writingKicker: '05 / 写作',
    writingTitle: '公开思考。',
    writingAll: '全部文章',
    contactKicker: '06 / 联系',
    contactTitle: ['一起做点', '真正', '智能的事。'],
    contactNote: 'AI 产品管理 · 顾问 · 2026',
    portraitAlt: '张世川',
    portraitCap: '图 01 — 人在回路',
    badge: '开放 / 2026',
  },
} as const

export function HomePage({ posts }: HomePageProps) {
  const locale = useLocale()
  const t = copy[locale === 'zh' ? 'zh' : 'en']
  const featured = posts.slice(0, 3)

  useEffect(() => {
    const root = document.querySelector('.zx-home')
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((item) => item.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="zx-home">
      <section className="zx-hero" aria-labelledby="zx-hero-title">
        <KineticField />
        <div className="zx-hero-shade" aria-hidden="true" />
        <div className="zx-hero-inner zx-shell">
          <div className="zx-hero-copy">
            <p className="zx-eyebrow zx-rise" style={{ '--d': '0ms' } as CSSProperties}>
              <span className="zx-dot" aria-hidden="true" />
              {t.eyebrow}
            </p>
            <h1 className="zx-headline" id="zx-hero-title">
              <span className="zx-line">
                <span>Max</span>
              </span>
              <span className="zx-line zx-outline">
                <span>Zhang</span>
              </span>
            </h1>
            <p className="zx-role zx-rise" style={{ '--d': '260ms' } as CSSProperties}>
              {t.role}
              <span className="zx-role-mark" aria-hidden="true">
                ↗
              </span>
            </p>
            <p className="zx-lede zx-rise" style={{ '--d': '340ms' } as CSSProperties}>
              {t.lede}
            </p>
            <div className="zx-actions zx-rise" style={{ '--d': '420ms' } as CSSProperties}>
              <a className="zx-btn zx-btn--solid" href="#case">
                {t.ctaWork} <span aria-hidden="true">↗</span>
              </a>
              <a className="zx-btn zx-btn--ghost" href="mailto:zsc.guru@qq.com">
                {t.ctaContact} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <nav className="zx-hero-index" aria-label="Sections">
            {t.sections.map((label, index) => (
              <a
                href={
                  ['#index', '#case', '#principles', '#method', '#writing', '#contact'][index] ?? '#index'
                }
                key={label}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {label}
              </a>
            ))}
          </nav>

          <figure className="zx-portrait zx-rise" style={{ '--d': '520ms' } as CSSProperties}>
            <span className="zx-portrait-frame" aria-hidden="true" />
            <img src={Avatar} alt={t.portraitAlt} width={952} height={952} />
            <figcaption>
              <span>{t.portraitCap}</span>
              <span className="zx-portrait-no">01</span>
            </figcaption>
            <span className="zx-portrait-badge">{t.badge}</span>
          </figure>
        </div>

        <div className="zx-hero-foot zx-shell">
          <dl className="zx-hero-stats">
            <div>
              <dt>{t.statsExperience}</dt>
              <dd>
                10+ <small>{t.yearsUnit}</small>
              </dd>
            </div>
            <div>
              <dt>{t.statsShipped}</dt>
              <dd>0→1</dd>
            </div>
            <div>
              <dt>{t.statsRetention}</dt>
              <dd>
                +80<small>%</small>
              </dd>
            </div>
          </dl>
          <a className="zx-scroll" href="#index">
            {t.scroll} <span aria-hidden="true">↓</span>
          </a>
          <p className="zx-status">
            <span className="zx-dot" aria-hidden="true" />
            {t.status}
          </p>
        </div>
      </section>

      <div className="zx-ticker" aria-hidden="true">
        <div className="zx-ticker-track">
          {[...t.ticker, ...t.ticker].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="zx-section zx-index" id="index" aria-labelledby="zx-index-title">
        <div className="zx-shell">
          <header className="zx-section-head" data-reveal>
            <p className="zx-kicker">
              <span className="zx-tick" aria-hidden="true" />
              {t.indexKicker}
            </p>
            <h2 className="zx-section-title" id="zx-index-title">
              {t.indexTitle}
            </h2>
          </header>
          <dl className="zx-index-list">
            {t.indexRows.map((row, index) => (
              <div className="zx-index-row" key={row.label} data-reveal style={{ '--i': index } as CSSProperties}>
                <span className="zx-index-no">{String(index + 1).padStart(2, '0')}</span>
                <span className="zx-index-value">
                  {row.value}
                  <small>{row.unit}</small>
                </span>
                <span className="zx-index-copy">
                  <span className="zx-index-label">{row.label}</span>
                  <span className="zx-index-note">{row.note}</span>
                </span>
                <span className="zx-index-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="zx-section zx-case" id="case" aria-labelledby="zx-case-title">
        <div className="zx-shell zx-case-grid">
          <header className="zx-case-head" data-reveal>
            <p className="zx-kicker">
              <span className="zx-tick" aria-hidden="true" />
              {t.caseKicker}
            </p>
            <h2 className="zx-case-title" id="zx-case-title">
              <span>{t.caseTitle1}</span>
              <span>{t.caseTitle2}</span>
              <span className="zx-accent">{t.caseAccent}</span>
            </h2>
            <p className="zx-case-context">{t.caseContext}</p>
            <p className="zx-case-decision">{t.caseDecision}</p>
            <p className="zx-case-role">{t.caseRole}</p>
          </header>
          <div className="zx-case-metrics" data-reveal>
            <div className="zx-case-metric">
              <span className="zx-case-value">{t.caseValue1}</span>
              <span className="zx-case-label">{t.caseResult}</span>
            </div>
            <div className="zx-case-metric">
              <span className="zx-case-value zx-case-value--small">{t.caseValue2}</span>
              <span className="zx-case-label">{t.caseResult2}</span>
            </div>
            <div className="zx-case-meta">
              <span>01 / 2025</span>
              <span>AI workflow</span>
              <span>Product lead</span>
            </div>
          </div>
        </div>
      </section>

      <section className="zx-section zx-principles" id="principles" aria-labelledby="zx-principles-title">
        <div className="zx-shell">
          <header className="zx-section-head" data-reveal>
            <p className="zx-kicker">
              <span className="zx-tick" aria-hidden="true" />
              {t.principlesKicker}
            </p>
            <h2 className="zx-section-title" id="zx-principles-title">
              {t.principlesTitle}
            </h2>
          </header>
          <div className="zx-principle-grid">
            {t.principles.map((item, index) => (
              <article className="zx-principle" key={item.title} data-reveal style={{ '--i': index } as CSSProperties}>
                <span className="zx-principle-no">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="zx-principle-mark" aria-hidden="true">
                  ✳
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="zx-section zx-method" id="method" aria-labelledby="zx-method-title">
        <div className="zx-shell zx-method-grid">
          <header className="zx-method-head" data-reveal>
            <p className="zx-kicker">
              <span className="zx-tick" aria-hidden="true" />
              {t.methodKicker}
            </p>
            <h2 className="zx-section-title" id="zx-method-title">
              {t.methodTitle}
            </h2>
          </header>
          <ol className="zx-method-list">
            {t.method.map((item, index) => (
              <li className="zx-method-row" key={item.title} data-reveal style={{ '--i': index } as CSSProperties}>
                <span className="zx-method-no">{String(index + 1).padStart(2, '0')}</span>
                <span className="zx-method-title">{item.title}</span>
                <span className="zx-method-body">{item.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="zx-section zx-writing" id="writing" aria-labelledby="zx-writing-title">
        <div className="zx-shell">
          <header className="zx-section-head" data-reveal>
            <p className="zx-kicker">
              <span className="zx-tick" aria-hidden="true" />
              {t.writingKicker}
            </p>
            <h2 className="zx-section-title" id="zx-writing-title">
              {t.writingTitle}
            </h2>
            <Link className="zx-all-link" href="/posts">
              {t.writingAll} <span aria-hidden="true">↗</span>
            </Link>
          </header>
          <div className="zx-writing-list">
            {featured.map((post, index) => (
              <Link className="zx-post-row" href={`/posts/${post.slug}`} key={post.slug} data-reveal>
                <span className="zx-post-no">{String(index + 1).padStart(2, '0')}</span>
                <span className="zx-post-main">
                  <span className="zx-post-title">{post.title}</span>
                  <span className="zx-post-summary">{post.summary}</span>
                </span>
                <span className="zx-post-date">{post.date}</span>
                <span className="zx-post-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="zx-contact" id="contact" aria-labelledby="zx-contact-title">
        <div className="zx-shell zx-contact-inner">
          <p className="zx-kicker" data-reveal>
            <span className="zx-tick" aria-hidden="true" />
            {t.contactKicker}
          </p>
          <h2 className="zx-contact-title" id="zx-contact-title">
            {t.contactTitle.map((line, index) => (
              <span key={line} data-reveal style={{ '--i': index } as CSSProperties}>
                {line}
              </span>
            ))}
          </h2>
          <a className="zx-mail" href="mailto:zsc.guru@qq.com">
            zsc.guru@qq.com <span aria-hidden="true">↗</span>
          </a>
          <p className="zx-contact-note">{t.contactNote}</p>
        </div>
      </section>
    </div>
  )
}
