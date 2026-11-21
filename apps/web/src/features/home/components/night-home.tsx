import type { PostSummaryWithViews } from '@/src/features/posts/model'
import { Link, useLocale } from '@/src/i18n/client'
import Avatar from '@/src/features/about/avatar.jpg'
import type { CSSProperties } from 'react'
import { NightShell } from '@/src/shared/components/night'

interface NightHomeProps {
  posts: PostSummaryWithViews[]
}

const copy = {
  en: {
    hero: {
      kicker: 'Personnel file 001 / AI product manager',
      titleLead: 'Building intelligent products with a ',
      titleAccent: 'designer’s eye.',
      cnLine: '把模型能力，做成用户真正信任的产品。',
      lede: 'Ten years turning model capability into products people trust. 0→1 launches, +80% retention, and the unglamorous work of making AI feel dependable.',
      workCta: 'Inspect the work',
      channelCta: 'Open channel',
    },
    personnel: {
      live: 'Human in the loop',
      fig: 'Fig. 01',
      name: 'Max Zhang',
      role: 'AI Product Manager',
      location: 'Shenzhen / Shanghai',
      tag: 'OPEN / 2026',
    },
    metricsLabel: 'Key numbers',
    metrics: [
      {
        label: 'Experience',
        value: '10',
        unit: '+ yrs',
        width: '86%',
        note: 'From 0→1 to platform scale',
        tone: 'mint',
      },
      {
        label: 'Products launched',
        value: '0→1',
        unit: '',
        width: '62%',
        note: 'Ambiguous capability → usable product',
        tone: 'mint',
      },
      {
        label: 'Retention lift',
        value: '+80',
        unit: '%',
        width: '80%',
        note: 'Built the loop, not just the launch',
        tone: 'amber',
      },
      {
        label: 'Native domain',
        value: 'AI',
        unit: '/ ML',
        width: '74%',
        note: 'Evaluation · guardrails · human-in-loop',
        tone: 'mint',
      },
    ],
    work: {
      index: '02',
      title: 'Selected signal',
      link: 'Discuss this case',
      caseLead: 'The team was the ',
      caseAccent: 'bottleneck.',
      lede: 'A media team needed to ship far more video without adding headcount. The constraint was not generation quality. It was the review loop.',
      facts: [
        {
          label: 'Context',
          body: 'Production capacity capped by senior editors. More demand meant more coordination, not more output.',
        },
        {
          label: 'Decision',
          body: 'Rebuild the workflow around judgment: brief → script → generation → review. Every step exposes a decision.',
        },
      ],
      panelNumber: 'Case 01',
      panelName: '/ AI video pipeline',
      panelYear: '2025',
      bars: [
        { label: 'Delivery velocity', value: '+80%', width: '80%', tone: 'mint', accent: true },
        { label: 'Cost / video · before', value: '¥2.5–3', width: '100%', tone: 'amber', accent: false },
        { label: 'Cost / video · after', value: '¥0.5–1', width: '30%', tone: 'mint', accent: true },
      ],
      flowLabel: 'Workflow',
      flow: ['Brief', 'Script', 'Generate', 'Review'],
    },
    principles: {
      index: '03',
      title: 'Operating principles',
      link: 'Read the method',
      items: [
        {
          title: 'Taste is a product skill.',
          body: 'Model output is infinite. Selection is the job. The best interface is often a well-made cut.',
        },
        {
          title: 'Ship trust, not demos.',
          body: 'A demo shows capability; a product earns the second use. Design for the return visit.',
        },
        {
          title: 'The model is never the product.',
          body: 'The product is the workflow, the guardrails, and the feedback loop around it.',
        },
      ],
    },
    method: {
      index: '04',
      title: 'Method / four decisions',
      link: 'Start a project',
      steps: [
        {
          title: 'Frame the real job',
          body: 'Interrogate the workflow before touching the model. Most AI briefs hide a process problem.',
        },
        {
          title: 'Prototype the trust',
          body: 'Put the smallest real loop in front of real people. Watch where they hesitate.',
        },
        {
          title: 'Instrument the loop',
          body: 'Measure where judgment is lost, not just clicks. Rejection reasons are product data.',
        },
        {
          title: 'Ship and learn',
          body: 'Small releases, brutal reviews, compounding quality. The second version is the product.',
        },
      ],
    },
    writing: {
      index: '05',
      title: 'Writing / field notes',
      link: 'All writing',
      empty: 'Field notes are being written.',
    },
    contact: {
      index: '06 / Open channel',
      titleLead: 'Let’s build something ',
      titleAccent: 'intelligent.',
      status: 'Status: open for select projects',
      body: 'AI product management, advisory, and the occasional impossible workflow. Shenzhen / Shanghai, working globally.',
    },
    footer: {
      brand: 'MZ® / Max Zhang / AI Product Manager',
      writing: 'Writing',
      photos: 'Photography',
      about: 'About',
      search: 'Search',
      chat: 'Tree Hole',
      github: 'GitHub',
      email: 'Email',
      location: 'Shenzhen / Shanghai',
      copyright: `© ${new Date().getFullYear()} · Max Zhang`,
    },
  },
  zh: {
    hero: {
      kicker: '人员档案 001 / AI 产品经理',
      titleLead: '把模型能力，做成',
      titleAccent: '用户真正信任的产品。',
      cnLine: '用设计师的眼光，构建智能产品。',
      lede: '十年产品经验，把模型能力做成用户真正信任的产品。0→1 落地，+80% 留存，以及那些让 AI 值得依赖、却不性感的工作。',
      workCta: '查看作品',
      channelCta: '联系我',
    },
    personnel: {
      live: '人在回路',
      fig: '图 01',
      name: 'Max Zhang',
      role: 'AI 产品经理',
      location: '深圳 / 上海',
      tag: '开放 / 2026',
    },
    metricsLabel: '关键数字',
    metrics: [
      {
        label: '产品经验',
        value: '10',
        unit: '+ 年',
        width: '86%',
        note: '从 0→1 到平台化规模',
        tone: 'mint',
      },
      {
        label: '从零到一',
        value: '0→1',
        unit: '',
        width: '62%',
        note: '把模糊的模型能力，变成用户会用的产品',
        tone: 'mint',
      },
      {
        label: '留存提升',
        value: '+80',
        unit: '%',
        width: '80%',
        note: '不只是一次发布，而是持续运转的闭环',
        tone: 'amber',
      },
      {
        label: '核心领域',
        value: 'AI',
        unit: '/ ML',
        width: '74%',
        note: '评测 · 护栏 · 模型在环工作流',
        tone: 'mint',
      },
    ],
    work: {
      index: '02',
      title: '精选信号',
      link: '聊聊这个案例',
      caseLead: '团队才是',
      caseAccent: '瓶颈。',
      lede: '一个内容团队需要在不增加人力的前提下，产出更多视频。瓶颈不在生成质量，而在审核闭环。',
      facts: [
        {
          label: '背景',
          body: '产能被资深编辑卡住。需求越多，协调越多，产出并没有变多。',
        },
        {
          label: '决策',
          body: '围绕判断力重构流程：简报 → 脚本 → 生成 → 审核。每一步都暴露一个决策。',
        },
      ],
      panelNumber: '案例 01',
      panelName: '/ AI 视频流水线',
      panelYear: '2025',
      bars: [
        { label: '交付速度', value: '+80%', width: '80%', tone: 'mint', accent: true },
        { label: '单条成本 · 之前', value: '¥2.5–3', width: '100%', tone: 'amber', accent: false },
        { label: '单条成本 · 之后', value: '¥0.5–1', width: '30%', tone: 'mint', accent: true },
      ],
      flowLabel: '工作流',
      flow: ['简报', '脚本', '生成', '审核'],
    },
    principles: {
      index: '03',
      title: '工作原则',
      link: '阅读方法',
      items: [
        {
          title: '品味是产品能力。',
          body: '模型输出是无限的，选择才是工作。最好的界面，往往是一次好的取舍。',
        },
        {
          title: '交付信任，不是 demo。',
          body: 'demo 证明能力，产品赢得第二次使用。为回访而设计。',
        },
        {
          title: '模型永远不是产品。',
          body: '产品是工作流、护栏，以及围绕模型的反馈闭环。',
        },
      ],
    },
    method: {
      index: '04',
      title: '方法 / 四个决策',
      link: '开始一个项目',
      steps: [
        {
          title: '先定义真问题',
          body: '在碰模型之前，先把工作流问清楚。多数 AI 需求背后，藏着一个流程问题。',
        },
        {
          title: '先原型信任',
          body: '把最小的真实闭环，放到真实用户面前。观察他们在哪里犹豫。',
        },
        {
          title: '度量闭环',
          body: '关注判断力在哪里流失，而不只是点击。拒绝理由也是产品数据。',
        },
        {
          title: '发布与学习',
          body: '小步发布，严格复盘，让质量复利。第二版才是产品。',
        },
      ],
    },
    writing: {
      index: '05',
      title: '写作 / 现场笔记',
      link: '全部文章',
      empty: '现场笔记正在写。',
    },
    contact: {
      index: '06 / 开放沟通',
      titleLead: '一起做点',
      titleAccent: '真正智能的事。',
      status: '状态：开放少量合作',
      body: 'AI 产品管理、顾问，以及偶尔不可能的工作流。深圳 / 上海，面向全球协作。',
    },
    footer: {
      brand: 'MZ® / Max Zhang / AI 产品经理',
      writing: '写作',
      photos: '摄影',
      about: '关于',
      search: '搜索',
      chat: '树洞',
      github: 'GitHub',
      email: '邮件',
      location: '深圳 / 上海',
      copyright: `© ${new Date().getFullYear()} · Max Zhang`,
    },
  },
} as const

