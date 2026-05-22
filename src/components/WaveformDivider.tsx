'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

export function WaveformDivider() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const path = document.getElementById('waveform-path')
    if (!path) return

    // Ensure DrawSVG starts at 0%
    gsap.set(path, { drawSVG: '0% 0%' })

    gsap.to(path, {
      drawSVG: '0% 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        end: 'top 40%',
        scrub: 1,
      },
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} id="waveform-trigger" className="w-full flex justify-center overflow-hidden py-16 opacity-50">
      <svg viewBox="0 0 1440 100" fill="none" className="w-full max-w-7xl h-auto" aria-hidden="true">
        {/* A complex, realistic waveform path */}
        <path
          id="waveform-path"
          d="M0,50 Q40,50 60,30 T120,50 T180,70 T240,50 T300,20 T360,50 T420,80 T480,50 T540,10 T600,50 T660,90 T720,50 T780,30 T840,50 T900,70 T960,50 T1020,10 T1080,50 T1140,90 T1200,50 T1260,20 T1320,50 T1380,80 T1440,50"
          stroke="#FF1E00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
