'use client'
import { useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '@/lib/gsap'
import { useDescent } from '@/components/city/DescentContext'
import { REVEAL_END } from '@/components/city/phases'

const PIN_VH = 500 // ≈500vh of scroll drives progress 0→1

export function HeroStage({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const { progress } = useDescent()
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (reduced) {
      // Reduced motion: immediately resolve to the post-reveal city pose.
      progress.current = REVEAL_END
      return
    }
    const outer = outerRef.current, pin = pinRef.current
    if (!outer || !pin) return
    const trigger = ScrollTrigger.create({
      trigger: outer,
      start: 'top top',
      end: `+=${PIN_VH * window.innerHeight / 100}`,
      pin: pin,
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress
        pin.dataset.progress = self.progress.toFixed(3)
      },
    })
    return () => trigger.kill()
  }, { scope: outerRef, dependencies: [reduced] })

  // Reduced motion: no pin, hero is a single static screen.
  if (reduced) {
    return <div ref={outerRef} className="relative">{children}</div>
  }
  return (
    <div ref={outerRef} style={{ height: `${PIN_VH}vh` }} className="relative">
      <div ref={pinRef} data-progress="0" className="h-screen w-full overflow-hidden">
        {children}
      </div>
    </div>
  )
}
