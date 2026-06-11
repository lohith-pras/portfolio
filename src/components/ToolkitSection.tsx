'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useParallax } from '@/hooks/useParallax'

const STACK = [
  {
    category: 'Languages',
    items: ['Python', 'C/C++', 'TypeScript', 'MATLAB', 'SQL'],
  },
  {
    category: 'ML / AI',
    items: ['PyTorch', 'Stable-Baselines3', 'Gymnasium', 'scikit-learn', 'CVXPY', 'Agent Skills', 'MCP', 'Claude API'],
  },
  {
    category: 'Data & Pipelines',
    items: ['Polars', 'Parquet', 'Pandas', 'Plotly'],
  },
  {
    category: 'Embedded / HW',
    items: ['ESP32', 'STM32', 'FreeRTOS', 'CAN Bus', 'UART/SPI'],
  },
  {
    category: 'Web',
    items: ['Next.js', 'React', 'Three.js', 'Tailwind', 'GSAP'],
  },
  {
    category: 'Tools',
    items: ['Git', 'Docker', 'Linux', 'Azure DevOps', 'LaTeX'],
  },
] as const

/**
 * ToolkitSection — capability ledger.
 *
 * Demoted from a loud 5-column chip grid to a quiet hairline-ruled ledger placed
 * AFTER the work: capabilities are supporting evidence, not a headline beat.
 * See design.md § Macrostructure family (home → Ledger).
 */
export function ToolkitSection() {
  const reduce = useReducedMotion()
  const listRef = useRef<HTMLDListElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const numeralRef = useRef<HTMLSpanElement>(null)
  const ruleRef = useRef<HTMLDivElement>(null)

  // Ghost numeral drifts slower than the page — editorial depth layer.
  useParallax(numeralRef, 60, listRef)

  // Head rule draws in from the left as the section head enters.
  useGSAP(
    () => {
      if (reduce || !ruleRef.current) return
      gsap.from(ruleRef.current, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: ruleRef.current, start: 'top 85%', once: true },
      })
    },
    { dependencies: [reduce] },
  )

  // Existing stagger reveal on ledger rows
  useGSAP(
    () => {
      if (reduce || !listRef.current) return
      gsap.from(listRef.current.children, {
        opacity: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: listRef.current, start: 'top 85%', once: true },
      })
    },
    { scope: listRef, dependencies: [reduce] },
  )

  // Clip-path line reveal on the section eyebrow heading
  useGSAP(
    () => {
      if (reduce || !eyebrowRef.current) return
      gsap.fromTo(
        eyebrowRef.current,
        { clipPath: 'inset(0 0 100% 0)', y: 12, willChange: 'clip-path' },
        {
          clipPath: 'inset(0 0 0% 0)',
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          onComplete: () => gsap.set(eyebrowRef.current, { willChange: 'auto' }),
          scrollTrigger: {
            trigger: eyebrowRef.current,
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
      id="toolkit"
      className="relative z-10 flex min-h-screen w-full items-center bg-paper-2 px-6 md:px-16 py-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* section head — stacked, mono eyebrow + rule, with ghost numeral */}
        <div className="mb-14 flex items-baseline gap-4">
          <div className="relative">
            {/* ghost numeral 03 — editorial depth layer */}
            <span
              ref={numeralRef}
              aria-hidden="true"
              className="pointer-events-none select-none absolute -top-14 -left-4 font-mono font-bold leading-none text-foreground/[0.035] text-[clamp(7rem,16vw,15rem)] -z-10"
            >
              03
            </span>

            {/* eyebrow — receives clip-path reveal */}
            <span
              ref={eyebrowRef}
              className="relative font-mono text-[11px] uppercase tracking-[0.3em] text-muted"
              style={reduce ? undefined : { clipPath: 'inset(0 0 100% 0)' }}
            >
              Stack
            </span>
          </div>
          <div ref={ruleRef} className="h-px flex-1 bg-rule" />
        </div>

        <dl ref={listRef} className="flex flex-col">
          {STACK.map((group) => (
            <div
              key={group.category}
              className="group grid grid-cols-1 gap-2 border-t border-rule py-7 md:py-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10"
            >
              <dt className="pt-1 font-mono text-sm uppercase tracking-[0.2em] text-muted transition-colors duration-300 group-hover:text-accent/80">
                {group.category}
              </dt>
              <dd className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-base text-foreground/70 transition-colors duration-300 group-hover:text-foreground/90">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
