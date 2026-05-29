'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion'
import { useTranslations } from 'next-intl'
import { PLACES } from '@/lib/places'
import { PlaceCard } from './PlaceCard'

function ProgressDots({
  scrollYProgress,
  count,
}: {
  scrollYProgress: MotionValue<number>
  count: number
}) {
  const [active, setActive] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(count - 1, Math.floor(v * count)))
  })

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="h-2 rounded-full"
          animate={{
            width: i === active ? 24 : 8,
            backgroundColor: i === active ? '#FF1E00' : 'rgba(255,255,255,0.25)',
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  )
}

export function PlacesSection() {
  const t = useTranslations('places')
  const outerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const n = PLACES.length

  const { scrollYProgress } = useScroll({ target: outerRef })
  const rawX = useTransform(scrollYProgress, [0, 1], ['0vw', `-${(n - 1) * 100}vw`])
  const x = useSpring(rawX, { stiffness: 100, damping: 30 })
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

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
              <motion.div
                style={{
                  x: reducedMotion ? rawX : x,
                  width: `${n * 100}vw`,
                }}
                className="flex h-full"
              >
                {PLACES.map((place, i) => (
                  <PlaceCard key={place.key} place={place} index={i} />
                ))}
              </motion.div>
            </div>
            <ProgressDots scrollYProgress={scrollYProgress} count={n} />
            <motion.div
              style={{ opacity: scrollHintOpacity }}
              className="absolute bottom-6 right-8 flex items-center gap-2 text-white/40 text-sm font-mono pointer-events-none"
            >
              <span>{t('scroll_hint')}</span>
              <motion.span
                animate={{ x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="block md:hidden px-6">
        <h2 className="text-2xl font-bold font-display mb-8">{t('heading')}</h2>
        <div className="flex flex-col gap-16">
          {PLACES.map((place, i) => (
            <PlaceCard key={place.key} place={place} index={i} mobile />
          ))}
        </div>
      </div>
    </section>
  )
}
