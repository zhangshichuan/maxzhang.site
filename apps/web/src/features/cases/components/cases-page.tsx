import { Link, useTranslations } from '@/src/i18n/client'

interface CaseItem {
  no: string
  name: string
  tag: string
  context: string
  user: string
  judgments: string[]
  flow: string[]
  eval: string
  reuse: string
}

/**
 * 实战案例页
 *
 * 每个案例固定六块：场景、用户、关键判断、工作流、评测、可复用。
 * 案例内容来自 messages 的 CasesPage 命名空间，结论与数字严格跟随课程材料。
 */
export function CasesPage() {
  const t = useTranslations('CasesPage')
  const cases = t.raw<CaseItem[]>('cases') ?? []

  return (
    <div>
      <h1 className="page-title">{t('title')}</h1>
      <p className="page-subtitle">{t('subtitle')}</p>
      <p className="page-note">{t('note')}</p>

      <div className="cs-list">
        {cases.map((item) => (
          <article key={item.no} className="cs-card">
            <header className="cs-card-head">
              <div className="cs-card-title">
                <span className="cs-no">{item.no}</span>
                <h2 className="cs-name">{item.name}</h2>
              </div>
              <span className="cs-tag">{item.tag}</span>
            </header>

            <dl className="cs-meta">
              <div className="cs-meta-row">
                <dt>{t('labels.context')}</dt>
                <dd>{item.context}</dd>
              </div>
              <div className="cs-meta-row">
                <dt>{t('labels.user')}</dt>
                <dd>{item.user}</dd>
              </div>
            </dl>

            <div className="cs-block">
              <h3 className="cs-block-title">{t('labels.judgments')}</h3>
              <ol className="cs-judgments">
                {item.judgments.map((judgment, index) => (
                  <li key={judgment}>
                    <span className="cs-judgment-no">{String(index + 1).padStart(2, '0')}</span>
                    <p>{judgment}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="cs-block">
              <h3 className="cs-block-title">{t('labels.flow')}</h3>
              <div className="cs-flow">
                {item.flow.map((step, index) => (
                  <span key={step} className="cs-flow-step">
                    {step}
                    {index < item.flow.length - 1 && (
                      <i className="cs-flow-arrow" aria-hidden>
                        →
                      </i>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="cs-footer">
              <div className="cs-footer-block">
                <h3 className="cs-block-title">{t('labels.eval')}</h3>
                <p>{item.eval}</p>
              </div>
              <div className="cs-footer-block">
                <h3 className="cs-block-title">{t('labels.reuse')}</h3>
                <p>{item.reuse}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="nx-contact">
        <div>
          <h2>{t('ctaTitle')}</h2>
          <p>{t('ctaText')}</p>
        </div>
        <div className="nx-contact-actions">
          <Link href="/curriculum">
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
