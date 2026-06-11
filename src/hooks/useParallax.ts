'use client'

import { type RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Scrub-tied vertical parallax for decorative layers (ghost numerals, heading
 * wrappers). Drifts from +shift to -shift while `trigger` crosses the viewport,
 * so the layer moves slower than the page — depth without a second scroll clock.
 *
 * Decorative only: no-op under prefers-reduced-motion (vestibular trigger).
 * Never attach to an element another tween moves on y — transforms collide.
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  shift: number,
  trigger?: RefObject<HTMLElement | null>,
) {
  const reduce = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (reduce || !el) return
      gsap.fromTo(
        el,
        { y: shift },
        {
          y: -shift,
          ease: 'none',
          scrollTrigger: {
            trigger: trigger?.current ?? el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    },
    { dependencies: [reduce] },
  )
}
