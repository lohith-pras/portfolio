'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useInView } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { AvatarModel } from './AvatarModel'

export function AvatarScene() {
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
