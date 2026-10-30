import { setRequestLocale } from 'next-intl/server'
import { type Locale } from '@/i18n/routing'
import { StaticHero } from '@/components/hero/StaticHero'
import { AboutSection } from '@/components/AboutSection'
import { SectionDivider } from '@/components/SectionDivider'
import { HorizontalProjects } from '@/components/HorizontalProjects'
import { ContactSection } from '@/components/ContactSection'
import { ScrollSnapActivator } from '@/components/ScrollSnapActivator'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  // Required for static rendering — must be called in every page using [locale]
  setRequestLocale(locale as Locale)

  return (
    <main id="main-content" className="relative min-h-[100dvh] text-foreground selection:bg-accent/30">
      <ScrollSnapActivator />
      <div className="flex flex-col">
        {/* Static typographic hero with scroll-linked motion */}
        <StaticHero />

        {/* Manifesto: type-led positioning statement + bio + credential */}
        <AboutSection />

        {/* Narrative breath — scrub-revealed divider before the radar section */}
        <SectionDivider />

        {/* Selected Work: sticky-stack project index */}
        <HorizontalProjects />

        {/* Contact section: CTA with links and availability statement */}
        <ContactSection />
      </div>
    </main>
  )
}
