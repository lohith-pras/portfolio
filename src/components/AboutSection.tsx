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
          start: 'top 80%',
          end: 'bottom 60%',
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
      className="relative z-10 w-full bg-paper-2 py-32 md:py-48"
    >
      <div ref={ref} className="mx-auto w-full max-w-5xl px-6 md:px-16">
        <div className="flex flex-col gap-[clamp(2rem,5vh,3.5rem)]">
          {/* eyebrow */}
          <span className="about-element font-mono text-[11px] uppercase tracking-[0.3em] text-muted opacity-20">
            About
          </span>

          {/* thesis — clip-path reveal wrapper with ghost numeral */}
          <div className="relative">
            {/* ghost numeral 01 — editorial depth layer */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute -top-6 -left-4 font-mono font-bold leading-none text-foreground/[0.035] text-[clamp(6rem,18vw,16rem)] -z-10"
            >
              01
            </span>

            {/* thesis h2 — receives clip-path reveal; also a scrub .about-element */}
            <h2
              ref={headingRef}
              className="about-element relative font-display font-bold leading-[1.12] tracking-tight text-foreground text-[clamp(1.5rem,3.4vw,2.6rem)] max-w-[24ch] border-l-2 border-accent pl-5 md:pl-8 [text-wrap:balance] [overflow-wrap:anywhere] min-w-0 opacity-20"
              style={reduce ? undefined : { clipPath: 'inset(0 0 100% 0)' }}
            >
              {t('descriptor')}
            </h2>
          </div>

          {/* bio — comfortable measure */}
          <div className="font-body text-foreground/75 leading-relaxed text-[clamp(1rem,1.4vw,1.2rem)] max-w-[60ch] space-y-5 [text-wrap:pretty]">
            <p className="about-element opacity-20">{t('bio_1')}</p>
            <p className="about-element opacity-20">{t('bio_2')}</p>
            <p className="about-element opacity-20">{t('bio_3')}</p>
          </div>

          {/* credential meta row */}
          <div className="about-element flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-rule pt-6 font-mono text-xs uppercase tracking-widest text-muted opacity-20">
            <span className="text-foreground/80">{t('education_degree')}</span>
            <span>{t('education_school')}</span>
            <span>{t('education_location')}</span>
            <span className="text-accent/80">{t('education_year')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
