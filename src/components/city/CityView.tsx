'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { View, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { CityScene } from './CityScene'
import { useDescent } from './DescentContext'
import { useDeviceTier } from './useRenderProfile'

// City fades to black over the last stretch of the scroll, then content arrives.
const FADE_START = 0.7
const FADE_END = 1.0

export function CityView() {
  const reduced = useReducedMotion()
  const tier = useDeviceTier()
  const { progress } = useDescent()
  const fadeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    let raf = 0
    const tick = () => {
      const el = fadeRef.current
      if (el) {
        const p = progress.current
        const f = Math.min(1, Math.max(0, (p - FADE_START) / (FADE_END - FADE_START)))
        el.style.opacity = String(f)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress, reduced])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <View style={{ width: '100%', height: '100%' }}>
        {/* Iso pose framing the 8×8 grid; useDescentCamera drives it each frame. */}
        <PerspectiveCamera makeDefault position={[0, 34, 58]} fov={65} near={0.1} far={1200} />
        <CityScene key={reduced ? 'static' : 'live'} />
        <EffectComposer>
          {tier === 'high' ? (
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
          ) : (
            // Low tier: skip mipmapBlur, render bloom at quarter res — big GPU saving.
            <Bloom luminanceThreshold={0.25} intensity={1.0} resolutionX={256} resolutionY={256} />
          )}
        </EffectComposer>
      </View>

      {/* Cyberpunk dark navy vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 75% 65% at 50% 48%, transparent 45%, #050a10 100%)',
        }}
      />

      {/* Fade-to-black as the hero beat ends */}
      <div
        ref={fadeRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#0A0A0A', opacity: 0 }}
      />
    </div>
  )
}

