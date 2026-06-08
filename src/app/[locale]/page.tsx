import { setRequestLocale } from 'next-intl/server'

import { type Locale } from '@/i18n/routing'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { ToolkitSection } from '@/components/ToolkitSection'
import { HorizontalProjects } from '@/components/HorizontalProjects'
import { ContactSection } from '@/components/ContactSection'
import { R3FRoot } from '@/components/R3FRoot'
import { DescentProvider } from '@/components/city/DescentContext'
import { CityView } from '@/components/city/CityView'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  // Required for static rendering — must be called in every page using [locale]
  setRequestLocale(locale as Locale)

  return (
    <DescentProvider>
      <main className="relative min-h-[100dvh] bg-background text-foreground selection:bg-accent/30">
        {/* CityView: Fixed full-bleed R3F View for the scroll-driven city descent. */}
        <CityView />
        <R3FRoot />

        <div className="flex flex-col">
          {/* Hero section with scramble animation + contact links. HERO-02, HERO-03. */}
          <HeroSection />

          {/* Manifesto: type-led positioning statement + bio + credential. */}
          <AboutSection />

          {/* Selected Work: sticky-stack project index. WORK-01, WORK-02, WORK-03. */}
          <HorizontalProjects />

          {/* Stack: capability ledger — supporting evidence, demoted below the work. */}
          <ToolkitSection />

          {/* Contact section: CTA with links and availability statement. */}
          <ContactSection />
        </div>
      </main>
    </DescentProvider>
  )
}
