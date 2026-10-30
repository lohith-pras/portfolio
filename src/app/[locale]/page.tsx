import { setRequestLocale } from 'next-intl/server'
import { type Locale } from '@/i18n/routing'
import { Hero, Thesis, Ni, Fun, Life, Now, Contact, Footer } from '@/components/sections'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  // Required for static rendering — must be called in every page using [locale]
  setRequestLocale(locale as Locale)

  // One page, ordered as the questions a recruiter asks.
  return (
    <>
      <main id="main-content">
        <Hero />
        <Thesis />
        <Ni />
        <Fun />
        <Life />
        <Now />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
