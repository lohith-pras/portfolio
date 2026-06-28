'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PLACES } from '@/lib/places'

export function PlacesSection() {
  const t = useTranslations('places')
  const reduce = useReducedMotion()

  const outerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // SVG and path refs for desktop
  const dPath1Ref = useRef<SVGPathElement>(null)
  const dPath2Ref = useRef<SVGPathElement>(null)
  const dPath3Ref = useRef<SVGPathElement>(null)
  const dPlaneRef = useRef<SVGGElement>(null)

  // SVG and path refs for mobile
  const mPath1Ref = useRef<SVGPathElement>(null)
  const mPath2Ref = useRef<SVGPathElement>(null)
  const mPath3Ref = useRef<SVGPathElement>(null)
  const mPlaneRef = useRef<SVGGElement>(null)

  // Card refs
  const cardBlrRef = useRef<HTMLDivElement>(null)
  const cardNueRef = useRef<HTMLDivElement>(null)
  const cardDrsRef = useRef<HTMLDivElement>(null)

  // Image wrapper refs (to animate grayscale filtering in sync with scroll)
  const imgBlrRef = useRef<HTMLDivElement>(null)
  const imgNueRef = useRef<HTMLDivElement>(null)
  const imgDrsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // 1. Accessibility First: If reduced motion is preferred, no scroll-hijack or path animation
      if (reduce) return

      const mm = gsap.matchMedia()

      // Desktop layout implementation (>= 768px)
      mm.add('(min-width: 768px)', () => {
        const path1 = dPath1Ref.current
        const path2 = dPath2Ref.current
        const path3 = dPath3Ref.current
        const plane = dPlaneRef.current

        if (!path1 || !path2 || !path3 || !plane) return

        const L1 = path1.getTotalLength()
        const L2 = path2.getTotalLength()
        const L3 = path3.getTotalLength()

        // Initialize strokes and image filters
        gsap.set(path1, { strokeDasharray: L1, strokeDashoffset: L1 })
        gsap.set(path2, { strokeDasharray: L2, strokeDashoffset: L2 })
        gsap.set(path3, { strokeDasharray: L3, strokeDashoffset: L3 })
        gsap.set(imgBlrRef.current, { filter: 'grayscale(0%) contrast(0.95) brightness(0.85)' })
        gsap.set(imgNueRef.current, { filter: 'grayscale(100%) contrast(0.95) brightness(0.85)' })
        gsap.set(imgDrsRef.current, { filter: 'grayscale(100%) contrast(0.95) brightness(0.8)' })

        // Helper to compute airplane coordinate and angle along the segmented path
        const updateAirplane = (prog: number) => {
          let x = 150, y = 800, angle = 0

          if (prog <= 0.5) {
            const p = prog / 0.5
            const len = p * L1
            const pt = path1.getPointAtLength(len)
            x = pt.x
            y = pt.y
            const pt2 = path1.getPointAtLength(Math.min(L1, len + 2))
            angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI)
          } else if (prog <= 0.75) {
            const p = (prog - 0.5) / 0.25
            const len = p * L2
            const pt = path2.getPointAtLength(len)
            x = pt.x
            y = pt.y
            const pt2 = path2.getPointAtLength(Math.min(L2, len + 2))
            angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI)
          } else {
            const p = (prog - 0.75) / 0.25
            const len = p * L3
            const pt = path3.getPointAtLength(len)
            x = pt.x
            y = pt.y
            const pt2 = path3.getPointAtLength(Math.min(L3, len + 2))
            angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI)
          }

          gsap.set(plane, { x, y, rotate: angle })
        }

        // Initialize plane position
        updateAirplane(0)

        // Build continuous scroll timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: outerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        })

        const animState = { progress: 0 }

        // Timeline Definition
        tl.to(animState, {
          progress: 0.5,
          duration: 3,
          ease: 'none',
          onUpdate: () => updateAirplane(animState.progress),
        }, 0)
        .to(path1, {
          strokeDashoffset: 0,
          duration: 3,
          ease: 'none',
        }, 0)
        .to(cardBlrRef.current, {
          opacity: 0.2,
          duration: 1.5,
          ease: 'power1.out',
        }, 1.2)
        .to(imgBlrRef.current, {
          filter: 'grayscale(100%) contrast(0.95) brightness(0.85)',
          duration: 1.5,
          ease: 'power1.out',
        }, 1.2)

        // Pause/Reveal Nürnberg
        .to(cardNueRef.current, {
          opacity: 1,
          duration: 1.5,
          ease: 'power1.out',
        }, 3)
        .to(imgNueRef.current, {
          filter: 'grayscale(0%) contrast(0.95) brightness(0.85)',
          duration: 1.5,
          ease: 'power1.out',
        }, 3)

        // Nürnberg -> Dresden
        .to(animState, {
          progress: 0.75,
          duration: 2.5,
          ease: 'none',
          onUpdate: () => updateAirplane(animState.progress),
        }, 4.5)
        .to(path2, {
          strokeDashoffset: 0,
          duration: 2.5,
          ease: 'none',
        }, 4.5)
        .to(cardNueRef.current, {
          opacity: 0.2,
          duration: 1.5,
          ease: 'power1.out',
        }, 4.8)
        .to(imgNueRef.current, {
          filter: 'grayscale(100%) contrast(0.95) brightness(0.85)',
          duration: 1.5,
          ease: 'power1.out',
        }, 4.8)

        // Pause/Reveal Dresden
        .to(cardDrsRef.current, {
          opacity: 1,
          duration: 1.5,
          ease: 'power1.out',
        }, 7)
        .to(imgDrsRef.current, {
          filter: 'grayscale(0%) contrast(0.95) brightness(0.8)',
          duration: 1.5,
          ease: 'power1.out',
        }, 7)

        // Dresden -> Nürnberg Return
        .to(animState, {
          progress: 1.0,
          duration: 2.5,
          ease: 'none',
          onUpdate: () => updateAirplane(animState.progress),
        }, 8.5)
        .to(path3, {
          strokeDashoffset: 0,
          duration: 2.5,
          ease: 'none',
        }, 8.5)
        .to(cardDrsRef.current, {
          opacity: 0.2,
          duration: 1.5,
          ease: 'power1.out',
        }, 8.8)
        .to(imgDrsRef.current, {
          filter: 'grayscale(100%) contrast(0.95) brightness(0.8)',
          duration: 1.5,
          ease: 'power1.out',
        }, 8.8)

        // Final highlights Nürnberg
        .to(cardNueRef.current, {
          opacity: 1,
          duration: 1.5,
          ease: 'power1.out',
        }, 11)
        .to(imgNueRef.current, {
          filter: 'grayscale(0%) contrast(0.95) brightness(0.85)',
          duration: 1.5,
          ease: 'power1.out',
        }, 11)

        // Final scroll buffer padding to prevent premature unpinning
        .to({}, { duration: 3.5 })
      })

      // Mobile layout implementation (< 768px)
      mm.add('(max-width: 767px)', () => {
        const path1 = mPath1Ref.current
        const path2 = mPath2Ref.current
        const path3 = mPath3Ref.current
        const plane = mPlaneRef.current

        if (!path1 || !path2 || !path3 || !plane) return

        const L1 = path1.getTotalLength()
        const L2 = path2.getTotalLength()
        const L3 = path3.getTotalLength()

        // Initialize strokes and image filters
        gsap.set(path1, { strokeDasharray: L1, strokeDashoffset: L1 })
        gsap.set(path2, { strokeDasharray: L2, strokeDashoffset: L2 })
        gsap.set(path3, { strokeDasharray: L3, strokeDashoffset: L3 })
        gsap.set(imgBlrRef.current, { filter: 'grayscale(0%) contrast(0.95) brightness(0.85)' })
        gsap.set(imgNueRef.current, { filter: 'grayscale(100%) contrast(0.95) brightness(0.85)' })
        gsap.set(imgDrsRef.current, { filter: 'grayscale(100%) contrast(0.95) brightness(0.8)' })

        const updateAirplaneMobile = (prog: number) => {
          let x = 250, y = 1000, angle = 0

          if (prog <= 0.5) {
            const p = prog / 0.5
            const len = p * L1
            const pt = path1.getPointAtLength(len)
            x = pt.x
            y = pt.y
            const pt2 = path1.getPointAtLength(Math.min(L1, len + 2))
            angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI)
          } else if (prog <= 0.75) {
            const p = (prog - 0.5) / 0.25
            const len = p * L2
            const pt = path2.getPointAtLength(len)
            x = pt.x
            y = pt.y
            const pt2 = path2.getPointAtLength(Math.min(L2, len + 2))
            angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI)
          } else {
            const p = (prog - 0.75) / 0.25
            const len = p * L3
            const pt = path3.getPointAtLength(len)
            x = pt.x
            y = pt.y
            const pt2 = path3.getPointAtLength(Math.min(L3, len + 2))
            angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI)
          }

          gsap.set(plane, { x, y, rotate: angle })
        }

        updateAirplaneMobile(0)

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: outerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        })

        const animState = { progress: 0 }

        tl.to(animState, {
          progress: 0.5,
          duration: 3,
          ease: 'none',
          onUpdate: () => updateAirplaneMobile(animState.progress),
        }, 0)
        .to(path1, {
          strokeDashoffset: 0,
          duration: 3,
          ease: 'none',
        }, 0)
        .to(cardBlrRef.current, {
          opacity: 0.2,
          duration: 1.5,
          ease: 'power1.out',
        }, 1.2)
        .to(imgBlrRef.current, {
          filter: 'grayscale(100%) contrast(0.95) brightness(0.85)',
          duration: 1.5,
          ease: 'power1.out',
        }, 1.2)

        .to(cardNueRef.current, {
          opacity: 1,
          duration: 1.5,
          ease: 'power1.out',
        }, 3)
        .to(imgNueRef.current, {
          filter: 'grayscale(0%) contrast(0.95) brightness(0.85)',
          duration: 1.5,
          ease: 'power1.out',
        }, 3)

        .to(animState, {
          progress: 0.75,
          duration: 2.5,
          ease: 'none',
          onUpdate: () => updateAirplaneMobile(animState.progress),
        }, 4.5)
        .to(path2, {
          strokeDashoffset: 0,
          duration: 2.5,
          ease: 'none',
        }, 4.5)
        .to(cardNueRef.current, {
          opacity: 0.2,
          duration: 1.5,
          ease: 'power1.out',
        }, 4.8)
        .to(imgNueRef.current, {
          filter: 'grayscale(100%) contrast(0.95) brightness(0.85)',
          duration: 1.5,
          ease: 'power1.out',
        }, 4.8)

        .to(cardDrsRef.current, {
          opacity: 1,
          duration: 1.5,
          ease: 'power1.out',
        }, 7)
        .to(imgDrsRef.current, {
          filter: 'grayscale(0%) contrast(0.95) brightness(0.8)',
          duration: 1.5,
          ease: 'power1.out',
        }, 7)

        .to(animState, {
          progress: 1.0,
          duration: 2.5,
          ease: 'none',
          onUpdate: () => updateAirplaneMobile(animState.progress),
        }, 8.5)
        .to(path3, {
          strokeDashoffset: 0,
          duration: 2.5,
          ease: 'none',
        }, 8.5)
        .to(cardDrsRef.current, {
          opacity: 0.2,
          duration: 1.5,
          ease: 'power1.out',
        }, 8.8)
        .to(imgDrsRef.current, {
          filter: 'grayscale(100%) contrast(0.95) brightness(0.8)',
          duration: 1.5,
          ease: 'power1.out',
        }, 8.8)

        .to(cardNueRef.current, {
          opacity: 1,
          duration: 1.5,
          ease: 'power1.out',
        }, 11)
        .to(imgNueRef.current, {
          filter: 'grayscale(0%) contrast(0.95) brightness(0.85)',
          duration: 1.5,
          ease: 'power1.out',
        }, 11)

        .to({}, { duration: 3.5 })
      })

      return () => mm.revert()
    },
    { scope: containerRef, dependencies: [reduce] }
  )

  // 2. Accessibility fallback: static vertical list for reduced motion
  if (reduce) {
    return (
      <section className="bg-[#0A0A0A] py-24 border-y border-rule px-margin-page">
        <h2 className="font-display text-4xl mb-12 text-[#F5E6C8] tracking-widest uppercase">
          {t('heading')}
        </h2>
        <div className="flex flex-col gap-16 max-w-4xl mx-auto">
          {/* Bengaluru Card */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <span className="font-mono text-accent text-[10px] block tracking-widest uppercase mb-1">
                ORIGIN
              </span>
              <h3 className="font-body text-3xl font-bold text-ink uppercase tracking-tight">
                BENGALURU
              </h3>
              <p className="font-mono text-xs text-foreground/50 tracking-wider uppercase mt-1">
                India · 2001-2023
              </p>
              <span className="font-mono text-accent text-[10px] block mt-1 tracking-widest uppercase">
                {t('bengaluru.tagline')}
              </span>
              <p className="font-body text-ink/80 text-sm md:text-base leading-relaxed mt-3">
                {t('bengaluru.story')}
              </p>
            </div>
            <div className="relative aspect-[4/3] w-full md:w-[350px] overflow-hidden grayscale contrast-[0.95] brightness-[0.85] rounded-lg">
              <Image src="/bengaluru.png" alt="Bengaluru" fill className="object-cover" />
            </div>
          </div>

          <div className="h-px bg-rule w-full" />

          {/* Nürnberg Card */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <span className="font-mono text-accent text-[10px] block tracking-widest uppercase mb-1">
                CURRENT BASE
              </span>
              <h3 className="font-body text-3xl font-bold text-ink uppercase tracking-tight">
                NÜRNBERG
              </h3>
              <p className="font-mono text-xs text-foreground/50 tracking-wider uppercase mt-1">
                Germany · 2024-now
              </p>
              <span className="font-mono text-accent text-[10px] block mt-1 tracking-widest uppercase">
                {t('nurnberg.tagline')}
              </span>
              <p className="font-body text-ink/80 text-sm md:text-base leading-relaxed mt-3">
                {t('nurnberg.story')}
              </p>
            </div>
            <div className="relative aspect-[4/3] w-full md:w-[350px] overflow-hidden grayscale contrast-[0.95] brightness-[0.85] rounded-lg">
              <Image src="/nurnberg.png" alt="Nürnberg" fill className="object-cover" />
            </div>
          </div>

          <div className="h-px bg-rule w-full" />

          {/* Dresden Card */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <span className="font-mono text-accent/60 text-[10px] block tracking-widest uppercase mb-1">
                DETOUR
              </span>
              <h3 className="font-body text-2xl font-bold text-ink/90 uppercase tracking-tight">
                DRESDEN
              </h3>
              <p className="font-mono text-xs text-foreground/50 tracking-wider uppercase mt-1">
                Germany · 2025-2026
              </p>
              <span className="font-mono text-accent/60 text-[10px] block mt-1 tracking-widest uppercase">
                {t('dresden.tagline')}
              </span>
              <p className="font-body text-ink/70 text-sm md:text-base leading-relaxed mt-3">
                {t('dresden.story')}
              </p>
            </div>
            <div className="relative aspect-[4/3] w-full md:w-[300px] overflow-hidden grayscale contrast-[0.95] brightness-[0.85] rounded-lg">
              <Image src="/dresden.png" alt="Dresden" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={outerRef} style={{ height: '500vh' }} className="w-full relative z-10">
      <div
        ref={containerRef}
        className="sticky top-0 h-screen w-full bg-[#0A0A0A] coordinate-grid border-y border-rule overflow-hidden"
      >
        {/* Interactive Flight Canvas (Desktop) */}
        <div className="hidden md:block absolute inset-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            {/* Main Segment 1: Bengaluru -> Nürnberg */}
            <path
              ref={dPath1Ref}
              d="M 150 800 C 250 650, 350 550, 500 500"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeDasharray="6,6"
            />
            {/* Detour Segment 2: Nürnberg -> Dresden */}
            <path
              ref={dPath2Ref}
              d="M 500 500 C 580 420, 680 320, 750 300"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            {/* Detour Return Segment 3: Dresden -> Nürnberg */}
            <path
              ref={dPath3Ref}
              d="M 750 300 C 680 380, 580 460, 500 500"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />

            {/* City Nodes */}
            <circle cx="150" cy="800" r="5" fill="var(--color-accent)" />
            <circle cx="500" cy="500" r="5" fill="var(--color-accent)" />
            <circle cx="750" cy="300" r="5" fill="var(--color-accent)" />

            {/* Detour Label next to Dresden arc */}
            <text
              x="620"
              y="370"
              className="font-mono italic fill-[#F5E6C8] opacity-40 text-[11px] pointer-events-none select-none rotate-[-6deg]"
            >
              6 months · internship
            </text>

            {/* Airplane Element */}
            <g ref={dPlaneRef}>
              <path
                d="M2,21L23,12L2,3V10L17,12L2,14V21Z"
                fill="var(--color-accent)"
                transform="scale(0.8) translate(-12.5, -12)"
              />
            </g>
          </svg>
        </div>

        {/* Interactive Flight Canvas (Mobile) */}
        <div className="block md:hidden absolute inset-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 1000 1200" preserveAspectRatio="xMidYMid slice">
            {/* Mobile Path 1: Bengaluru -> Nürnberg */}
            <path
              ref={mPath1Ref}
              d="M 250 1000 C 300 850, 400 700, 500 600"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeDasharray="6,6"
            />
            {/* Mobile Path 2: Nürnberg -> Dresden */}
            <path
              ref={mPath2Ref}
              d="M 500 600 C 600 500, 700 400, 750 350"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            {/* Mobile Path 3: Dresden -> Nürnberg */}
            <path
              ref={mPath3Ref}
              d="M 750 350 C 700 450, 600 550, 500 600"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />

            {/* Nodes */}
            <circle cx="250" cy="1000" r="6" fill="var(--color-accent)" />
            <circle cx="500" cy="600" r="6" fill="var(--color-accent)" />
            <circle cx="750" cy="350" r="6" fill="var(--color-accent)" />

            {/* Mobile Detour Label */}
            <text
              x="590"
              y="460"
              className="font-mono italic fill-[#F5E6C8] opacity-40 text-[14px] pointer-events-none select-none rotate-[-8deg]"
            >
              6 months · internship
            </text>

            {/* Airplane Mobile */}
            <g ref={mPlaneRef}>
              <path
                d="M2,21L23,12L2,3V10L17,12L2,14V21Z"
                fill="var(--color-accent)"
                transform="scale(1.1) translate(-12.5, -12)"
              />
            </g>
          </svg>
        </div>

        {/* Floating City Cards Layer */}
        <div className="absolute inset-0 pointer-events-none px-margin-page">
          
          {/* Bengaluru Card */}
          <div
            ref={cardBlrRef}
            className="absolute left-[5%] bottom-[12%] max-w-[280px] md:left-[10%] md:bottom-[15%] md:max-w-[340px]"
            style={{ opacity: 1 }} // Initial card is visible
          >
            <span className="font-mono text-accent text-[10px] block tracking-widest uppercase mb-1">
              ORIGIN
            </span>
            <h3 className="font-body text-3xl md:text-4xl font-bold text-ink uppercase tracking-tight">
              BENGALURU
            </h3>
            <p className="font-mono text-xs text-foreground/50 tracking-wider uppercase mt-1">
              India · 2001-2023
            </p>
            <span className="font-mono text-accent text-[10px] block mt-1.5 tracking-widest uppercase">
              {t('bengaluru.tagline')}
            </span>
            <p className="font-body text-ink/80 text-xs md:text-sm leading-relaxed mt-2">
              {t('bengaluru.story')}
            </p>
            <div
              ref={imgBlrRef}
              className="mt-3 relative aspect-[4/3] w-full overflow-hidden contrast-[0.95] brightness-[0.85] rounded"
              style={{ filter: 'grayscale(0%) contrast(0.95) brightness(0.85)' }}
            >
              <Image src="/bengaluru.png" alt="Bengaluru" fill className="object-cover" />
            </div>
          </div>

          {/* Nürnberg Card */}
          <div
            ref={cardNueRef}
            className="absolute right-[5%] top-[40%] max-w-[280px] md:right-[10%] md:top-[30%] md:max-w-[340px]"
            style={{ opacity: 0 }}
          >
            <span className="font-mono text-accent text-[10px] block tracking-widest uppercase mb-1">
              CURRENT BASE
            </span>
            <h3 className="font-body text-3xl md:text-4xl font-bold text-ink uppercase tracking-tight">
              NÜRNBERG
            </h3>
            <p className="font-mono text-xs text-foreground/50 tracking-wider uppercase mt-1">
              Germany · 2024-now
            </p>
            <span className="font-mono text-accent text-[10px] block mt-1.5 tracking-widest uppercase">
              {t('nurnberg.tagline')}
            </span>
            <p className="font-body text-ink/80 text-xs md:text-sm leading-relaxed mt-2">
              {t('nurnberg.story')}
            </p>
            <div
              ref={imgNueRef}
              className="mt-3 relative aspect-[4/3] w-full overflow-hidden contrast-[0.95] brightness-[0.85] rounded"
              style={{ filter: 'grayscale(100%) contrast(0.95) brightness(0.85)' }}
            >
              <Image src="/nurnberg.png" alt="Nürnberg" fill className="object-cover" />
            </div>
          </div>

          {/* Dresden Card (Detour, smaller and slightly dimmer) */}
          <div
            ref={cardDrsRef}
            className="absolute left-[10%] top-[10%] max-w-[240px] md:left-[52%] md:top-[10%] md:max-w-[280px]"
            style={{ opacity: 0 }}
          >
            <span className="font-mono text-accent/60 text-[10px] block tracking-widest uppercase mb-0.5">
              DETOUR
            </span>
            <h3 className="font-body text-2xl font-bold text-ink/90 uppercase tracking-tight">
              DRESDEN
            </h3>
            <p className="font-mono text-[10px] text-foreground/50 tracking-wider uppercase">
              Germany · 2025-2026
            </p>
            <span className="font-mono text-accent/60 text-[9px] block mt-1 tracking-widest uppercase leading-snug">
              {t('dresden.tagline')}
            </span>
            <p className="font-body text-ink/70 text-[11px] md:text-xs leading-relaxed mt-1.5">
              {t('dresden.story')}
            </p>
            <div
              ref={imgDrsRef}
              className="mt-3 relative aspect-[4/3] w-full overflow-hidden contrast-[0.95] brightness-[0.8] rounded"
              style={{ filter: 'grayscale(100%) contrast(0.95) brightness(0.8)' }}
            >
              <Image src="/dresden.png" alt="Dresden" fill className="object-cover" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
