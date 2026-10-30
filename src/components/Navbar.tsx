import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

// Floating pill of in-page anchors. One page, so every link is a hash;
// the language switch is a plain link to the other locale's home.
export async function Navbar() {
  const t = await getTranslations('nav')
  const locale = await getLocale()
  const other = locale === 'en' ? 'de' : 'en'

  const anchors = [
    { href: '#thesis', label: t('thesis') },
    { href: '#ni', label: t('work') },
    { href: '#life', label: t('life') },
    { href: '#contact', label: t('contact') },
  ]

  return (
    <header className="nav">
      <nav className="nav__pill" aria-label={t('label')}>
        <a className="nav__mark" href="#top" aria-label={t('home')}>
          LTP
        </a>
        <ul className="nav__links">
          {anchors.map(({ href, label }) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <a className="nav__aux" href="/Lohith_Prasanna_Resume.pdf" target="_blank" rel="noopener noreferrer">
          {t('resume')}
        </a>
        <Link className="nav__aux" href="/" locale={other} hrefLang={other} aria-label={t('switch_label')}>
          {t('switch')}
        </Link>
      </nav>
    </header>
  )
}
