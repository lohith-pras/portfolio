'use client'

/**
 * HeroSection.tsx — Full hero layout wrapper.
 *
 * HERO-02: Displays full name via HeroTitle, plus contact row:
 *   lnlohith3@gmail.com · GitHub · LinkedIn
 *
 * Layout:
 *   - Full-screen section (#hero, min-h-screen)
 *   - Content centered vertically in lower-middle area (justify-end pb-24)
 *   - Name at fluid scale; contact row small mono text below
 *   - z-10 ensures content sits above the ShaderCanvas (z-0)
 *
 * Scroll-down indicator:
 *   - Subtle animated chevron inviting the user to scroll
 *   - Positioned bottom-center, visible on desktop
 */

import { HeroTitle } from '@/components/HeroTitle'

const CONTACT_LINKS = [
  {
    label: 'lnlohith3@gmail.com',
    href: 'mailto:lnlohith3@gmail.com',
    external: false,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/lohith-pras',
    external: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/lohith-tarikere-prasanna',
    external: true,
  },
]

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-end pb-24 px-6 md:px-16"
    >
      {/* Content sits above ShaderCanvas (z-0) */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col gap-8">
        {/* Main name — GSAP scramble plays on mount */}
        <HeroTitle />

        {/* Contact row — HERO-02 */}
        <nav aria-label="Contact links" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="font-display text-sm text-foreground/60 hover:text-accent transition-colors duration-200 tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Scroll indicator — subtle animated caret */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 opacity-40">
        <span className="font-display text-xs text-foreground/60 tracking-widest uppercase">
          Scroll
        </span>
        <svg
          width="16"
          height="24"
          viewBox="0 0 16 24"
          fill="none"
          className="animate-bounce"
          aria-hidden="true"
        >
          <path
            d="M8 0v20M1 13l7 7 7-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Gradient fade to blend hero into about section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  )
}
