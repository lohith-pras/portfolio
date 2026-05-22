import { setRequestLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'
import { type Locale } from '@/i18n/routing'
import { NavbarDesktop } from '@/components/NavbarDesktop'
import { NavbarMobile } from '@/components/NavbarMobile'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { HeroScrollFade } from '@/components/HeroScrollFade'

// ShaderCanvas uses WebGL (canvas context) — must be client-only.
// Dynamic import with ssr: false prevents "window is not defined" on server.
// Lighthouse: Next.js defers loading this chunk until hydration, not during FCP.
const ShaderCanvas = dynamic(
  () => import('@/components/ShaderCanvas').then((mod) => mod.ShaderCanvas),
  { ssr: false }
)

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
      <ShaderCanvas />

      {/*
        HeroScrollFade: Client component that mounts a GSAP ScrollTrigger
        linking shader-canvas opacity to hero scroll progress. HERO-04.
        Renders null — side-effect only.
      */}
      <HeroScrollFade />

      {/* Navigation sits above gradient (z-50 in component CSS) */}
      <NavbarDesktop />
      <NavbarMobile />

      <div className="flex flex-col">
        {/* Hero section with scramble animation + contact links. HERO-02, HERO-03. */}
        <HeroSection />

        {/* About section follows immediately after hero. */}
        <AboutSection />
      </div>
    </main>
  )
}
