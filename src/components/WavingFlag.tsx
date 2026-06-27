'use client'

import { useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface WavingFlagProps {
  bgColor: string
  accentColor: string
  number: string
  logoUrl: string
  logoAlt: string
  phaseOffset?: number
}

const SPEED = 1.5
const MAX_AMPLITUDE = 10
const STRIP_COUNT = 30
const BANNER_WIDTH = 120
const BANNER_HEIGHT = 280
const STRIP_HEIGHT = BANNER_HEIGHT / STRIP_COUNT

export function WavingFlag({
  bgColor,
  accentColor,
  number,
  logoUrl,
  logoAlt,
  phaseOffset = 0,
}: WavingFlagProps) {
  const stripsRef = useRef<(HTMLDivElement | null)[]>([])
  const isReducedMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center">
      {/* Hanging rod */}
      <div
        style={{
          width: BANNER_WIDTH,
          height: 2,
          backgroundColor: 'rgba(255,255,255,0.3)',
        }}
      />
      {/* Banner strips */}
      <div style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT }}>
        {Array.from({ length: STRIP_COUNT }).map((_, i) => {
          const tNorm = i / (STRIP_COUNT - 1)
          const amplitude = tNorm * MAX_AMPLITUDE
          const phase = tNorm * Math.PI * 2
          const delay = -((phase + phaseOffset) / SPEED)

          return (
            <div
              key={i}
              ref={(el) => {
                stripsRef.current[i] = el
              }}
              className="motion-safe:animate-[flag-wave_4.18879s_linear_infinite]"
              style={{
                overflow: 'hidden',
                height: STRIP_HEIGHT,
                position: 'relative',
                backgroundColor: bgColor,
                willChange: isReducedMotion ? undefined : 'transform',
                '--wave-amplitude': `${amplitude}px`,
                animationDelay: `${delay}s`,
              } as React.CSSProperties}
            >
              {/* Full banner content, clipped by parent overflow:hidden */}
              <div
                style={{
                  position: 'absolute',
                  top: -i * STRIP_HEIGHT,
                  left: 0,
                  width: BANNER_WIDTH,
                  height: BANNER_HEIGHT,
                  backgroundColor: bgColor,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 8px',
                }}
              >
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  style={{ width: '100%', objectFit: 'contain', maxHeight: 110 }}
                />
                <span
                  style={{
                    color: accentColor,
                    fontSize: '2rem',
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {number}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
