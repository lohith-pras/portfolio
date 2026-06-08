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

  useGSAP(
    () => {
      if (reduce || !ref.current) return
      gsap.from(ref.current, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
      })
    },
    { scope: ref, dependencies: [reduce] },
  )

  return (
    <section
      id="about"
      className="relative z-10 w-full bg-paper-2 py-[var(--space-section-lg)]"
    >
      <div className="mx-auto w-full max-w-5xl px-6 md:px-16">
        <div ref={ref} className="flex flex-col gap-[clamp(2rem,5vh,3.5rem)]">
          {/* eyebrow */}
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            About
          </span>

          {/* thesis — oversized positioning statement, accent rule as signal marker */}
          <h2 className="font-display font-bold leading-[1.12] tracking-tight text-foreground text-[clamp(1.5rem,3.4vw,2.6rem)] max-w-[24ch] border-l-2 border-accent pl-5 md:pl-8 [text-wrap:balance] [overflow-wrap:anywhere] min-w-0">
            {t('descriptor')}
          </h2>

          {/* bio — comfortable measure */}
          <div className="font-body text-foreground/75 leading-relaxed text-[clamp(1rem,1.4vw,1.2rem)] max-w-[60ch] space-y-5">
            <p>{t('bio_1')}</p>
            <p>{t('bio_2')}</p>
            <p>{t('bio_3')}</p>
          </div>

          {/* credential meta row */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-rule pt-6 font-mono text-xs uppercase tracking-widest text-muted">
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
