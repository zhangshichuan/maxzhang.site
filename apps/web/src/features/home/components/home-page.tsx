import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useLocale } from '@/src/i18n/client'
import { useEffect, type CSSProperties } from 'react'
import Avatar from '@/src/features/about/avatar.jpg'

interface HomePageProps {
  posts: PostSummaryWithViews[]
}

const copy = {
  en: {
    eyebrow: 'Portfolio 2026 — Shenzhen / Shanghai',
    role: 'AI Product Manager',
    statement: "Building intelligent products with a designer's eye.",
    detail: 'Ten years turning model capability into products people trust. 0→1 launches, +80% retention.',
    ctaWork: 'Explore the work',
    ctaContact: 'Get in touch',
    ctaAbout: 'About / Method',
    scroll: 'Scroll to index',
    status: 'Open for select projects',
    stats: [
      { label: 'Experience', value: '10+', unit: 'yrs' },
      { label: 'Shipped', value: '0→1', unit: '' },
      { label: 'Retention', value: '+80', unit: '%' },
    ],
    portraitAlt: 'Max Zhang',
    portraitCap: 'Fig. 01 — The human in the loop',
    issue: 'N°01',
    issueSub: 'Portfolio / 2026',
    badge: 'Open / 2026',
    indexKicker: '01 / Index',
    indexTitle: 'What I bring to the table.',
    indexRows: [
      { value: '10+', unit: 'yrs', label: 'Years shipping products', note: 'From 0→1 launches to platform scale.' },
      { value: '0→1', unit: '', label: 'Products launched', note: 'Ambiguous model capability → a product people use.' },
      { value: '+80', unit: '%', label: 'Retention lift', note: 'Built the loop, not just the launch.' },
      { value: 'AI', unit: '/ ML', label: 'Native domain', note: 'Evaluation, guardrails, model-in-the-loop workflows.' },
    ],
    caseKicker: '02 / Case 01',
    caseTitle: ['AI video', 'production'],
    caseAccent: 'pipeline',
    caseContext: 'A media team needed to ship far more video without adding headcount.',
    caseDecision: 'Rebuilt the workflow around a model-in-the-loop pipeline: brief → script → generation → review.',
    caseRole: 'Role — Product lead / AI workflow design',
    caseMetrics: [
      { value: '+80%', label: 'Cross-team delivery velocity' },
      { value: '¥2.5–3 → ¥0.5–1', label: 'Cost per video', small: true },
    ],
    caseMeta: ['01 / 2025', 'AI workflow', 'Product lead'],
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
  },
  zh: {
    eyebrow: '作品集 2026 — 深圳 / 上海',
    role: 'AI 产品经理',
    statement: '把复杂，做成自然。',
    detail: '十年产品构建经验，把模型能力做成用户真正信任的产品。0→1 落地，+80% 留存。',
    ctaWork: '查看作品',
    ctaContact: '联系我',
    ctaAbout: '关于 / 方法',
    scroll: '向下浏览',
    status: '开放少量合作',
    stats: [
      { label: '经验', value: '10+', unit: '年' },
      { label: '从零到一', value: '0→1', unit: '' },
      { label: '留存', value: '+80', unit: '%' },
    ],
    portraitAlt: '张世川',
    portraitCap: '图 01 — 人在回路',
    issue: 'N°01',
    issueSub: 'Portfolio / 2026',
    badge: '开放 / 2026',
    indexKicker: '01 / 索引',
    indexTitle: '我能带来什么。',
    indexRows: [
      { value: '10+', unit: '年', label: '产品经验', note: '从 0→1 到平台化规模。' },
      { value: '0→1', unit: '', label: '从零到一', note: '把模糊的模型能力，变成用户会用的产品。' },
      { value: '+80', unit: '%', label: '留存提升', note: '不只是一次发布，而是持续运转的闭环。' },
      { value: 'AI', unit: '/ ML', label: '核心领域', note: '评测、护栏、模型在环工作流。' },
    ],
    caseKicker: '02 / 案例 01',
    caseTitle: ['AI 视频', '生产'],
    caseAccent: '流水线',
    caseContext: '一个内容团队需要在不增加人力的前提下，产出更多视频。',
    caseDecision: '以模型在环重构流程：brief → 脚本 → 生成 → 审核。',
    caseRole: '角色 — 产品负责人 / AI 工作流设计',
    caseMetrics: [
      { value: '+80%', label: '跨团队交付效率' },
      { value: '¥2.5–3 → ¥0.5–1', label: '单条视频成本', small: true },
    ],
    caseMeta: ['01 / 2025', 'AI 工作流', '产品负责人'],
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
  },
} as const

