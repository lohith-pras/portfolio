import type { ReactNode } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { type Locale } from '@/i18n/routing'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LifeLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as Locale)

  return (
    <div className="min-h-screen pt-32">
      {children}
    </div>
  )
}
