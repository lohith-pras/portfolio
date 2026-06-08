'use client'
import { useRef } from 'react'
import { HeroTitle } from '@/components/HeroTitle'
import { useDescent } from '@/components/city/DescentContext'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

/**
 * DescentTitle — reads progress via rAF and drives CSS on the title:
 *   • first 15% of scroll: name fades in over the city
 *   • last 30% of scroll: name fades out together with the city
 */
export function DescentTitle() {
  const wrap = useRef<HTMLDivElement>(null)
  const { progress, visible } = useDescent()

  useGSAP(() => {
    let lastP = -1
    const tick = () => {
      if (!visible.current) return
      const p = progress.current
      if (p === lastP) return
      lastP = p
      
      const w = wrap.current
      if (w) {
        // Fade in over the first 15%, fade out over the last 30% (with the city).
        const appear = Math.min(1, Math.max(0, p / 0.15))
        const fadeOut = 1 - Math.min(1, Math.max(0, (p - 0.7) / 0.3))
        w.style.opacity = String(appear * fadeOut)
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [progress, visible])

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
