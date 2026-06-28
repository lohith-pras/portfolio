'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

const SECTIONS = [
  { id: 'about',   n: '01', label: 'ABOUT'   },
  { id: 'projects', n: '02', label: 'WORK'    },
  { id: 'contact', n: '03', label: 'CONTACT' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export function SectionSpine() {
  const [active, setActive] = useState<SectionId | null>(null)
  const [visible, setVisible] = useState(false)
  const [displayCurrent, setDisplayCurrent] = useState<typeof SECTIONS[number] | null>(null)
  const reducedMotion = useReducedMotion()

  const contentRef = useRef<HTMLDivElement>(null)
  const prevActiveRef = useRef<SectionId | null>(null)

  useEffect(() => {
    // Build a map of id → element, skipping any that don't exist in the DOM
    const els = SECTIONS.map(s => ({
      ...s,
      el: document.getElementById(s.id),
    })).filter((s): s is typeof s & { el: HTMLElement } => s.el !== null)

    if (els.length === 0) return

    const obs = new IntersectionObserver(
      (entries) => {
        // Pick the section that is most prominently in view
        let best: { id: SectionId; ratio: number } | null = null
        for (const entry of entries) {
          const section = els.find(s => s.el === entry.target)
          if (!section) continue
          if (entry.isIntersecting && (best === null || entry.intersectionRatio > best.ratio)) {
            best = { id: section.id, ratio: entry.intersectionRatio }
          }
        }
        if (best) {
          setActive(best.id)
          setVisible(true)
        }
      },
      {
        // Switch label when the section crosses 20% of the viewport
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.1, 0.2, 0.5, 1.0],
      }
    )

    for (const { el } of els) obs.observe(el)

    // Also watch the hero: when it leaves, show the spine
    const hero = document.getElementById('hero')
    let heroObs: IntersectionObserver | null = null
    if (hero) {
      heroObs = new IntersectionObserver(
        ([entry]) => {
          // Hide spine while hero is visible
          if (entry.isIntersecting) {
            setVisible(false)
          }
        },
        { threshold: 0.1 }
      )
      heroObs.observe(hero)
    }

    return () => {
      obs.disconnect()
      heroObs?.disconnect()
    }
  }, [])

  // Animate indicator label cross-fade when active section changes
  useGSAP(() => {
    if (reducedMotion) {
      const nextSection = SECTIONS.find(s => s.id === active) ?? null
      setDisplayCurrent(nextSection)
      return
    }

    if (!active) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 8,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => setDisplayCurrent(null)
      })
      prevActiveRef.current = null
      return
    }

    const nextSection = SECTIONS.find(s => s.id === active) ?? null
    if (!nextSection) return

    // If there was no previous active indicator visible, fade in directly
    if (!displayCurrent) {
      setDisplayCurrent(nextSection)
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      )
    } else if (prevActiveRef.current !== active) {
      // Cross-fade: Slide down and fade out, change the content, slide down and fade in
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 8,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
          setDisplayCurrent(nextSection)
          gsap.fromTo(contentRef.current,
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
          )
        }
      })
    }
    prevActiveRef.current = active
  }, [active, reducedMotion])

  const transitionStyle = reducedMotion
    ? undefined
    : { transition: 'opacity 140ms ease, transform 140ms ease' }

  return (
    <nav
      aria-label="Section indicator"
      className="hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none select-none"
    >
      <div
        style={{
          ...transitionStyle,
          opacity: visible && active ? 1 : 0,
          transform: visible && active ? 'translateY(0)' : 'translateY(6px)',
        }}
        aria-hidden="true"
      >
        <div ref={contentRef} style={reducedMotion ? undefined : { opacity: 0 }}>
          {displayCurrent && (
            <div className="flex flex-col items-start gap-1">
              {/* Hairline rule above */}
              <span
                className="block w-px h-8 bg-rule opacity-40"
                style={{ marginLeft: '2px' }}
              />
              {/* Number */}
              <span className="font-mono text-[10px] leading-none tracking-[0.25em] text-accent">
                {displayCurrent.n}
              </span>
              {/* Label — rotated 90° so it reads bottom-to-top, spine style */}
              <span
                className="font-mono text-[10px] leading-none tracking-[0.3em] text-muted uppercase"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  marginTop: '4px',
                }}
              >
                {displayCurrent.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
