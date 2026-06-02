'use client'

import { Component, Suspense, type ReactNode } from 'react'
import { View, PerspectiveCamera } from '@react-three/drei'
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

function ChibiViewInner() {
  const { pose, onPointerEnter, onPointerLeave } = useChibiAnimation('#about')

  // drei <View> in the DOM tree renders its OWN tracked element from the style
  // here and portals the scene into R3FRoot's <View.Port/>. Do NOT pass a `track`
  // ref + separate div — the HtmlView path ignores `track` (0-size view).
  // pointerEvents:auto so the chibi receives hover events (canvas is pe:none).
  return (
    <View style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={50} />
      <Suspense fallback={null}>
        <ChibiCharacter
          pose={pose}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
        />
      </Suspense>
    </View>
  )
}

export function ChibiView() {
  return (
    <ChibiErrorBoundary>
      <ChibiViewInner />
    </ChibiErrorBoundary>
  )
}
