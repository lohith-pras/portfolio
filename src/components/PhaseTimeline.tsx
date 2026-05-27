'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

export function PhaseTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const line = document.getElementById('timeline-line')
    const nodes = gsap.utils.toArray('.timeline-node') as HTMLElement[]

    if (!line) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      gsap.set(line, { drawSVG: '0% 100%' })
      gsap.set(nodes, { scale: 1 })
      return
    }

    gsap.set(line, { drawSVG: '0% 0%' })
    gsap.set(nodes, { scale: 0 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 50%',
        end: 'bottom 50%',
        scrub: 1,
      }
    })

    tl.to(line, { drawSVG: '0% 100%', ease: 'none' }, 0)
    
    // Scale nodes as line passes them
    nodes.forEach((node, i) => {
      tl.to(node, { scale: 1, ease: 'back.out(2)', duration: 0.1 }, (i + 1) * (1 / (nodes.length + 1)))
    })

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative h-full min-h-[500px] flex flex-col items-center py-8">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <line
          id="timeline-line"
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke="#FF1E00"
          strokeWidth="2"
        />
      </svg>
      
      {/* Node 1 */}
      <div className="timeline-node w-4 h-4 bg-background border-2 border-accent rounded-full absolute top-[20%] left-1/2 -translate-x-1/2" />
      {/* Node 2 */}
      <div className="timeline-node w-4 h-4 bg-background border-2 border-accent rounded-full absolute top-[50%] left-1/2 -translate-x-1/2" />
      {/* Node 3 */}
      <div className="timeline-node w-4 h-4 bg-background border-2 border-accent rounded-full absolute top-[80%] left-1/2 -translate-x-1/2" />
    </div>
  )
}
