import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { Navbar } from '@/components/Navbar'
import { type ReactNode } from 'react'
import { type Metadata } from 'next'

const BASE = 'https://lohith-pras.vercel.app'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Lohith Tarikere Prasanna',
  url: BASE,
  jobTitle: 'M.Sc. student researching intelligent sensing for 6G and autonomous driving',
  sameAs: [
    'https://github.com/lohith-pras',
    'https://www.linkedin.com/in/loh-pras',
  ],
}

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('title')
  const description = t('description')
  return {
    metadataBase: new URL(BASE),
    title: {
      default: title,
      template: '%s, Lohith',
    },
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/${locale}`,
      siteName: 'Lohith Tarikere Prasanna',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${BASE}/${locale}`,
      languages: {
        en: `${BASE}/en`,
        de: `${BASE}/de`,
      },
    },
  }
}

// generateStaticParams is CRITICAL for static rendering.
// Without this, next-intl middleware forces all [locale] routes to SSR (dynamic).
// PITFALL: omitting setRequestLocale(locale) in layout/page also causes SSR.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // setRequestLocale enables static rendering for this locale segment.
  // Must be called in EVERY layout and page that uses the [locale] param.
  setRequestLocale(locale as Locale)

  const messages = await getMessages()
  const t = await getTranslations('nav')

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a className="skip" href="#main-content">
        {t('skip')}
      </a>
      <Navbar />
      {children}
    </NextIntlClientProvider>
  )
}