const categoryLabels: Record<string, string> = {
  Frontend: '前端',
  Backend: '后端',
  DevOps: '运维',
}

export function NightHome({ posts }: NightHomeProps) {
  const locale = useLocale()
  const t = copy[locale === 'zh' ? 'zh' : 'en']
  const featured = posts.slice(0, 3)
  const contactHref = '#contact'

  return (
    <NightShell>
      <section className="ni-hero" aria-labelledby="ni-hero-title">
        <div>
          <p className="ni-kicker ni-mono">{t.hero.kicker}</p>
          <h1 id="ni-hero-title">
            {t.hero.titleLead}
            <span className="ni-mint-text">{t.hero.titleAccent}</span>
          </h1>
          <p className="ni-cn-line">{t.hero.cnLine}</p>
          <p className="ni-lede">{t.hero.lede}</p>
          <div className="ni-actions">
            <a className="ni-btn" href="#work">
              {t.hero.workCta} <span aria-hidden="true">↗</span>
            </a>
            <a className="ni-btn ni-btn--ghost" href="mailto:zsc.guru@qq.com">
              {t.hero.channelCta}
            </a>
          </div>
        </div>

        <aside className="ni-personnel" aria-label={t.personnel.name}>
          <div className="ni-personnel-top ni-mono">
            <span>
              <b aria-hidden="true">●</b> {t.personnel.live}
            </span>
            <span>{t.personnel.fig}</span>
          </div>
          <div className="ni-personnel-photo">
            <img src={Avatar} alt={t.personnel.name} width={952} height={952} />
          </div>
          <div className="ni-personnel-cap">
            <div>
              <h2>{t.personnel.name}</h2>
              <p>
                {t.personnel.role}
                <br />
                {t.personnel.location}
              </p>
            </div>
            <span className="ni-tag ni-mono">{t.personnel.tag}</span>
          </div>
        </aside>
      </section>

      <section className="ni-metrics" aria-label={t.metricsLabel}>
        {t.metrics.map((metric, index) => (
          <div className="ni-metric" data-tone={metric.tone === 'amber' ? 'amber' : undefined} key={metric.label}>
            <div className="ni-metric-label ni-mono">
              <span>{metric.label}</span>
              <i aria-hidden="true">{String(index + 1).padStart(2, '0')}</i>
            </div>
            <span className="ni-metric-value">
              {metric.value}
              {metric.unit ? <small>{metric.unit}</small> : null}
            </span>
            <div className="ni-bar">
              <span style={{ '--w': metric.width } as CSSProperties} />
            </div>
            <span className="ni-metric-note">{metric.note}</span>
          </div>
        ))}
      </section>

      <section className="ni-section" id="work" aria-labelledby="ni-work-title">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">{t.work.index}</span>
          <h2 id="ni-work-title">{t.work.title}</h2>
          <a className="ni-section-link" href={contactHref}>
            {t.work.link} ↗
          </a>
        </header>

        <div className="ni-case">
          <div>
            <h3>
              {t.work.caseLead}
              <em>{t.work.caseAccent}</em>
            </h3>
            <p className="ni-lede">{t.work.lede}</p>
            <div className="ni-case-facts">
              {t.work.facts.map((fact) => (
                <div className="ni-fact" key={fact.label}>
                  <span className="ni-mono">{fact.label}</span>
                  <p>{fact.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ni-panel">
            <div className="ni-panel-head ni-mono">
              <span>
                <b>{t.work.panelNumber}</b> {t.work.panelName}
              </span>
              <span>{t.work.panelYear}</span>
            </div>
            {t.work.bars.map((bar) => (
              <div className="ni-bar-row" key={bar.label}>
                <div className="ni-bar-label">
                  <span>{bar.label}</span>
                  <b className={bar.accent ? 'ni-mint-text' : undefined}>{bar.value}</b>
                </div>
                <div className="ni-track" data-tone={bar.tone === 'amber' ? 'amber' : undefined}>
                  <span style={{ '--w': bar.width } as CSSProperties} />
                </div>
              </div>
            ))}
            <div className="ni-flow" aria-label={t.work.flowLabel}>
              {t.work.flow.map((step, index) => (
                <div className="ni-flow-step" key={step}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <b>{step}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ni-section" id="principles" aria-labelledby="ni-principles-title">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">{t.principles.index}</span>
          <h2 id="ni-principles-title">{t.principles.title}</h2>
          <a className="ni-section-link" href="#method">
            {t.principles.link} ↗
          </a>
        </header>
        <div className="ni-principles">
          {t.principles.items.map((item, index) => (
            <div className="ni-principle" key={item.title}>
              <span className="ni-index ni-mono">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ni-section" id="method" aria-labelledby="ni-method-title">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">{t.method.index}</span>
          <h2 id="ni-method-title">{t.method.title}</h2>
          <a className="ni-section-link" href={contactHref}>
            {t.method.link} ↗
          </a>
        </header>
        <div className="ni-method">
          {t.method.steps.map((step, index) => (
            <div className="ni-method-step" key={step.title}>
              <span className="ni-index ni-mono" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ni-section" id="writing" aria-labelledby="ni-writing-title">
        <header className="ni-section-head">
          <span className="ni-index ni-mono">{t.writing.index}</span>
          <h2 id="ni-writing-title">{t.writing.title}</h2>
          <Link className="ni-section-link" href="/posts">
            {t.writing.link} ↗
          </Link>
        </header>
        <div className="ni-writing">
          {featured.length ? (
            featured.map((post, index) => (
              <Link className="ni-post" href={`/posts/${post.slug}`} key={post.slug}>
                <span className="ni-index ni-mono" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{post.title}</h3>
                <span className="ni-post-cat ni-mono">
                  {locale === 'zh' ? (categoryLabels[post.category] ?? post.category) : post.category}
                </span>
                <span className="ni-post-date ni-mono">{post.date}</span>
                <span className="ni-post-go" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))
          ) : (
            <p className="ni-lede">{t.writing.empty}</p>
          )}
        </div>
      </section>

      <section className="ni-contact" id="contact" aria-labelledby="ni-contact-title">
        <div>
          <p className="ni-mono" style={{ margin: '0 0 14px', color: 'var(--ni-muted)' }}>
            {t.contact.index}
          </p>
          <h2 id="ni-contact-title">
            {t.contact.titleLead}
            <span>{t.contact.titleAccent}</span>
          </h2>
          <a className="ni-email" href="mailto:zsc.guru@qq.com">
            zsc.guru@qq.com
          </a>
        </div>
        <div className="ni-contact-side">
          <span className="ni-mono">{t.contact.status}</span>
          <p>{t.contact.body}</p>
        </div>
      </section>

      <footer className="ni-footer">
        <div className="ni-foot ni-mono">
          <span>{t.footer.brand}</span>
          <nav className="ni-foot-nav" aria-label="Footer">
            <Link href="/posts">{t.footer.writing}</Link>
            <Link href="/photos">{t.footer.photos}</Link>
            <Link href="/about">{t.footer.about}</Link>
            <Link href="/search">{t.footer.search}</Link>
          </nav>
          <span>
            <a href="https://github.com/zhangshichuan" target="_blank" rel="noreferrer">
              {t.footer.github} ↗
            </a>{' '}
            · <a href="mailto:zsc.guru@qq.com">{t.footer.email}</a> · <Link href="/chat">{t.footer.chat}</Link>
          </span>
          <span>
            {t.footer.copyright} · {t.footer.location}
          </span>
        </div>
      </footer>
    </NightShell>
  )
}
