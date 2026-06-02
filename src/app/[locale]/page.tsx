import { setRequestLocale } from 'next-intl/server'

import { type Locale } from '@/i18n/routing'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { ProjectsSection } from '@/components/ProjectsSection'
// SignalFieldWrapper: Client Component that lazy-loads the R3F particle background.
// ssr:false dynamic() must live in a Client Component — page.tsx is a Server Component.
// ShaderCanvasWrapper is now dead code (left in place per project convention).
import { SignalFieldWrapper } from '@/components/SignalFieldWrapper'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  // Required for static rendering — must be called in every page using [locale]
  setRequestLocale(locale as Locale)

  return (
    <main className="relative min-h-screen bg-background text-foreground [overflow-x:clip] selection:bg-accent/30">
      {/*
        SignalField: Fixed full-bleed R3F particle background (z-0).
        Renders into the shared Canvas via View — single WebGL context. HERO-01.
      */}
      <SignalFieldWrapper />

      <div className="flex flex-col">
        {/* Hero section with scramble animation + contact links. HERO-02, HERO-03. */}
        <HeroSection />

        {/* About section follows immediately after hero. */}
        <AboutSection />

        {/* Projects section with waveform divider and project cards. WORK-01, WORK-02, WORK-03. */}
        <ProjectsSection />
      </div>
    </main>
  )
}
