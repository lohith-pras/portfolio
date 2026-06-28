'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * StaticHero — rich black (#0A0A0A) backdrop with a layered brutalist foreground.
 *
 * Two depth planes scrub at different rates as you scroll, for a 3D parallax
 * read: the condensed name (medium) and the eyebrow + CTAs (fastest, fading out).
 * The name mask-reveals once the intro boot sequence finishes (`intro-complete`);
 * under reduced motion everything is static and visible.
 *
 * Perf note: A 3-second safety-net timeout ensures the hero name is never
 * permanently hidden if the intro-complete event misfires (I4).
 */

export function StaticHero() {
  const t = useTranslations('hero')
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  // "Lohith" leads on its own line; family name lands beneath it.
  const [firstName, ...familyName] = t('name').split(' ')

  useGSAP(
    () => {
      const root = sectionRef.current
      if (!root || reduce) return

      const lines = gsap.utils.toArray<HTMLElement>('.hero-name-line')

      // Name mask-reveal — held hidden, then rises once the intro wipes away.
      // If the intro already played this session (revisit), reveal immediately.
      const played = sessionStorage.getItem('intro-played') != null
      gsap.set(lines, { yPercent: 110 })
      let revealed = false
      const reveal = () => {
        if (revealed) return
        revealed = true
        gsap.to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 })
      }

      let fallback: ReturnType<typeof setTimeout> | undefined
      if (played) {
        reveal()
      } else {
        window.addEventListener('intro-complete', reveal, { once: true })
        // I4 — safety net: if intro-complete never fires (e.g. GSAP load failure,
        // strict-mode teardown race), reveal after 3 s so the name is never
        // permanently hidden.
        fallback = setTimeout(reveal, 3000)
        const cleanup = () => clearTimeout(fallback)
        window.addEventListener('intro-complete', cleanup, { once: true })
      }

      // Two-speed scrub parallax across the hero's own scroll span.
      const st = {
        trigger: root,
        start: 'top top',
        end: 'bottom top',
        scrub: 1 as const,
      }
      gsap.to('.hero-name', { y: -340, ease: 'none', scrollTrigger: st })
      gsap.to('.hero-ui', { y: -260, opacity: 0, ease: 'none', scrollTrigger: st })

      // Magnetic hover effect for CTA buttons
      const buttons = gsap.utils.toArray<HTMLElement>('.hero-ui a')
      const handlers: { btn: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }[] = []

      buttons.forEach((btn) => {
        const onMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect()
          const x = (e.clientX - rect.left - rect.width / 2) * 0.35
          const y = (e.clientY - rect.top - rect.height / 2) * 0.35
          gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
        }

        const onLeave = () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1.1, 0.4)', overwrite: 'auto' })
        }

        btn.addEventListener('mousemove', onMove)
        btn.addEventListener('mouseleave', onLeave)
        handlers.push({ btn, move: onMove, leave: onLeave })
      })

      return () => {
        if (fallback) clearTimeout(fallback)
        window.removeEventListener('intro-complete', reveal)
        handlers.forEach(({ btn, move, leave }) => {
          btn.removeEventListener('mousemove', move)
          btn.removeEventListener('mouseleave', leave)
        })
      }
    },
    { scope: sectionRef, dependencies: [reduce] },
  )

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-background"
    >
      {/* Content overlay */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-8 px-6 text-center">
        <span className="hero-ui border border-beige/60 px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-beige sm:text-xs">
          {t('eyebrow')}
        </span>

        {/* Hero name — Oswald condensed, mix-blends cleanly on rich black */}
        <h1 className="hero-name font-display font-bold uppercase leading-[0.82] tracking-[-0.04em] text-beige text-[clamp(4rem,12vw,8rem)]">
          <span className="block overflow-hidden">
            <span className="hero-name-line block">{firstName}</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-name-line block">{familyName.join(' ')}</span>
          </span>
        </h1>

        <p className="hero-ui font-mono text-[0.65rem] uppercase tracking-[0.2em] text-beige/60 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
          {t('available')}
        </p>

        <div className="hero-ui flex flex-wrap items-center justify-center gap-4">
          <a
            href="#about"
            className="group inline-flex items-center gap-2 rounded-full bg-beige px-7 py-3 font-mono text-sm uppercase tracking-widest text-background hover:bg-beige/90 motion-safe:hover:-translate-y-0.5 transition-[background-color,transform] duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beige"
          >
            {t('cta_story')}
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full border border-beige/50 px-7 py-3 font-mono text-sm uppercase tracking-widest text-beige hover:border-beige hover:bg-beige/10 motion-safe:hover:-translate-y-0.5 transition-[background-color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beige"
          >
            {t('cta_hello')}
            <span aria-hidden="true">💬</span>
          </a>
        </div>
      </div>
    </section>
  )
}
