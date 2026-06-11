import type { Metadata } from 'next'
import { Space_Mono, JetBrains_Mono, Outfit } from 'next/font/google'
import './globals.css'

// FOUND-01: Fonts loaded via next/font/google — zero external network request,
// automatic preload, no layout shift, latin subset covers German umlauts (ä ö ü ß)
const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

// Display face — JetBrains Mono. Headings + hero name.
// Space Mono is kept for small technical labels (eyebrows, ledger, tuner).
const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
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
      className={`${spaceMono.variable} ${jetbrainsMono.variable} ${outfit.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
