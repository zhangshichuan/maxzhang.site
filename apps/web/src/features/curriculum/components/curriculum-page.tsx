import { Link, useTranslations } from '@/src/i18n/client'

interface Week {
  no: string
  title: string
  question: string
  methods: string[]
  output: string
}

interface Stage {
  no: string
  range: string
  title: string
  brief: string
  weeks: Week[]
}

interface ModelItem {
  title: string
  body: string
}

/**
 * 知识地图页
 *
 * 把 13 周课程压缩成 4 个阶段、13 张周卡片，底部补一条能力模型和材料边界说明。
 * 全部内容来自 messages 里的 CurriculumPage 命名空间，中文/英文共用同一套结构。
 */
export function CurriculumPage() {
  const t = useTranslations('CurriculumPage')
  const stages = t.raw<Stage[]>('stages') ?? []
  const modelItems = t.raw<ModelItem[]>('model.items') ?? []

  return (
    <div>
      <h1 className="page-title">{t('title')}</h1>
      <p className="page-subtitle">{t('subtitle')}</p>
      <p className="page-note">{t('note')}</p>

      {stages.map((stage) => (
        <section key={stage.no} className="cx-stage">
          <div className="nx-block-head">
            <div className="nx-block-left">
              <span className="nx-block-index">
                {stage.no} — {stage.title}
              </span>
              <span className="nx-block-side">{stage.range}</span>
            </div>
          </div>
          <p className="cx-stage-brief">{stage.brief}</p>

          <div className="cx-week-grid">
            {stage.weeks.map((week) => (
              <article key={week.no} className="cx-week">
                <header className="cx-week-head">
                  <span className="cx-week-no">{week.no}</span>
                  <h3 className="cx-week-title">{week.title}</h3>
                </header>
                <p className="cx-week-question">{week.question}</p>
                <ul className="cx-week-methods">
                  {week.methods.map((method) => (
                    <li key={method} className="chip">
                      {method}
                    </li>
                  ))}
                </ul>
                <p className="cx-week-output">
                  <span>{t('outputLabel')}</span>
                  {week.output}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section>
        <div className="nx-block-head">
          <div className="nx-block-left">
            <span className="nx-block-index">{t('model.title')}</span>
            <span className="nx-block-side">{t('model.side')}</span>
          </div>
        </div>
        <p className="kx-intro">{t('model.intro')}</p>
        <div className="cx-model-grid">
          {modelItems.map((item, index) => (
            <article key={item.title} className="cx-model">
              <span className="cx-model-no">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="cx-model-title">{item.title}</h3>
              <p className="cx-model-body">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="cx-boundary">
        <b>{t('boundaryTitle')}</b>
        {t('boundaryText')}
      </p>

      <section className="nx-contact">
        <div>
          <h2>{t('ctaTitle')}</h2>
          <p>{t('ctaText')}</p>
        </div>
        <div className="nx-contact-actions">
          <Link href="/cases">
            <button className="btn btn-primary nx-btn">
              {t('ctaPrimary')} <span aria-hidden>↗</span>
            </button>
          </Link>
          <Link href="/about">
            <button className="btn btn-secondary nx-btn">{t('ctaSecondary')}</button>
          </Link>
        </div>
      </section>
    </div>
  )
}
