'use client'
import { useEffect, useRef } from 'react'
import { HeroTitle } from '@/components/HeroTitle'
import { useDescent } from '@/components/city/DescentContext'
import { PHASE, REVEAL_END } from '@/components/city/phases'

/**
 * DescentTitle — reads progress via rAF and drives CSS on the title:
 *   • porthole phase: shows "Scroll to enter ↓" caret
 *   • reveal phase: name fades in centered
 *   • beat phases: name shrinks + docks to lower-left corner
 */
export function DescentTitle() {
  const wrap = useRef<HTMLDivElement>(null)
  const caret = useRef<HTMLDivElement>(null)
  const { progress } = useDescent()

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = progress.current
      const w = wrap.current, c = caret.current
      if (w) {
        // Title appears from REVEAL start, settles by REVEAL_END.
        const appear = Math.min(1, Math.max(0, (p - PHASE.reveal[0]) / (REVEAL_END - PHASE.reveal[0])))
        // Title docks (shrinks to lower-left) during beat1.
        const dock = Math.min(1, Math.max(0, (p - PHASE.beat1[0]) / (PHASE.beat1[1] - PHASE.beat1[0])))
        w.style.opacity = String(appear)
        const scale = 1 - dock * 0.45
        w.style.transform = `translate(${dock * -2}vw, ${dock * 4}vh) scale(${scale})`
        w.style.transformOrigin = 'left bottom'
      }
      // Caret: full opacity during porthole, gone as descent starts.
      if (c) c.style.opacity = String(Math.max(0, 1 - p / PHASE.porthole[1]))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  return (
    <>
      {/* Porthole "Scroll to enter" caret */}
      <div
        ref={caret}
        className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex flex-col items-center gap-2 text-foreground/60 font-body text-sm tracking-[0.2em] uppercase"
        aria-hidden="true"
      >
        <span>Scroll to enter</span>
        <span className="animate-bounce text-base">↓</span>
      </div>

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
