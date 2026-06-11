'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PLACES } from '@/lib/places'
import { PlaceCard } from './PlaceCard'

function ProgressDots({ active, count }: { active: number; count: number }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-2 rounded-full transition-[width,background-color] duration-300 ease-out"
          style={{
            width: i === active ? 24 : 8,
            backgroundColor: i === active ? 'var(--color-accent)' : 'rgba(255,255,255,0.25)',
          }}
        />
      ))}
    </div>
  )
}

export function PlacesSection() {
  const t = useTranslations('places')
  const reduce = useReducedMotion()
  const n = PLACES.length

  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        const track = trackRef.current
        const outer = outerRef.current
        if (!track || !outer) return

        const st = ScrollTrigger.create({
          trigger: outer,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduce ? true : 1,
          onUpdate: (self) => {
            const p = self.progress
            gsap.set(track, { xPercent: (-100 * (n - 1) * p) / n })
            setActive(Math.min(n - 1, Math.floor(p * n)))
            if (hintRef.current) {
              hintRef.current.style.opacity = String(gsap.utils.clamp(0, 1, 1 - p / 0.1))
            }
          },
        })

        // looping scroll-hint arrow
        const bob =
          reduce || !arrowRef.current
            ? null
            : gsap.to(arrowRef.current, { x: 8, repeat: -1, yoyo: true, duration: 0.75, ease: 'sine.inOut' })

        return () => {
          st.kill()
          bob?.kill()
        }
      })

      return () => mm.revert()
    },
    { scope: outerRef, dependencies: [n, reduce] },
  )

  return (
    <section className="mt-24">
      {/* Desktop: pinned horizontal scroll */}
      <div className="hidden md:block">
        <div ref={outerRef} style={{ height: `${n * 100}vh` }}>
          <div className="sticky top-0 h-screen overflow-hidden relative flex flex-col">
            <div className="px-8 pt-8 pb-2 flex-shrink-0">
              <h2 className="text-2xl font-bold font-display">{t('heading')}</h2>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div ref={trackRef} style={{ width: `${n * 100}vw` }} className="flex h-full">
                {PLACES.map((place, i) => (
                  <PlaceCard key={place.key} place={place} index={i} />
                ))}
              </div>
            </div>
            <ProgressDots active={active} count={n} />
            <div
              ref={hintRef}
              className="absolute bottom-6 right-8 flex items-center gap-2 text-white/40 text-sm font-mono pointer-events-none"
            >
              <span>{t('scroll_hint')}</span>
              <span ref={arrowRef}>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="block md:hidden">
        <h2 className="text-2xl font-bold font-display mb-8 px-6">{t('heading')}</h2>
        <div className="flex flex-col gap-16 pb-24">
          {PLACES.map((place, i) => (
            <PlaceCard key={place.key} place={place} index={i} mobile />
          ))}
        </div>
      </div>
    </section>
  )
}
