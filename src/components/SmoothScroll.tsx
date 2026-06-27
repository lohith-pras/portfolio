'use client'

// Lenis smooth scroll. Interpolates wheel/trackpad scroll so GSAP `scrub` and
// Framer `useScroll` read a smoothed position — buttery scrubbing, unified feel.
// Wires lenis.on('scroll', ScrollTrigger.update) so GSAP stays in sync.
// Disabled under prefers-reduced-motion (native scroll, no interpolation).
import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { setLenis } from '@/lib/lenis'
import { usePathname } from '@/i18n/navigation'

export function SmoothScroll() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    if (isHome || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    })
    lenis.on('scroll', ScrollTrigger.update)
    // Expose so programmatic scroll (e.g. project click-to-scroll) goes through
    // Lenis instead of fighting it with a raw window.scrollTo.
    setLenis(lenis)

    // Fonts load async (next/font swap) — trigger positions shift once glyphs
    // settle. Recalc so scrub start/end match final layout on first paint.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    // Drive Lenis off GSAP's ticker instead of a second requestAnimationFrame
    // loop — one clock for interpolation + ScrollTrigger.update. lagSmoothing(0)
    // stops GSAP clamping the delta after tab refocus, keeping scrub smooth.
    // gsap.ticker time is seconds; lenis.raf wants milliseconds.
    const update = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      setLenis(null)
      lenis.destroy()
    }
  }, [])

  return null
}
