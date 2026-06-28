import type { Metadata } from 'next'
import { Space_Mono, Plus_Jakarta_Sans, Oswald } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// FOUND-01: Fonts loaded via next/font/google — zero external network request,
// automatic preload, no layout shift, latin subset covers German umlauts (ä ö ü ß)
// 3-family stack: Oswald (display/headings) + Space Mono (mono labels) + Plus Jakarta Sans (body)

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

// Body face — Plus Jakarta Sans. Prose, body copy, captions.
const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

// Display / heading face — Oswald. Hero name + all section h2 headings.
// Condensed grotesque — carries the "signal / instrument" brand voice.
const oswald = Oswald({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

// NOTE: Courier Prime is intentionally NOT loaded here.
// It loads ONLY in src/app/[locale]/life/layout.tsx (Phase 7).
// Loading it here would add 200+ kB to every non-/life route (PITFALL).

export const metadata: Metadata = {
  title: 'Lohith Tarikere Prasanna',
  description: 'Builder with intent. AI, wireless, and mobility.',
  keywords: ['AI', 'wireless', 'mobility', 'MIMO', 'portfolio', 'engineer'],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      className={`${spaceMono.variable} ${plusJakartaSans.variable} ${oswald.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
