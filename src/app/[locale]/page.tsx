import { setRequestLocale } from 'next-intl/server'

import { type Locale } from '@/i18n/routing'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { ProjectsSection } from '@/components/ProjectsSection'
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
      <main className="relative min-h-screen bg-background text-foreground [overflow-x:clip] selection:bg-accent/30">
        {/*
          CityView: Fixed full-bleed R3F View for the scroll-driven city descent.
          Renders into the shared Canvas via View — single WebGL context.
          (SignalField.tsx is now unused; file retired in M15.)
        */}
        <CityView />
        <R3FRoot />

        <div className="flex flex-col">
          {/* Hero section with scramble animation + contact links. HERO-02, HERO-03. */}
          <HeroSection />

          {/* About section follows immediately after hero. */}
          <AboutSection />

          {/* Projects section with waveform divider and project cards. WORK-01, WORK-02, WORK-03. */}
          <ProjectsSection />
        </div>
      </main>
    </DescentProvider>
  )
}
