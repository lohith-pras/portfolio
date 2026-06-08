'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ProjectCardProps {
  index: number
  number: string
  category: string
  name: string
  tech: string
  description: string
  whatWentWrong?: string
  whatIdChange?: string
  githubUrl: string
  metric: string | null
  /** Distinct per-project card colour. */
  color: string
}

/**
 * ProjectCard — separate, collapsible card with a GSAP scroll reveal.
 *
 * Cards sit in a normal vertical column (no stacking). Each one fades + rises
 * into place via a one-shot ScrollTrigger as it enters the viewport.
 * "More details" expands it to reveal overview, lessons, and the tech stack.
 * Each card carries its own colour; text is white-based for contrast.
 */
export function ProjectCard({
  index, number, category, name, tech, description,
  whatWentWrong, whatIdChange, githubUrl, metric, color,
}: ProjectCardProps) {
  const t = useTranslations('work')
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const bodyId = `project-${index}-body`

  // Scroll reveal — card fades + rises into place once.
  useGSAP(
    () => {
      if (reduce || !cardRef.current) return
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 72,
        scale: 0.97,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 85%', once: true },
      })
    },
    { scope: cardRef, dependencies: [reduce] },
  )

  // Expand / collapse — animate the body's height.
  useGSAP(
    () => {
      const el = bodyRef.current
      if (!el) return
      gsap.killTweensOf(el)
      if (reduce) {
        gsap.set(el, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 })
        return
      }
      if (open) {
        // measure target height, then animate 0 → full, settle to auto
        gsap.set(el, { height: 'auto', opacity: 1 })
        const full = el.offsetHeight
        gsap.fromTo(
          el,
          { height: 0, opacity: 0 },
          {
            height: full,
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
            onComplete: () => gsap.set(el, { height: 'auto' }),
          },
        )
      } else {
        gsap.to(el, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' })
      }
    },
    { dependencies: [open, reduce] },
  )

  return (
    <article
      ref={cardRef}
      style={{ backgroundColor: color }}
      className="relative flex w-full flex-col rounded-3xl p-6 text-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] md:p-9"
    >
      {/* header — always visible */}
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <span className="font-display leading-none text-white/20 text-[clamp(2.6rem,7vw,5rem)]">
          {number}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-widest text-white/60">
            {category}
          </span>
          <h3 className="font-display font-bold leading-tight text-white text-[clamp(1.1rem,2.6vw,1.85rem)] [overflow-wrap:anywhere]">
            {name}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="group ml-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {open ? 'Less' : 'More details'}
          <span
            aria-hidden="true"
            className="transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          >
            ↓
          </span>
        </button>
      </div>

      {/* expandable body — height animated by GSAP */}
      <div ref={bodyRef} id={bodyId} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
        <div className="mt-8 grid gap-8 border-t border-white/15 pt-8 md:grid-cols-[1.2fr_1fr]">
              {/* overview · metric · tech */}
              <div className="flex flex-col gap-4">
                <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                  {t('overview_label')}
                </span>
                <p className="font-body leading-relaxed text-white/85 text-[clamp(0.95rem,1.2vw,1.05rem)]">
                  {description}
                </p>
                {metric && (
                  <p className="border-l-2 border-white/50 pl-3 font-mono text-xs text-white/80">
                    {metric}
                  </p>
                )}
                <div className="mt-1 flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                    {t('tech_label')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {tech.split(' · ').map((item) => (
                      <span
                        key={item}
                        className="rounded border border-white/20 bg-white/10 px-2 py-1 font-mono text-[11px] text-white/85"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* lessons + repo */}
              <div className="flex flex-col gap-5 md:border-l md:border-white/15 md:pl-8">
                {whatWentWrong && (
                  <div className="border-l-2 border-white/40 pl-4">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-white/55">
                      What went wrong
                    </span>
                    <p className="mt-1 font-body text-sm leading-relaxed text-white/85">
                      {whatWentWrong}
                    </p>
                  </div>
                )}
                {whatIdChange && (
                  <div className="border-l-2 border-white/40 pl-4">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-white/55">
                      What I&apos;d change
                    </span>
                    <p className="mt-1 font-body text-sm leading-relaxed text-white/85">
                      {whatIdChange}
                    </p>
                  </div>
                )}
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-1 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  View on GitHub
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
        </div>
      </div>
    </article>
  )
}
