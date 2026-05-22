import { setRequestLocale } from 'next-intl/server'
import { type Locale } from '@/i18n/routing'
import { NavbarDesktop } from '@/components/NavbarDesktop'
import { NavbarMobile } from '@/components/NavbarMobile'
import { AboutSection } from '@/components/AboutSection'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  // Required for static rendering — must be called in every page using [locale]
  setRequestLocale(locale as Locale)

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-accent/30">
      <NavbarDesktop />
      <NavbarMobile />
      
      {/* 
        Hero, Work, and Contact sections will be added in subsequent phases.
        For now, just render the About section per Phase 2 requirements.
      */}
      <div className="flex flex-col">
        <AboutSection />
      </div>
    </main>
  )
}
