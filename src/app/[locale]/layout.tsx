import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { PageTransition } from '@/components/PageTransition'
import { GrainProvider } from '@/components/GrainContext'
import { SmoothScroll } from '@/components/SmoothScroll'
import { NavbarDesktop } from '@/components/NavbarDesktop'
import { NavbarMobile } from '@/components/NavbarMobile'
import { type ReactNode } from 'react'
import { type Metadata } from 'next'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  metadataBase: new URL('https://lohithprasanna.dev'),
  title: 'Lohith Tarikere Prasanna — Builder',
  description: 'Builder with intent. AI, wireless, and mobility. MIMO, VLC, IoT security.',
  openGraph: {
    title: 'Lohith Tarikere Prasanna — Builder',
    description: 'Builder with intent. AI, wireless, and mobility.',
    url: 'https://lohithprasanna.dev',
    siteName: 'Lohith Prasanna Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lohith Tarikere Prasanna — Builder',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lohith Tarikere Prasanna — Builder',
    description: 'Builder with intent. AI, wireless, and mobility.',
    images: ['/og-image.png'],
  },
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
      <GrainProvider>
        <SmoothScroll />
        <NavbarDesktop />
        <NavbarMobile />
        <PageTransition>
          {children}
        </PageTransition>
      </GrainProvider>
    </NextIntlClientProvider>
  )
}
