import { setRequestLocale } from 'next-intl/server'

import { type Locale } from '@/i18n/routing'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { WorkSection } from '@/components/WorkSection'

import { ShaderCanvasWrapper } from '@/components/ShaderCanvasWrapper'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  // Required for static rendering — must be called in every page using [locale]
  setRequestLocale(locale as Locale)

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-accent/30">
      {/*
        ShaderCanvas: Fixed full-bleed WebGL gradient (z-0).
        Loaded dynamically to keep SSR clean. HERO-01.
      */}
      <ShaderCanvasWrapper />



      <div className="flex flex-col">
        {/* Hero section with scramble animation + contact links. HERO-02, HERO-03. */}
        <HeroSection />

        {/* About section follows immediately after hero. */}
        <AboutSection />

        {/* Work section with waveform divider and project cards. WORK-01, WORK-02, WORK-03. */}
        <WorkSection />
      </div>
    </main>
  )
}
