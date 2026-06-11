'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * AboutSection — Manifesto beat.
 *
 * Type-led positioning statement (the thesis), bio at a readable measure, and a
 * credential meta row. No 3D here — the manifesto leads on typography.
 * See design.md § Macrostructure family (home → Manifesto).
 */
export function AboutSection() {
  const t = useTranslations('about')
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Existing scrub reveal — opacity on all .about-element nodes
  useGSAP(
    () => {
      if (reduce || !ref.current) return

      const elements = ref.current.querySelectorAll('.about-element')

      gsap.to(elements, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 75%',
          end: 'top 25%',
          scrub: 1,
        },
      })
    },
    { scope: ref, dependencies: [reduce] },
  )

  // Clip-path line reveal on the thesis heading — separate pass, fires once
  useGSAP(
    () => {
      if (reduce || !headingRef.current) return
      gsap.fromTo(
        headingRef.current,
        { clipPath: 'inset(0 0 100% 0)', y: 12, willChange: 'clip-path' },
        {
          clipPath: 'inset(0 0 0% 0)',
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          onComplete: () => gsap.set(headingRef.current, { willChange: 'auto' }),
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      )
    },
    { dependencies: [reduce] },
  )

  return (
    <section
      id="about"
      className="relative z-10 flex min-h-screen w-full items-center bg-paper-2 py-16"
    >
      <div ref={ref} className="mx-auto w-full max-w-7xl px-6 md:px-16">
        <div className="flex flex-col gap-[clamp(1.5rem,4vh,2.75rem)]">
          {/* eyebrow */}
          <span className="about-element font-mono text-[11px] uppercase tracking-[0.3em] text-muted opacity-20">
            About
          </span>

          {/* thesis — clip-path reveal wrapper with ghost numeral */}
          <div className="relative">
            {/* ghost numeral 01 — editorial depth layer */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute -top-8 -left-5 font-mono font-bold leading-none text-foreground/[0.035] text-[clamp(5rem,14vw,13rem)] -z-10"
            >
              01
            </span>

            {/* thesis h2 — receives clip-path reveal; also a scrub .about-element */}
            <h2
              ref={headingRef}
              className="about-element relative font-display font-bold leading-[1.15] tracking-tight text-foreground text-[clamp(1.6rem,3vw,2.6rem)] max-w-[30ch] border-l-2 border-accent pl-6 md:pl-10 [text-wrap:balance] [overflow-wrap:anywhere] min-w-0 opacity-20"
              style={reduce ? undefined : { clipPath: 'inset(0 0 100% 0)' }}
            >
              {t('descriptor')}
            </h2>
          </div>

          {/* bio — offset into a 12-col grid for editorial indent */}
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-start-3 md:col-span-8 font-body text-foreground/75 leading-relaxed text-[clamp(1.05rem,1.5vw,1.3rem)] max-w-[62ch] space-y-7 [text-wrap:pretty]">
              <p className="about-element opacity-20">{t('bio_1')}</p>

              {/* NI career proof — pulled callout */}
              <p className="about-element opacity-20 border-l-2 border-accent pl-6 py-1 text-foreground/65 italic">
                {t('bio_2')}
              </p>

              <p className="about-element opacity-20">{t('bio_3')}</p>
            </div>
          </div>

          {/* credential meta row — spec-sheet grid */}
          <div className="about-element grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 border-t border-rule pt-8 font-mono text-xs uppercase tracking-widest text-muted opacity-20">
            <div className="flex flex-col gap-2">
              <span className="text-accent/80">Degree</span>
              <span className="text-foreground/80">{t('education_degree')}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-accent/80">Institution</span>
              <span>{t('education_school')}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-accent/80">Location</span>
              <span>{t('education_location')}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-accent/80">Timeline</span>
              <span className="text-foreground/80">{t('education_year')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
