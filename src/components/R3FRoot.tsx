'use client'

import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'

export function R3FRoot() {
  // Mount-gate: this component is 'use client' but still prerenders on the
  // server, where `document` is undefined. eventSource={document.body} would
  // throw during SSR, so render nothing until after hydration.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  // z-0 (NOT negative): the canvas must paint ABOVE main's opaque bg so Views are
  // visible; it stays below the navbar (z-50). pointer-events:none keeps page
  // content interactive — tracked View divs opt back in individually.
  // The style prop duplicates className on purpose: R3F injects its own inline style
  // on the Canvas, so the style prop is needed to win — don't remove as "duplication".
  return (
    <Canvas
      eventSource={document.body}
      eventPrefix="client"
      className="!fixed inset-0 z-0 pointer-events-none"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: 0 }}
      onCreated={(state) => {
        state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      }}
      frameloop="always"
    >
      <View.Port />
    </Canvas>
  )
}
