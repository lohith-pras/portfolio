import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { PageTransition } from '@/components/PageTransition'

import { SmoothScroll } from '@/components/SmoothScroll'
import { GrainCanvas } from '@/components/GrainCanvas'
import { IntroLoader } from '@/components/IntroLoader'
import { Navbar } from '@/components/Navbar'
import { type ReactNode } from 'react'
import { type Metadata } from 'next'

const BASE = 'https://lohith-pras.vercel.app'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Lohith Tarikere Prasanna',
  url: BASE,
  jobTitle: 'M.Sc. Student, Electrical Engineering',
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
  return {
    metadataBase: new URL(BASE),
    title: {
      default: 'Lohith Tarikere Prasanna — Builder',
      template: '%s — Lohith',
    },
    description: 'Builder with intent. AI, wireless, and mobility. MIMO, VLC, IoT security.',
    openGraph: {
      title: 'Lohith Tarikere Prasanna — Builder',
      description: 'Builder with intent. AI, wireless, and mobility.',
      url: `${BASE}/${locale}`,
      siteName: 'Lohith Prasanna Portfolio',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Lohith Tarikere Prasanna — Builder',
        },
      ],
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Lohith Tarikere Prasanna — Builder',
      description: 'Builder with intent. AI, wireless, and mobility.',
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

  // Fetch messages for the current locale
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-accent focus:bg-paper focus:px-5 focus:py-2.5 focus:font-mono focus:text-sm focus:uppercase focus:tracking-widest focus:text-accent"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <GrainCanvas />
      <IntroLoader />
      <Navbar />
      <PageTransition>
        {children}
      </PageTransition>
    </NextIntlClientProvider>
  )
}
