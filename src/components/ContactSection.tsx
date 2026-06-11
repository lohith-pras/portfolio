'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useParallax } from '@/hooks/useParallax'

export function ContactSection() {
  const t = useTranslations('contact')
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const numeralRef = useRef<HTMLSpanElement>(null)

  // Ghost numeral drifts slower than the page — editorial depth layer.
  useParallax(numeralRef, 80, ref)

  // Existing section reveal — whole container fades/slides in
  useGSAP(
    () => {
      if (reduce || !ref.current) return
      gsap.from(ref.current, {
        opacity: 0,
        y: 32,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      })
    },
    { scope: ref, dependencies: [reduce] },
  )

  // SplitText line-mask reveal on the closing heading — each line rises out
  // from behind a clip, staggered. Split after fonts settle so line breaks are
  // measured against final glyphs. Reverts on cleanup to restore the raw node.
  useGSAP(
    () => {
      if (reduce || !headingRef.current) return
      let split: SplitText | undefined
      let tween: gsap.core.Tween | undefined
      let killed = false
      document.fonts.ready.then(() => {
        if (killed || !headingRef.current) return
        split = SplitText.create(headingRef.current, { type: 'lines', mask: 'lines' })
        tween = gsap.from(split.lines, {
          yPercent: 110,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%', once: true },
        })
      })
      return () => {
        killed = true
        tween?.kill()
        split?.revert()
      }
    },
    { dependencies: [reduce] },
  )

  const links = [
    { label: t('email_label'), href: 'mailto:lnlohith3@gmail.com', external: false },
    { label: t('github_label'), href: 'https://github.com/lohith-pras', external: true },
    { label: t('linkedin_label'), href: 'https://www.linkedin.com/in/loh-pras', external: true },
    { label: t('resume_label'), href: '/Lohith_Prasanna_Resume.pdf', external: true },
  ]

  return (
    <section
      id="contact"
      className="relative z-10 flex min-h-screen w-full items-center bg-paper border-t border-rule px-6 md:px-16 py-16"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div ref={ref} className="flex flex-col gap-[clamp(2.5rem,6vh,4rem)]">
          {/* Heading with ghost numeral */}
          <div className="relative">
            {/* ghost numeral 04 — editorial depth layer */}
            <span
              ref={numeralRef}
              aria-hidden="true"
              className="pointer-events-none select-none absolute -top-14 -left-5 font-mono font-bold leading-none text-foreground/[0.035] text-[clamp(7rem,18vw,18rem)] -z-10"
            >
              04
            </span>

            {/* heading — receives clip-path reveal */}
            <h2
              ref={headingRef}
              className="relative font-display text-[clamp(2.75rem,7vw,6rem)] leading-none tracking-tight text-foreground"
            >
              {t('heading')}
            </h2>
          </div>

          {/* Availability */}
          <p className="font-body text-foreground/60 text-xl md:text-2xl leading-relaxed max-w-2xl">
            {t('availability')}
          </p>

          {/* Links row */}
          <div className="flex flex-wrap gap-4">
            {links.map(({ label, href, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 font-mono text-sm uppercase tracking-widest text-foreground hover:border-accent hover:text-accent motion-safe:hover:-translate-y-0.5 transition-[color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {label}
                <span aria-hidden="true" className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-200">
                  →
                </span>
              </a>
            ))}
          </div>

          {/* Footer line */}
          <div className="flex items-center justify-between border-t border-rule pt-8 mt-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              Lohith Tarikere Prasanna · {new Date().getFullYear()}
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              Nürnberg, Germany
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
