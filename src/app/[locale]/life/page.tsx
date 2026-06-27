import { setRequestLocale } from 'next-intl/server'
import { LifeClient } from '@/components/LifeClient'
import { PlacesSection } from '@/components/PlacesSection'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function LifePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <main id="main-content" className="max-w-4xl mx-auto px-6 pb-16">
        <LifeClient />
      </main>
      <PlacesSection />
    </>
  )
}
