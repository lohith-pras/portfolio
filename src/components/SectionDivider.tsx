'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * SectionDivider — narrative breath between About and Projects.
 *
 * A thin accent line grows from left to right on scroll, with the section
 * label "SELECTED WORK" revealing character-by-character. Creates a moment
 * of anticipation before the radar section enters. Uses scrub so the
 * animation is tied to scroll position — pause mid-scroll and it holds.
 */
export function SectionDivider() {
  const t = useTranslations('work')
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduce || !ref.current) return

      const line = ref.current.querySelector('.divider-line')
      const label = ref.current.querySelector('.divider-label')

      if (line) {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 80%',
              end: 'bottom 50%',
              scrub: 1,
            },
          },
        )
      }

      if (label) {
        gsap.fromTo(
          label,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }
    },
    { scope: ref, dependencies: [reduce] },
  )

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center bg-background"
      style={{ height: 'clamp(8rem, 16vh, 13rem)' }}
    >
      <div className="flex items-center gap-6 px-6">
        <div
          className="divider-line h-px bg-accent origin-left"
          style={{ width: 'clamp(3rem, 8vw, 6rem)' }}
        />
        <span className="divider-label font-mono text-[0.65rem] uppercase tracking-[0.4em] text-foreground/40">
          {t('heading')}
        </span>
        <div
          className="divider-line h-px bg-accent origin-right"
          style={{ width: 'clamp(3rem, 8vw, 6rem)' }}
        />
      </div>
    </div>
  )
}
