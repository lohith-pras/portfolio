'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * AboutSection — personal narrative beat.
 *
 * Layout mirrors the Stitch "Rich Detail" variant:
 *   badge → decorative orbit ring → large display intro → three body paragraphs
 *   → divider → facts row.
 *
 * Design tokens: existing Oswald / Plus Jakarta Sans / Space Mono stack,
 * foreground / beige / muted / accent palette from globals.css — no new fonts.
 *
 * Animation: GSAP ScrollTrigger stagger-from-below on each `.about-block`
 * when the section edge crosses 75 % of the viewport.
 */
export function AboutSection() {
  const t = useTranslations('about')
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reduce) return

      const blocks = gsap.utils.toArray<HTMLElement>('.about-block')
      gsap.fromTo(
        blocks,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        },
      )
    },
    { scope: sectionRef, dependencies: [reduce] },
  )

  const facts = [
    { label: t('tag_1'), icon: FactSchool },
    { label: t('tag_2'), icon: FactWork },
    { label: t('tag_3'), icon: FactPin },
  ]

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-dot-grid relative z-20 flex w-full flex-col items-center bg-background py-20 md:py-[100px]"
    >
      <div className="flex w-full max-w-[800px] flex-col items-center px-6 text-center">

        {/* Badge — "what's up" */}
        <div className="about-block mb-8" style={reduce ? undefined : { opacity: 0 }}>
          <div className="inline-block border border-foreground/25 px-4 py-1 font-mono text-xs lowercase tracking-tight text-foreground/60">
            {t('badge')}
          </div>
        </div>

        {/* Decorative orbit ring */}
        <div className="about-block mb-12" style={reduce ? undefined : { opacity: 0 }}>
          <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-beige/20 bg-gradient-to-tr from-beige/10 to-transparent">
            <OrbitRing />
            {/* Ambient glow */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-beige/5 blur-2xl"
            />
          </div>
        </div>

        {/* Main identity block */}
        <div className="about-block" style={reduce ? undefined : { opacity: 0 }}>
          {/* Large display intro */}
          <h2 className="font-display mx-auto mb-10 max-w-[20ch] text-[clamp(2.6rem,6.5vw,3.9rem)] font-bold leading-[1.1] tracking-[-0.04em] text-beige uppercase">
            {t('intro_a')}{' '}
            <span className="text-accent">{t('intro_location')}</span>
            {t('intro_b')}
          </h2>

          {/* Body paragraphs */}
          <div className="mx-auto max-w-[640px] space-y-8">
            {/* Para 1 */}
            <p className="font-body text-[1.2rem] leading-[1.55] tracking-tight text-foreground/65">
              {t('para_1a')}{' '}{t('para_1b')}
            </p>

            {/* Para 3 — call to scroll */}
            <p className="pt-4 font-body text-[1.2rem] font-semibold leading-[1.55] tracking-tight text-beige">
              {t('para_3')}
              <span
                aria-hidden="true"
                className="animate-bounce-down ml-2 inline-block select-none text-accent"
              >
                ↓
              </span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="about-block mt-16 h-px w-full bg-foreground/10"
          style={reduce ? undefined : { opacity: 0 }}
        />

        {/* Facts row */}
        <ul
          className="about-block mt-6 flex w-full flex-col items-center justify-between gap-6 sm:flex-row sm:gap-0"
          style={reduce ? undefined : { opacity: 0 }}
        >
          {facts.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="group flex items-center gap-2"
            >
              <Icon />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-foreground/50 group-hover:text-foreground/80 transition-colors duration-200">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── Decorative orbit ring — evokes the "blur_on" icon feel ── */
function OrbitRing() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="text-beige"
    >
      {/* Outer ring */}
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
      {/* Mid ring */}
      <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
      {/* Inner ring */}
      <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="1" opacity="0.65" />
      {/* Core dot */}
      <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.9" />
      {/* Tilted orbital ellipse */}
      <ellipse
        cx="32"
        cy="32"
        rx="28"
        ry="10"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.2"
        transform="rotate(-35 32 32)"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="18"
        ry="6"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.3"
        transform="rotate(55 32 32)"
      />
    </svg>
  )
}

/* ── Fact glyphs — 16 px stroke icons, beige-tinted ── */
function iconProps() {
  return {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className: 'shrink-0 text-beige transition-transform duration-200 group-hover:rotate-12',
  }
}

function FactSchool() {
  return (
    <svg {...iconProps()}>
      {/* Mortarboard / graduation cap */}
      <path d="M22 10L12 4 2 10l10 6 10-6z" />
      <path d="M6 12v5c0 2.2 2.7 4 6 4s6-1.8 6-4v-5" />
    </svg>
  )
}

function FactWork() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function FactPin() {
  return (
    <svg {...iconProps()}>
      <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
