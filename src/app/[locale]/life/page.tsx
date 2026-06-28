import { setRequestLocale } from 'next-intl/server'
import { LifeClient } from '@/components/LifeClient'
import { type Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isDE = locale === 'de'
  return {
    title: isDE ? 'Leben' : 'Life',
    description: isDE
      ? 'Orte, Interessen und Eindrücke abseits von GitHub.'
      : 'Places, interests, and impressions beyond GitHub.',
  }
}

export default async function LifePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main id="main-content" className="w-full">
      <LifeClient />
    </main>
  )
}
