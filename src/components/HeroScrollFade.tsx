'use client'

/**
 * HeroScrollFade.tsx — GSAP ScrollTrigger that scrubs shader gradient opacity on scroll.
 *
 * HERO-04: As the user scrolls from Hero toward About, the ShaderCanvas (#shader-canvas)
 * fades from opacity 1 → 0. By the time About section is fully in view, the WebGL
 * gradient is fully gone, revealing the clean dark background.
 *
 * Implementation:
 *  - trigger: "#hero" section
 *  - start: "top top" (gradient at full opacity when hero top aligns with viewport top)
 *  - end: "bottom top" (fully faded when hero bottom scrolls past viewport top)
 *  - scrub: true — opacity tied 1:1 to scroll progress (linear scrub)
 *
 * GPU cleanup: When opacity reaches 0, we set display:none to pause WebGL rendering.
 * We reverse this when opacity rises above 0 again (user scrolls back up).
 *
 * Note: This component renders no visible DOM — it only mounts the ScrollTrigger
 * as a side-effect after hydration. It is kept separate from HeroSection to preserve
 * Server Component benefits on page.tsx.
 */

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

export function HeroScrollFade() {
  const triggerRef = useRef<ScrollTrigger | null>(null)

  useEffect(() => {
    const canvas = document.getElementById('shader-canvas') as HTMLElement | null
    const hero = document.getElementById('hero') as HTMLElement | null

    if (!canvas || !hero) return

    // Kill any existing trigger on re-mount (React strict mode safety)
    triggerRef.current?.kill()

    triggerRef.current = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress // 0 at top, 1 at bottom of hero
        const opacity = 1 - progress

        // Show canvas when it has visible opacity
        if (opacity > 0 && canvas.style.display === 'none') {
          canvas.style.display = ''
        }
        canvas.style.opacity = String(opacity)

        // Release GPU when fully faded
        if (opacity <= 0) {
          canvas.style.display = 'none'
        }
      },
    })

    return () => {
      triggerRef.current?.kill()
      triggerRef.current = null
      // Restore canvas to visible state on unmount
      if (canvas) {
        canvas.style.opacity = '1'
        canvas.style.display = ''
      }
    }
  }, [])

  return null
}
