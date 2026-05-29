'use client'

import { Component, Suspense, useRef, type ReactNode } from 'react'
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
  const trackRef = useRef<HTMLDivElement>(null!)
  const { pose, onPointerEnter, onPointerLeave } = useChibiAnimation('#about')

  return (
    <>
      {/* Tracked div — this is what the View uses to determine its viewport rect */}
      <div
        ref={trackRef}
        style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
      />
      <View track={trackRef}>
        <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={50} />
        <Suspense fallback={null}>
          <ChibiCharacter
            pose={pose}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
          />
        </Suspense>
      </View>
    </>
  )
}

export function ChibiView() {
  return (
    <ChibiErrorBoundary>
      <ChibiViewInner />
    </ChibiErrorBoundary>
  )
}
