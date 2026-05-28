import { useRef } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { ChibiPose } from '@/hooks/useChibiAnimation'

interface ChibiCharacterProps {
  pose: ChibiPose
  onPointerEnter: () => void
  onPointerLeave: () => void
}

const POSE_INDEX: Record<ChibiPose, number> = {
  idle: 0,
  wave: 1,
  point: 2,
  celebrate: 3,
}

export function ChibiCharacter({ pose, onPointerEnter, onPointerLeave }: ChibiCharacterProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const textures = useTexture([
    '/chibi/idle.png',
    '/chibi/wave.png',
    '/chibi/point.png',
    '/chibi/celebrate.png',
  ])

  // Correct color space so textures don't look washed out
  textures.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace })

  const activeTexture = textures[POSE_INDEX[pose]]

  return (
    <mesh
      ref={meshRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <planeGeometry args={[1.8, 2.4]} />
      <meshBasicMaterial transparent map={activeTexture} />
    </mesh>
  )
}
