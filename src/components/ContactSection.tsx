'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function ContactSection() {
  const t = useTranslations('contact')
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

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

  const links = [
    { label: t('email_label'), href: 'mailto:lnlohith3@gmail.com', external: false },
    { label: t('github_label'), href: 'https://github.com/lohith-pras', external: true },
    { label: t('linkedin_label'), href: 'https://www.linkedin.com/in/loh-pras', external: true },
    { label: t('resume_label'), href: '/Lohith_Prasanna_Resume.pdf', external: true },
  ]

  return (
    <section
      id="contact"
      className="relative z-10 bg-paper border-t border-rule px-6 md:px-16 py-[var(--space-section-lg)]"
    >
      <div className="max-w-5xl mx-auto w-full">
        <div ref={ref} className="flex flex-col gap-12">
          {/* Heading */}
          <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none tracking-tight text-foreground">
            {t('heading')}
          </h2>

          {/* Availability */}
          <p className="font-body text-foreground/60 text-lg max-w-xl">
            {t('availability')}
          </p>

          {/* Links row */}
          <div className="flex flex-wrap gap-4">
            {links.map(({ label, href, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 font-mono text-sm uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-colors duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
              Dresden, Germany
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
