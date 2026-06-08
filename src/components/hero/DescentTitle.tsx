'use client'
import { useEffect, useRef } from 'react'
import { HeroTitle } from '@/components/HeroTitle'
import { useDescent } from '@/components/city/DescentContext'

/**
 * DescentTitle — reads progress via rAF and drives CSS on the title:
 *   • first 15% of scroll: name fades in over the city
 *   • last 30% of scroll: name fades out together with the city
 */
export function DescentTitle() {
  const wrap = useRef<HTMLDivElement>(null)
  const { progress } = useDescent()

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = progress.current
      const w = wrap.current
      if (w) {
        // Fade in over the first 15%, fade out over the last 30% (with the city).
        const appear = Math.min(1, Math.max(0, p / 0.15))
        const fadeOut = 1 - Math.min(1, Math.max(0, (p - 0.7) / 0.3))
        w.style.opacity = String(appear * fadeOut)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  return (
    <>

      {/* Title: appears at reveal, docks lower-left through beats */}
      <div
        ref={wrap}
        className="absolute bottom-24 left-6 md:left-16 z-10"
        style={{ opacity: 0 }}
      >
        <HeroTitle />
      </div>
    </>
  )
}
