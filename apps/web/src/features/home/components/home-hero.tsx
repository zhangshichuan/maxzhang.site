import { Link, useTranslations } from '@/src/i18n/client'

interface Kpi {
  label: string
  value: string
  unit: string
  note: string
}

export function HomeHero() {
  const t = useTranslations('HomePage.hero')
  const tHome = useTranslations('HomePage')
  const kpis = tHome.raw<Kpi[]>('kpis') ?? []

  return (
    <section className="os-hero">
      <div className="os-kicker">
        <span className="os-dot" aria-hidden />
        {t('eyebrow')}
      </div>

      <h1 className="os-hero-title">
        {t('headline1')}
        <br />
        <span>{t('headline2')}</span>
      </h1>

      <p className="os-lede">{t('lede')}</p>

      <div className="os-actions">
        <Link href="mailto:zsc.guru@qq.com">
          <button className="btn btn-primary os-btn">
            {t('email')} <span aria-hidden>↗</span>
          </button>
        </Link>
        <Link href="/posts">
          <button className="btn btn-ghost os-btn">{t('notes')}</button>
        </Link>
      </div>

      <div className="os-kpis">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="os-kpi">
            <span className="os-kpi-label">{kpi.label}</span>
            <span className="os-kpi-value">
              {kpi.value}
              {kpi.unit && <em>{kpi.unit}</em>}
            </span>
            <span className="os-kpi-note">{kpi.note}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
