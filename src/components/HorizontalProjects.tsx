'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Project index — list on the left, a detail panel pinned on the right. On desktop
 * the whole block pins and scrubs: scrolling advances the active project (~1 screen
 * each). Clicking a row scrolls to its band so click and scroll stay in sync. On
 * mobile (or reduced motion) it's a plain tap-to-switch stack.
 *
 * Only isac_drl has a public repo, so only its panel shows View Source. `image`
 * falls back to a numbered placeholder if the cover is missing.
 */
const PROJECTS = [
  { key: 'ni_agent', number: '01', category: 'AI Agents', year: '2026', href: null,                                      image: '/projects/ni_agent.png' },
  { key: 'isac_drl', number: '02', category: 'Deep RL',   year: '2025', href: 'https://github.com/lohith-pras/isac-drl', image: '/projects/isac_drl.png' },
  { key: 'vlc',      number: '03', category: 'Hardware',  year: '2023', href: null,                                      image: '/projects/vlc.png' },
  { key: 'iot',      number: '04', category: 'Embedded',  year: '2023', href: null,                                      image: '/projects/iot.png' },
] as const

const N = PROJECTS.length
const DESKTOP = '(min-width: 1024px)'

export function HorizontalProjects() {
  const t = useTranslations('work')
  const tp = useTranslations('projects')
  const reduce = useReducedMotion()

  const sectionRef = useRef<HTMLElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const active = PROJECTS[activeIndex]

  // Scroll-driven active project: pin via sticky CSS, read progress → index.
  useGSAP(
    () => {
      if (reduce) return
      const mm = gsap.matchMedia()
      mm.add(DESKTOP, () => {
        const outer = outerRef.current
        if (!outer) return
        outer.style.height = `${N * 100}vh`
        const st = ScrollTrigger.create({
          trigger: outer,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const idx = Math.min(N - 1, Math.floor(self.progress * N))
            setActiveIndex((prev) => (prev === idx ? prev : idx))
          },
        })
        return () => {
          st.kill()
          outer.style.height = ''
        }
      })
      return () => mm.revert()
    },
    { scope: sectionRef, dependencies: [reduce] },
  )

  // Click a row → on desktop scroll to its band (keeps scroll/active synced);
  // on mobile just switch and bring the panel into view.
  const select = (i: number) => {
    const isDesktop = typeof window !== 'undefined' && window.matchMedia(DESKTOP).matches
    if (isDesktop && !reduce && outerRef.current) {
      const top = window.scrollY + outerRef.current.getBoundingClientRect().top
      const dist = outerRef.current.offsetHeight - window.innerHeight
      const y = top + ((i + 0.5) / N) * dist
      // Scroll through Lenis when it's running so the scrub follows smoothly;
      // fall back to ScrollToPlugin if Lenis is unavailable.
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(y, { duration: 0.8 })
      else gsap.to(window, { scrollTo: y, duration: 0.6, ease: 'power2.inOut' })
    } else {
      setActiveIndex(i)
      detailRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
  }

  // Stagger the rows up on first view.
  useGSAP(
    () => {
      if (reduce || !listRef.current) return
      gsap.from(listRef.current.children, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: listRef.current, start: 'top 80%', once: true },
      })
    },
    { scope: sectionRef, dependencies: [reduce] },
  )

  // Clip-path line reveal on the eyebrow.
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
          scrollTrigger: { trigger: eyebrowRef.current, start: 'top 85%', once: true },
        },
      )
    },
    { dependencies: [reduce] },
  )

  // Crossfade the detail panel whenever the active project changes.
  useGSAP(
    () => {
      if (reduce || !detailRef.current) return
      gsap.fromTo(
        detailRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
      )
    },
    { dependencies: [activeIndex] },
  )

  const name = tp(`${active.key}.name`)
  const description = tp(`${active.key}.description`)
  const problem = tp(`${active.key}.problem`)
  const tech = tp(`${active.key}.tech`).split('·').map((s) => s.trim()).filter(Boolean)

  return (
    <section id="projects" ref={sectionRef} className="relative z-10 bg-paper-2">
      {/* outer gains height on desktop (set in JS) to create the scrub distance */}
      <div ref={outerRef}>
        {/* inner pins via sticky on desktop; normal flow on mobile */}
        <div className="px-6 py-[var(--space-section-lg)] md:px-16 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:overflow-hidden lg:py-0">
          <div className="mx-auto w-full max-w-6xl">
            {/* section head — eyebrow + rule + ghost numeral 02 */}
            <div className="mb-12 flex items-baseline gap-4 md:mb-16">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-3 -top-10 -z-10 select-none font-mono text-[clamp(6rem,18vw,16rem)] font-bold leading-none text-foreground/[0.035]"
                >
                  02
                </span>
                <span
                  ref={eyebrowRef}
                  className="relative font-mono text-[11px] uppercase tracking-[0.3em] text-muted"
                  style={reduce ? undefined : { clipPath: 'inset(0 0 100% 0)' }}
                >
                  {t('heading')}
                </span>
              </div>
              <div className="h-px flex-1 bg-rule" />
            </div>

            {/* split — list left, detail right (stacks on mobile) */}
            <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
              {/* left: project list */}
              <div ref={listRef}>
                {PROJECTS.map((p, i) => {
                  const isActive = i === activeIndex
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => select(i)}
                      aria-pressed={isActive}
                      className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-t border-rule py-6 text-left transition-colors duration-300 last:border-b focus-visible:outline-none md:py-7"
                    >
                      <span className={`font-mono text-xs transition-colors duration-300 ${isActive ? 'text-accent' : 'text-muted group-hover:text-accent'}`}>
                        {p.number}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block font-display text-[clamp(1.3rem,2.6vw,2rem)] leading-tight transition-[color,transform] duration-300 ${
                            isActive
                              ? 'translate-x-2 text-foreground'
                              : 'text-foreground/60 group-hover:translate-x-2 group-hover:text-foreground'
                          }`}
                        >
                          {tp(`${p.key}.name`)}
                        </span>
                      </span>
                      <span className="flex items-baseline gap-3 whitespace-nowrap font-mono text-[11px] uppercase tracking-widest text-muted">
                        <span className="hidden sm:inline">{p.category}</span>
                        <span className="hidden text-rule sm:inline">·</span>
                        <span>{p.year}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* right: detail panel */}
              <div className="lg:pl-4">
                <div ref={detailRef}>
                  {/* cover */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/[0.06] to-transparent">
                      <span className="font-mono text-7xl font-bold text-white/10">{active.number}</span>
                    </div>
                    <img
                      key={active.key}
                      src={active.image}
                      alt={name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0'
                      }}
                    />
                  </div>

                  {/* meta + copy */}
                  <div className="mt-6 flex flex-col gap-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent/80">{problem}</p>
                    <p className="text-sm leading-relaxed text-foreground/75 [text-wrap:pretty]">{description}</p>

                    <div className="flex flex-wrap gap-2">
                      {tech.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-foreground/70"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    {active.href && (
                      <a
                        href={active.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-foreground transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        View Source
                        <span aria-hidden="true" className="transition-transform duration-200 group-hover/btn:translate-x-0.5">
                          ↗
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
