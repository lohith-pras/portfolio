'use client'

import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'

export function R3FRoot() {
  // z-0 (NOT negative): the canvas must paint ABOVE main's opaque bg so Views are
  // visible; it stays below the navbar (z-50). pointer-events:none keeps page
  // content interactive — tracked View divs opt back in individually.
  return (
    <Canvas
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
      className="!fixed inset-0 z-0 pointer-events-none"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: 0 }}
      onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))}
      frameloop="demand"
    >
      <View.Port />
    </Canvas>
  )
}
