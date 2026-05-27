'use client'

/**
 * HeroTitle.tsx — Hero name display with GSAP character scramble entry animation.
 *
 * HERO-02: Space Mono font, fluid scale (var(--type-hero)), tracking-[-0.04em], leading-none.
 * HERO-03: On mount, plays GSAP ScrambleTextPlugin animation resolving to real name in 600–800ms.
 *
 * Animation design:
 *  - ScrambleTextPlugin starts with technical/hex charset scramble
 *  - Resolves to "Lohith Tarikere Prasanna" character-by-character
 *  - Duration: 0.75s (midpoint of 600–800ms window) with 80ms delay for load paint
 *  - chars: 'upperCase' gives clean MATRIX-style scramble effect in Space Mono
 *
 * GSAP integration notes:
 *  - Imports from '@/lib/gsap' (plugins registered once at module level — never re-register here)
 *  - Uses useGSAP from @gsap/react — mandatory with React 19 to handle strict-mode double-mount
 *  - containerRef scopes all GSAP selectors to this component
 */

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'



const FULL_NAME = 'Lohith Tarikere Prasanna'

export function HeroTitle() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const target = containerRef.current?.querySelector('.hero-name')
      if (!target) return

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) {
        gsap.set(target, { opacity: 1 })
        return
      }

      gsap.fromTo(
        target,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0,
          onComplete: () => {
            gsap.to(target, {
              duration: 0.75,
              delay: 0.08,
              scrambleText: {
                text: FULL_NAME,
                chars: 'upperCase',
                revealDelay: 0.3,
                speed: 0.4,
                delimiter: '',
              },
            })
          },
        }
      )
    },
    { scope: containerRef, dependencies: [] }
  )

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {/* Screen-reader sees the resolved name immediately — scramble is purely visual */}
      <h1 className="sr-only">{FULL_NAME}</h1>
      <div
        className="hero-name font-display text-hero text-foreground leading-none tracking-[-0.04em] select-none"
        aria-hidden="true"
      >
        {FULL_NAME}
      </div>
    </div>
  )
}
