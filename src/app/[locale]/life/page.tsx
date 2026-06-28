import { setRequestLocale } from 'next-intl/server'
import { LifeClient } from '@/components/LifeClient'

type Props = {
  params: Promise<{ locale: string }>
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
