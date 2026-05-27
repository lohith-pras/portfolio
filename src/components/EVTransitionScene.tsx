'use client'

/**
 * EVTransitionScene.tsx — Hero-scroll EV charging vignette.
 *
 * Fixed overlay (z-10, pointer-events-none), centered horizontally,
 * anchored bottom-16. GSAP ScrollTrigger scrubs a single timeline
 * tied to #hero. Animation runs only while hero is in viewport.
 *
 * Timeline (normalised over hero scroll 0 → 1):
 *   0.00 → 0.20  EV drives in from right            (translateX 200% → 0%)
 *   0.20 → 0.50  Cable extends + plugs in           (stroke-dashoffset L → 0)
 *   0.50 → 0.70  Charge pulse                       (bolt + glow rings)
 *   0.70 → 0.85  Cable retracts, EV drives off left (dashoffset back, translateX 0% → -200%)
 *   0.85 → 1.00  Scene fades                        (container opacity 1 → 0)
 *
 * prefers-reduced-motion: render static scene at 20% opacity, no GSAP.
 *
 * GSAP integration notes:
 *  - Imports ScrollTrigger from '@/lib/gsap' (plugin registered once at module level)
 *  - useGSAP from @gsap/react handles React 19 strict-mode double-mount
 *  - scope: containerRef so all selectors are local to this component
 */

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

export function EVTransitionScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useGSAP(
    () => {
      if (prefersReduced) return

      const container = containerRef.current
      const hero = document.getElementById('hero')
      if (!container || !hero) return

      const car = container.querySelector('.ev-car') as SVGGElement | null
      const cable = container.querySelector('.ev-cable') as SVGPathElement | null
      const bolt = container.querySelector('.ev-bolt') as SVGPolygonElement | null
      const rings = container.querySelector('.ev-glow-rings') as SVGGElement | null
      if (!car || !cable || !bolt || !rings) return

      const cableLen = cable.getTotalLength()
      gsap.set(cable, { strokeDasharray: cableLen, strokeDashoffset: cableLen })
      gsap.set(car, { xPercent: 200 })
      gsap.set(container, { opacity: 1 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        defaults: { ease: 'none' },
      })

      // 0 → 20%: EV drives in
      tl.to(car, { xPercent: 0, ease: 'power2.out', duration: 0.2 }, 0)
      // 20 → 50%: cable plugs in
      tl.to(cable, { strokeDashoffset: 0, duration: 0.3 }, 0.2)
      // 50 → 70%: charge pulse
      tl.to(bolt, { opacity: 1, duration: 0.05, yoyo: true, repeat: 3 }, 0.5)
      tl.fromTo(
        rings,
        { opacity: 1, scale: 0.6, transformOrigin: '46px 70px' },
        { opacity: 0, scale: 2.2, transformOrigin: '46px 70px', duration: 0.2 },
        0.5
      )
      // 70 → 85%: cable retracts, EV drives off left
      tl.to(cable, { strokeDashoffset: cableLen, duration: 0.15 }, 0.7)
      tl.to(car, { xPercent: -200, duration: 0.15 }, 0.7)
      // 85 → 100%: fade scene
      tl.to(container, { opacity: 0, duration: 0.15 }, 0.85)

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    },
    { scope: containerRef, dependencies: [] }
  )

  if (prefersReduced) {
    return (
      <div
        className="fixed bottom-16 left-0 right-0 z-10 pointer-events-none flex justify-center opacity-20"
        aria-hidden="true"
      >
        <EVSceneSVG />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-16 left-0 right-0 z-10 pointer-events-none flex justify-center"
      aria-hidden="true"
    >
      <EVSceneSVG />
    </div>
  )
}

function EVSceneSVG() {
  return (
    <svg
      viewBox="0 0 400 220"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[min(560px,80vw)] h-auto"
      aria-hidden="true"
    >
      <g className="ev-station">
        <rect x="30" y="170" width="30" height="10" fill="#2a2a2a" />
        <rect x="42" y="80" width="8" height="90" fill="#2a2a2a" />
        <rect x="25" y="55" width="42" height="30" rx="3" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1" />
        <circle className="ev-led" cx="46" cy="70" r="3" fill="#FF4500" />
      </g>
      <g className="ev-glow-rings" opacity="0">
        <circle cx="46" cy="70" r="8" fill="none" stroke="#FF4500" strokeWidth="1.5" />
        <circle cx="46" cy="70" r="14" fill="none" stroke="#FF4500" strokeWidth="1" opacity="0.6" />
        <circle cx="46" cy="70" r="20" fill="none" stroke="#FF4500" strokeWidth="0.5" opacity="0.3" />
      </g>
      <path
        className="ev-cable"
        d="M 50 85 C 70 130, 130 150, 175 145"
        fill="none"
        stroke="#FF4500"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <polygon
        className="ev-bolt"
        points="248,55 268,55 256,78 272,78 244,108 254,84 238,84"
        fill="#FFC906"
        opacity="0"
      />
      <g className="ev-car">
        <polygon
          points="160,150 200,110 250,85 295,85 325,115 340,150"
          fill="#0A0A0A"
          stroke="#FF4500"
          strokeWidth="1.5"
        />
        <polygon points="215,110 252,95 290,95 318,115" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="0.75" />
        <rect x="158" y="132" width="6" height="3" fill="#FF4500" />
        <rect x="172" y="140" width="6" height="6" fill="#FF4500" opacity="0.7" />
        <circle cx="195" cy="160" r="14" fill="#0A0A0A" stroke="#666" strokeWidth="2" />
        <circle cx="305" cy="160" r="14" fill="#0A0A0A" stroke="#666" strokeWidth="2" />
        <circle cx="195" cy="160" r="4" fill="#FF4500" />
        <circle cx="305" cy="160" r="4" fill="#FF4500" />
      </g>
    </svg>
  )
}