export function HomePage({ posts }: HomePageProps) {
  const locale = useLocale()
  const t = copy[locale === 'zh' ? 'zh' : 'en']
  const featured = posts.slice(0, 3)

  useEffect(() => {
    const root = document.querySelector('.fx-home')
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((item) => item.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="fx-home">
      <section className="fx-hero" aria-labelledby="fx-hero-title">
        <div className="fx-hero-inner fx-shell">
          <div className="fx-copy">
            <p className="fx-kicker fx-rise" style={{ '--d': '0ms' } as CSSProperties}>
              <span className="fx-tick" aria-hidden="true" />
              {t.eyebrow}
            </p>
            <h1 className="fx-title" id="fx-hero-title">
              <span className="fx-line">
                <span>Max</span>
              </span>
              <span className="fx-line">
                <span>
                  <em>Zhang</em>
                  <span className="fx-dot">.</span>
                </span>
              </span>
            </h1>
            <div className="fx-role-row fx-rise" style={{ '--d': '210ms' } as CSSProperties}>
              <span className="fx-role">
                <i aria-hidden="true" />
                {t.role}
              </span>
              <span className="fx-location">Shenzhen — Shanghai</span>
            </div>
            <p className="fx-statement fx-rise" style={{ '--d': '300ms' } as CSSProperties}>
              {t.statement}
            </p>
            <p className="fx-detail fx-rise" style={{ '--d': '380ms' } as CSSProperties}>
              {t.detail}
            </p>
            <div className="fx-actions fx-rise" style={{ '--d': '460ms' } as CSSProperties}>
              <a className="fx-cta" href="#case">
                {t.ctaWork} <span aria-hidden="true">↗</span>
              </a>
              <a className="fx-sub-link" href="mailto:zsc.guru@qq.com">
                {t.ctaContact}
              </a>
              <a className="fx-sub-link" href="#method">
                {t.ctaAbout}
              </a>
            </div>
            <dl className="fx-figures fx-rise" style={{ '--d': '540ms' } as CSSProperties}>
              {t.stats.map((stat) => (
                <div className="fx-fig" key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>
                    {stat.value}
                    {stat.unit ? <small>{stat.unit}</small> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="fx-portrait fx-rise" style={{ '--d': '620ms' } as CSSProperties}>
            <span className="fx-portrait-offset" aria-hidden="true" />
            <div className="fx-portrait-frame">
              <img src={Avatar} alt={t.portraitAlt} width={952} height={952} />
            </div>
            <span className="fx-portrait-badge">{t.badge}</span>
            <span className="fx-portrait-issue">
              {t.issue}
              <span>{t.issueSub}</span>
            </span>
            <figcaption>
              <span className="fx-rule2" aria-hidden="true" />
              {t.portraitCap}
            </figcaption>
          </figure>
        </div>

        <div className="fx-hero-foot fx-shell">
          <a className="fx-scroll" href="#index">
            {t.scroll} <span aria-hidden="true">↓</span>
          </a>
          <p className="fx-status">
            <span className="fx-dot" aria-hidden="true" />
            {t.status}
          </p>
        </div>

        <div className="fx-hero-rule" aria-hidden="true" />
        <div className="fx-hero-label" aria-hidden="true">
          Portfolio — selected works 2015 / 2026
        </div>
      </section>

      <section className="fx-section fx-index" id="index" aria-labelledby="fx-index-title">
        <div className="fx-shell">
          <header className="fx-section-head" data-reveal>
            <p className="fx-kicker">
              <span className="fx-tick" aria-hidden="true" />
              {t.indexKicker}
            </p>
            <h2 className="fx-section-title" id="fx-index-title">
              {t.indexTitle}
            </h2>
          </header>
          <dl className="fx-index-list">
            {t.indexRows.map((row, index) => (
              <div className="fx-index-row" key={row.label} data-reveal style={{ '--i': index } as CSSProperties}>
                <span className="fx-index-no">{String(index + 1).padStart(2, '0')}</span>
                <span className="fx-index-value">
                  {row.value}
                  <small>{row.unit}</small>
                </span>
                <span className="fx-index-copy">
                  <span className="fx-index-label">{row.label}</span>
                  <span className="fx-index-note">{row.note}</span>
                </span>
                <span className="fx-index-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="fx-section fx-case" id="case" aria-labelledby="fx-case-title">
        <div className="fx-shell">
          <header className="fx-case-head" data-reveal>
            <p className="fx-kicker">
              <span className="fx-tick" aria-hidden="true" />
              {t.caseKicker}
            </p>
            <h2 className="fx-case-title" id="fx-case-title">
              {t.caseTitle.map((line) => (
                <span key={line}>{line}</span>
              ))}
              <span className="fx-case-accent">{t.caseAccent}</span>
            </h2>
            <p className="fx-case-context">{t.caseContext}</p>
            <p className="fx-case-decision">{t.caseDecision}</p>
            <p className="fx-case-role">{t.caseRole}</p>
          </header>
          <div className="fx-case-metrics" data-reveal>
            {t.caseMetrics.map((metric) => (
              <div className="fx-case-metric" key={metric.label}>
                <span className={`fx-case-value${'small' in metric && metric.small ? ' fx-case-value--small' : ''}`}>
                  {metric.value}
                </span>
                <span className="fx-case-label">{metric.label}</span>
              </div>
            ))}
            <div className="fx-case-meta">
              {t.caseMeta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="fx-section fx-principles" id="principles" aria-labelledby="fx-principles-title">
        <div className="fx-shell">
          <header className="fx-section-head" data-reveal>
            <p className="fx-kicker">
              <span className="fx-tick" aria-hidden="true" />
              {t.principlesKicker}
            </p>
            <h2 className="fx-section-title" id="fx-principles-title">
              {t.principlesTitle}
            </h2>
          </header>
          <div className="fx-principle-grid">
            {t.principles.map((item, index) => (
              <article className="fx-principle" key={item.title} data-reveal style={{ '--i': index } as CSSProperties}>
                <span className="fx-principle-no">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="fx-principle-mark" aria-hidden="true">
                  ✳
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fx-section fx-method" id="method" aria-labelledby="fx-method-title">
        <div className="fx-shell fx-method-grid">
          <header className="fx-method-head" data-reveal>
            <p className="fx-kicker">
              <span className="fx-tick" aria-hidden="true" />
              {t.methodKicker}
            </p>
            <h2 className="fx-section-title" id="fx-method-title">
              {t.methodTitle}
            </h2>
          </header>
          <ol className="fx-method-list">
            {t.method.map((item, index) => (
              <li className="fx-method-row" key={item.title} data-reveal style={{ '--i': index } as CSSProperties}>
                <span className="fx-method-no">{String(index + 1).padStart(2, '0')}</span>
                <span className="fx-method-title">{item.title}</span>
                <span className="fx-method-body">{item.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="fx-section fx-writing" id="writing" aria-labelledby="fx-writing-title">
        <div className="fx-shell">
          <header className="fx-section-head" data-reveal>
            <p className="fx-kicker">
              <span className="fx-tick" aria-hidden="true" />
              {t.writingKicker}
            </p>
            <h2 className="fx-section-title" id="fx-writing-title">
              {t.writingTitle}
            </h2>
            <Link className="fx-all-link" href="/posts">
              {t.writingAll} <span aria-hidden="true">↗</span>
            </Link>
          </header>
          <div className="fx-writing-list">
            {featured.map((post, index) => (
              <Link className="fx-post-row" href={`/posts/${post.slug}`} key={post.slug} data-reveal>
                <span className="fx-post-no">{String(index + 1).padStart(2, '0')}</span>
                <span className="fx-post-main">
                  <span className="fx-post-title">{post.title}</span>
                  <span className="fx-post-summary">{post.summary}</span>
                </span>
                <span className="fx-post-date">{post.date}</span>
                <span className="fx-post-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="fx-contact" id="contact" aria-labelledby="fx-contact-title">
        <div className="fx-shell fx-contact-inner">
          <p className="fx-kicker" data-reveal>
            <span className="fx-tick" aria-hidden="true" />
            {t.contactKicker}
          </p>
          <h2 className="fx-contact-title" id="fx-contact-title">
            {t.contactTitle.map((line, index) => (
              <span key={line} data-reveal style={{ '--i': index } as CSSProperties}>
                {line}
              </span>
            ))}
          </h2>
          <a className="fx-mail" href="mailto:zsc.guru@qq.com">
            zsc.guru@qq.com <span aria-hidden="true">↗</span>
          </a>
          <p className="fx-contact-note">{t.contactNote}</p>
        </div>
      </section>
    </div>
  )
}
