'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const SECTIONS = [
  { id: 'about',   n: '01', label: 'ABOUT'   },
  { id: 'projects', n: '02', label: 'WORK'    },
  { id: 'toolkit', n: '03', label: 'STACK'   },
  { id: 'contact', n: '04', label: 'CONTACT' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export function SectionSpine() {
  const [active, setActive] = useState<SectionId | null>(null)
  // Track the previous active for crossfade direction
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()

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

  const current = SECTIONS.find(s => s.id === active) ?? null

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
          opacity: visible && current ? 1 : 0,
          transform: visible && current ? 'translateY(0)' : 'translateY(6px)',
        }}
        aria-hidden="true"
      >
        {current && (
          <div className="flex flex-col items-start gap-1">
            {/* Hairline rule above */}
            <span
              className="block w-px h-8 bg-rule opacity-40"
              style={{ marginLeft: '2px' }}
            />
            {/* Number */}
            <span className="font-mono text-[10px] leading-none tracking-[0.25em] text-accent">
              {current.n}
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
              {current.label}
            </span>
          </div>
        )}
      </div>
    </nav>
  )
}
