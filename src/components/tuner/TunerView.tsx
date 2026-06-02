'use client'

/**
 * TunerView — DOM-tracked drei <View> wrapper for the RF tuner, mirroring
 * ChibiView. Renders its own tracked element and portals the scene into
 * R3FRoot's <View.Port/>. pointerEvents:auto so the knob receives drag events.
 */

import { Component, Suspense, type ReactNode } from 'react'
import { View } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import { TunerDevice } from './TunerDevice'

class TunerErrorBoundary extends Component<
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

function TunerViewInner() {
  const prefersReduced = useReducedMotion()

  return (
    <View
      className="tuner-view"
      style={{ width: '100%', height: '100%', pointerEvents: 'auto', cursor: 'grab', touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <TunerDevice reducedMotion={!!prefersReduced} />
      </Suspense>
    </View>
  )
}

export function TunerView() {
  return (
    <TunerErrorBoundary>
      <TunerViewInner />
    </TunerErrorBoundary>
  )
}
