'use client'

import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'

export function R3FRoot() {
  return (
    <Canvas
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
      className="!fixed inset-0 -z-0 pointer-events-none"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: 0 }}
      onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))}
      frameloop="demand"
    >
      <View.Port />
    </Canvas>
  )
}
