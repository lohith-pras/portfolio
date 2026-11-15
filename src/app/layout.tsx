import type { Metadata } from 'next'
import { Big_Shoulders, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Big Shoulders for the name and titles (variable weight drives the hero),
// Instrument Serif italic for my own voice, JetBrains Mono for the small facts.
const display = Big_Shoulders({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const serif = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-serif', display: 'swap' })
const mono = JetBrains_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono', display: 'swap' })

const BASE = 'https://lohith-pras.vercel.app'
const title = 'Lohith Tarikere Prasanna'
const description =
  'I research intelligent sensing at the boundary of 6G communications and autonomous driving. M.Sc. student at FAU; built production AI tools at NI Dresden and worked on embedded systems at Delta X Automotive.'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title,
  description,
  openGraph: {
    title,
    description,
    url: BASE,
    siteName: title,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
  alternates: { canonical: BASE },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: title,
  url: BASE,
  jobTitle: 'M.Sc. student researching intelligent sensing for 6G and autonomous driving',
  sameAs: ['https://github.com/lohith-pras', 'https://www.linkedin.com/in/loh-pras'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
