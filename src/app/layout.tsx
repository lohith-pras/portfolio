import type { Metadata } from 'next'
import { Space_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

// FOUND-01: Fonts loaded via next/font/google — zero external network request,
// automatic preload, no layout shift, latin subset covers German umlauts (ä ö ü ß)
const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${plusJakartaSans.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
