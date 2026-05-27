'use client'

import { Component, Suspense, type ReactNode, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useInView, useReducedMotion } from 'framer-motion'
import { AvatarModel } from './AvatarModel'

class AvatarErrorBoundary extends Component<
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

function AvatarCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: true, amount: 0.4 })
  const reducedMotion = useReducedMotion() ?? false

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 3]} intensity={1.2} />
        <directionalLight position={[-2, 2, -1]} intensity={0.3} color="#6080ff" />
        <Suspense fallback={null}>
          <AvatarModel inView={inView} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export function AvatarScene() {
  return (
    <AvatarErrorBoundary>
      <AvatarCanvas />
    </AvatarErrorBoundary>
  )
}
