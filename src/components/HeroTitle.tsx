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
// Two-line break: given name leads, family name lands on its own line below.
const LINES = ['Lohith', 'Tarikere Prasanna'] as const

export function HeroTitle() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const lines = containerRef.current?.querySelectorAll<HTMLElement>('.hero-line')
      if (!lines?.length) return

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) {
        gsap.set(lines, { opacity: 1, y: 0 })
        lines.forEach((el) => { el.textContent = el.dataset.text ?? '' })
        return
      }

      const tl = gsap.timeline({ delay: 0.08 })
      lines.forEach((el, i) => {
        // Wrapper rises (transform) while the text resolves out of scramble
        // (textContent) — two independent channels, no collision.
        tl.fromTo(
          el,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out' },
          i * 0.14,
        ).to(
          el,
          {
            duration: 0.75,
            scrambleText: {
              text: el.dataset.text ?? '',
              chars: 'upperCase',
              revealDelay: 0.25,
              speed: 0.4,
              delimiter: '',
            },
          },
          '<',
        )
      })
    },
    { scope: containerRef, dependencies: [] }
  )

  return (
    <div ref={containerRef} className="flex flex-col gap-0">
      {/* Screen-reader sees the resolved name immediately — scramble is purely visual */}
      <h1 className="sr-only">{FULL_NAME}</h1>
      {LINES.map((line) => (
        <div
          key={line}
          data-text={line}
          className="hero-line font-display font-normal text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.88] tracking-[-0.045em] select-none text-foreground [text-shadow:0_1px_20px_rgba(0,0,0,0.5)]"
          style={{ opacity: 0 }}
          aria-hidden="true"
        >
          {line}
        </div>
      ))}
    </div>
  )
}
