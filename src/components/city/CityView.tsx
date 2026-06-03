'use client'
import { useReducedMotion } from 'framer-motion'
import { View, PerspectiveCamera } from '@react-three/drei'
import { CityScene } from './CityScene'

export function CityView() {
  const reduced = useReducedMotion()
  // Reduced-motion still shows the city (static pose) — HeroStage pins progress
  // at REVEAL_END, so the camera rig resolves to a fixed over-city pose. The View
  // itself is identical; only animation differs. Remount on the flag so the rig
  // picks up the pinned vs live progress cleanly.
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <View style={{ width: '100%', height: '100%' }}>
        <PerspectiveCamera makeDefault position={[0, 22, 34]} fov={50} near={0.1} far={400} />
        <CityScene key={reduced ? 'static' : 'live'} />
      </View>
    </div>
  )
}
