import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { PageTransition } from '@/components/PageTransition'
import { GrainProvider } from '@/components/GrainContext'
import { SmoothScroll } from '@/components/SmoothScroll'
import { type ReactNode } from 'react'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
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
        {/* Navbar on hold — design TBD. NavbarDesktop/NavbarMobile components retained. */}
        <PageTransition>
          {children}
        </PageTransition>
      </GrainProvider>
    </NextIntlClientProvider>
  )
}
