import { getTranslations } from 'next-intl/server'
import { ContactForm } from '@/components/ContactForm'

const GH = 'https://github.com/lohith-pras'

// The engineering index in the hero. The thesis row is the one the page points at.
const HERO_ROWS = [
  { key: 'thesis', href: '#thesis', marked: true },
  { key: 'ni', href: '#ni' },
  { key: 'drl', href: `${GH}/isac-drl` },
  { key: 'amc', href: `${GH}/modulation-classifier` },
  { key: 'vlc' },
] as const

export async function Hero() {
  const t = await getTranslations('hero')
  return (
    <section id="top" className="hero">
      <div className="container grid hero__grid">
        <div className="hero__head">
          <h1>{t('name')}</h1>
          <p className="lead">{t('lead')}</p>
          <p className="small">{t('byline')}</p>
        </div>
        <div className="hero__actions">
          <a className="btn btn--primary" href="mailto:lnlohith3@gmail.com">
            {t('email')}
          </a>
          <a className="btn" href="/Lohith_Prasanna_Resume.pdf" target="_blank" rel="noopener noreferrer">
            {t('cv')}
          </a>
        </div>
        <figure className="hero__index">
          <table className="table">
            <caption>{t('table_caption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('col_project')}</th>
                <th scope="col">{t('col_field')}</th>
                <th scope="col">{t('col_result')}</th>
              </tr>
            </thead>
            <tbody>
              {HERO_ROWS.map((row) => {
                const name = t(`rows.${row.key}.name`)
                const external = 'href' in row && row.href.startsWith('http')
                return (
                  <tr key={row.key} className={'marked' in row ? 'is-marked' : undefined}>
                    <td>
                      {'href' in row ? (
                        <a href={row.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                          {name}
                        </a>
                      ) : (
                        name
                      )}
                    </td>
                    <td>{t(`rows.${row.key}.field`)}</td>
                    <td>{t(`rows.${row.key}.result`)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </figure>
      </div>
    </section>
  )
}

export async function Thesis() {
  const t = await getTranslations('thesis')
  const rows = ['problem', 'model', 'method', 'tools', 'where'] as const
  return (
    <section id="thesis" className="section section--l">
      <div className="container grid">
        <div className="head">
          <h2>{t('heading')}</h2>
          <p>{t('answer')}</p>
        </div>
        <dl className="facts">
          {rows.map((key) => (
            <div key={key}>
              <dt>{t(`${key}_label`)}</dt>
              <dd>{t(key)}</dd>
            </div>
          ))}
          <div>
            <dt>{t('status_label')}</dt>
            <dd>
              <span className="num">{t('phase')}</span>. {t('status')}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

// Figures are the user's own numbers from the NI Dresden write-up.
const NI_FIGURES = [
  { value: '5-10×', key: 'fig_speed' },
  { value: '100k+', key: 'fig_rows' },
  { value: '30-40', key: 'fig_types' },
] as const

export async function Ni() {
  const t = await getTranslations('ni')
  const notes = ['how', 'wrong', 'change'] as const
  return (
    <section id="ni" className="band">
      <div className="container grid">
        <div className="head">
          <h2>{t('heading')}</h2>
        </div>
        <p className="lead">{t('lead')}</p>
        <dl className="stats">
          {NI_FIGURES.map(({ value, key }) => (
            <div key={key}>
              <dt>{value}</dt>
              <dd>{t(key)}</dd>
            </div>
          ))}
        </dl>
        <div className="notes">
          {notes.map((key) => (
            <div key={key}>
              <h3>{t(`${key}_label`)}</h3>
              <p>{t(key)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FUN = [
  { key: 'can_decoder', repo: 'can_decoder' },
  { key: 'sprachboot', repo: 'sprachboot' },
  { key: 'nest', repo: 'nest' },
  { key: 'f1_dashboard', repo: 'f1-dashboard' },
  { key: 'prompt_analysis', repo: 'prompt_analysis' },
  { key: 'career_ops', repo: 'career-ops' },
] as const

export async function Fun() {
  const t = await getTranslations('fun')
  return (
    <section id="work" className="section">
      <div className="container grid">
        <div className="head">
          <h2>{t('heading')}</h2>
        </div>
        <table className="table index">
          <thead>
            <tr>
              <th scope="col">{t('col_project')}</th>
              <th scope="col">{t('col_what')}</th>
              <th scope="col">{t('col_stack')}</th>
            </tr>
          </thead>
          <tbody>
            {FUN.map(({ key, repo }) => {
              const name = t(`rows.${key}.name`)
              return (
                <tr key={key}>
                  <td>
                    <a href={`${GH}/${repo}`} target="_blank" rel="noopener noreferrer" aria-label={t('code', { name })}>
                      {name}
                    </a>
                  </td>
                  <td>{t(`rows.${key}.what`)}</td>
                  <td>{t(`rows.${key}.stack`)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export async function Life() {
  const t = await getTranslations('life')
  const places = ['bengaluru', 'nurnberg', 'dresden'] as const
  return (
    <section id="life" className="section section--l">
      <div className="container grid">
        <div className="head">
          <h2>{t('heading')}</h2>
        </div>
        <ul className="places grid">
          {places.map((key) => (
            <li key={key}>
              <h3>{t(`${key}.name`)}</h3>
              <p>{t(`${key}.line`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export async function Now() {
  const t = await getTranslations('now')
  const items = ['watching', 'reading', 'building', 'eating', 'learning', 'following'] as const
  return (
    <section id="now" className="section">
      <div className="container grid">
        <div className="head">
          <h2>{t('heading')}</h2>
        </div>
        <dl className="now">
          {items.map((key) => (
            <div key={key}>
              <dt>{t(`${key}_label`)}</dt>
              <dd>{t(key)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

const CHANNELS = [
  { key: 'email_label', href: 'mailto:lnlohith3@gmail.com', text: 'lnlohith3@gmail.com' },
  { key: 'linkedin_label', href: 'https://www.linkedin.com/in/loh-pras', text: 'loh-pras' },
  { key: 'github_label', href: GH, text: 'lohith-pras' },
] as const

export async function Contact() {
  const t = await getTranslations('contact')
  return (
    <section id="contact" className="band--ink">
      <div className="container grid">
        <div className="head">
          <h2>{t('heading')}</h2>
          <p>{t('availability')}</p>
          <p>{t('fastest')}</p>
          <ContactForm />
        </div>
        <dl className="channels">
          {CHANNELS.map(({ key, href, text }) => (
            <div key={key}>
              <dt>{t(key)}</dt>
              <dd>
                <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {text}
                </a>
              </dd>
            </div>
          ))}
          <div>
            <dt>{t('cv_label')}</dt>
            <dd>
              <a href="/Lohith_Prasanna_Resume.pdf" target="_blank" rel="noopener noreferrer">
                {t('cv_link')}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export async function Footer() {
  const t = await getTranslations('footer')
  return (
    <footer className="footer">
      <div className="container footer__row">
        <p>{t('line')}</p>
        <p className="footer__links">
          <a href={`${GH}/portfolio`} target="_blank" rel="noopener noreferrer">
            {t('source')}
          </a>
          <a href="https://instagram.com/lohith_pras" target="_blank" rel="noopener noreferrer">
            {t('instagram')}
          </a>
        </p>
      </div>
    </footer>
  )
}
