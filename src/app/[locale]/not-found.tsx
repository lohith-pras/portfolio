import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

/** Localized 404. Renders inside [locale]/layout, so it inherits the nav. */
export default async function NotFound() {
  const t = await getTranslations('notfound')
  return (
    <main id="main-content" className="lost">
      <div className="container grid">
        <div className="head">
          <h1>{t('heading')}</h1>
          <p>{t('body')}</p>
          <p>
            <Link className="btn" href="/">
              {t('home')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
