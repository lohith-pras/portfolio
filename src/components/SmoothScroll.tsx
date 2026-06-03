'use client'

// Lenis smooth scroll. Interpolates wheel/trackpad scroll so GSAP `scrub` and
// Framer `useScroll` read a smoothed position — buttery scrubbing, unified feel.
// Wires lenis.on('scroll', ScrollTrigger.update) so GSAP stays in sync.
// Disabled under prefers-reduced-motion (native scroll, no interpolation).
import { useEffect } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from '@/lib/gsap'

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ duration: 1.1 })
    lenis.on('scroll', ScrollTrigger.update)

    // Fonts load async (next/font swap) — trigger positions shift once glyphs
    // settle. Recalc so scrub start/end match final layout on first paint.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return null
}
