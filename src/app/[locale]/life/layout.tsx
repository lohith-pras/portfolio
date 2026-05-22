import { Courier_Prime } from 'next/font/google'
import type { ReactNode } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { type Locale } from '@/i18n/routing'

const courierPrime = Courier_Prime({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-courier-prime',
  display: 'swap',
})

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LifeLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as Locale)

  return (
    <div className={`${courierPrime.variable} font-life min-h-screen pt-32`}>
      {children}
    </div>
  )
}
