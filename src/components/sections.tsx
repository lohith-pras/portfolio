import { getTranslations } from 'next-intl/server'
import { ContactForm } from '@/components/ContactForm'
import { IsacDiagram, LockDiagram, ConstellationDiagram } from '@/components/diagrams'

const GH = 'https://github.com/lohith-pras'

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
        <Work />
      </div>
    </section>
  )
}

// The engineering work as tiles, each showing a diagram of how the project works.
// Only facts from the CV and the thesis summary appear here.
async function Work() {
  const t = await getTranslations('work')
  const labels = (ns: string, keys: string[]) => Object.fromEntries(keys.map((k) => [k, t(`${ns}.${k}`)]))
  return (
    <ul className="bento" aria-label={t('label')}>
      <li className="tile tile--lead">
        <a href="#thesis" className="tile__link">
          <div className="tile__text">
            <h2 className="tile__name">{t('thesis.name')}</h2>
            <p className="tile__where">{t('thesis.where')}</p>
            <dl className="tile__figs">
              <div>
                <dt className="num">{t('thesis.fig1')}</dt>
                <dd>{t('thesis.fig1_label')}</dd>
              </div>
              <div>
                <dt className="num">{t('thesis.fig2')}</dt>
                <dd>{t('thesis.fig2_label')}</dd>
              </div>
            </dl>
            <p className="legend">
              <span className="legend__sense">{t('sensing')}</span>
              <span className="legend__comm">{t('comms')}</span>
            </p>
          </div>
          <IsacDiagram l={labels('thesis', ['diagram', 'tx', 'target', 'user', 'track'])} />
        </a>
      </li>
      <li className="tile">
        <a href="#ni" className="tile__link">
          <h2 className="tile__name">{t('ni.name')}</h2>
          <p className="tile__where">{t('ni.where')}</p>
          <ol className="flow">
            <li>{t('ni.step1')}</li>
            <li>{t('ni.step2')}</li>
            <li>{t('ni.step3')}</li>
          </ol>
          <p className="tile__fig">
            <span className="num">{t('ni.fig')}</span> {t('ni.fig_label')}
          </p>
        </a>
      </li>
      <li className="tile">
        <div className="tile__link">
          <h2 className="tile__name">{t('deltax.name')}</h2>
          <p className="tile__where">{t('deltax.where')}</p>
          <LockDiagram l={labels('deltax', ['diagram', 'locked', 'unlocked', 'finger', 'stand'])} />
          <p className="tile__fig">
            <span className="num">{t('deltax.fig')}</span> {t('deltax.fig_label')}
          </p>
        </div>
      </li>
      <li className="tile">
        <a href={`${GH}/modulation-classifier`} target="_blank" rel="noopener noreferrer" className="tile__link">
          <h2 className="tile__name">{t('amc.name')}</h2>
          <p className="tile__where">{t('amc.where')}</p>
          <ConstellationDiagram l={labels('amc', ['diagram'])} />
          <p className="tile__fig">
            <span className="num">{t('amc.fig')}</span> {t('amc.fig_label')}
          </p>
        </a>
      </li>
    </ul>
  )
}

export async function Thesis() {
  const t = await getTranslations('thesis')
  const rows = ['requirements', 'setup', 'physics', 'learning', 'result', 'where', 'status'] as const
  return (
    <section id="thesis" className="section section--l">
      <div className="container grid">
        <div className="head">
          <h2>{t('heading')}</h2>
          <p>{t('answer')}</p>
          <p className="aside">{t('lesson_1')}</p>
          <p className="aside">{t('lesson_2')}</p>
        </div>
        <dl className="facts">
          {rows.map((key) => (
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

// Figures from the CV's NI Dresden entry.
const NI_FIGURES = [
  { value: '< 1 min', key: 'fig_speed' },
  { value: 'Top 5', key: 'fig_rows' },
  { value: '> 6σ', key: 'fig_types' },
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
