'use client'

import { Component, Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'

class PlaceSceneErrorBoundary extends Component<
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

// Swap meshBasicMaterial for useTexture(sprite) when PNG assets are ready
function PlaceSceneContent({ color }: { color: string }) {
  return (
    <mesh>
      <planeGeometry args={[2.5, 3.5]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

interface PlaceSceneProps {
  placeholderColor: string
}

export function PlaceScene({ placeholderColor }: PlaceSceneProps) {
  return (
    <PlaceSceneErrorBoundary>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          gl={{ alpha: true, antialias: true, toneMapping: 0 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))}
        >
          <Suspense fallback={null}>
            <PlaceSceneContent color={placeholderColor} />
          </Suspense>
        </Canvas>
      </div>
    </PlaceSceneErrorBoundary>
  )
}
