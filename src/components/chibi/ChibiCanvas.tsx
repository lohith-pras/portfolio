'use client'

import { Component, Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { useChibiAnimation } from '@/hooks/useChibiAnimation'
import { ChibiCharacter } from './ChibiCharacter'

class ChibiErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

export function ChibiCanvas() {
  const { pose, onPointerEnter, onPointerLeave } = useChibiAnimation('#about')

  return (
    <ChibiErrorBoundary>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ alpha: true, antialias: true, toneMapping: 0 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))}
      >
        <Suspense fallback={null}>
          <ChibiCharacter
            pose={pose}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
          />
        </Suspense>
      </Canvas>
      </div>
    </ChibiErrorBoundary>
  )
}
