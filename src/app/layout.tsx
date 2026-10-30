import type { Metadata } from 'next'
import { Hanken_Grotesk, Newsreader, IBM_Plex_Mono } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Almanac type stack (design.md): Hanken Grotesk heads, Newsreader prose,
// IBM Plex Mono for figures only. Exposed as CSS variables read by tokens.css.

const hanken = Hanken_Grotesk({
  weight: ['500', '600'],
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})

const newsreader = Newsreader({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lohith Tarikere Prasanna',
  description: 'I research intelligent sensing at the boundary of 6G communications and autonomous driving.',
  keywords: ['ISAC', '6G', 'autonomous driving', 'signal processing', 'V2X', 'portfolio', 'engineer'],
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
      className={`${hanken.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
