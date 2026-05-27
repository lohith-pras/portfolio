'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { AVATAR_URL } from '@/lib/avatar'

interface AvatarModelProps {
  inView: boolean
  reducedMotion: boolean
}

// VRoid Studio exports VRM (which is GLB). Humanoid bone node names vary by
// exporter version — try both VRM 0.x PascalCase and VRM 1.x camelCase.
function findBone(scene: THREE.Object3D, ...names: string[]): THREE.Object3D | null {
  for (const name of names) {
    const found = scene.getObjectByName(name)
    if (found) return found
  }
  return null
}

export function AvatarModel({ inView, reducedMotion }: AvatarModelProps) {
  const { scene } = useGLTF(AVATAR_URL)
  const groupRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Object3D | null>(null)
  const rightForeArmRef = useRef<THREE.Object3D | null>(null)
  const wavingRef = useRef(false)
  const wavedRef = useRef(false)

  useEffect(() => {
    // VRM 0.x: RightUpperArm / RightLowerArm (or RightArm / RightForeArm from Mixamo rig)
    // VRM 1.x: J_Bip_R_UpperArm / J_Bip_R_LowerArm (VRoid default node names)
    rightArmRef.current = findBone(
      scene,
      'J_Bip_R_UpperArm',
      'RightUpperArm',
      'RightArm',
      'mixamorigRightArm',
    )
    rightForeArmRef.current = findBone(
      scene,
      'J_Bip_R_LowerArm',
      'RightLowerArm',
      'RightForeArm',
      'mixamorigRightForeArm',
    )
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) child.castShadow = true
    })
  }, [scene])

  useEffect(() => {
    if (inView && !wavedRef.current && !reducedMotion) {
      wavedRef.current = true
      wavingRef.current = true
      setTimeout(() => { wavingRef.current = false }, 2500)
    }
  }, [inView, reducedMotion])

  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.04
      groupRef.current.position.y = -0.85 + Math.sin(t * 0.8) * 0.015
    }

    const arm = rightArmRef.current
    const foreArm = rightForeArmRef.current

    if (wavingRef.current) {
      if (arm) {
        arm.rotation.z = -(Math.PI / 3) + Math.sin(t * 4) * 0.25
        arm.rotation.x = -0.3
      }
      if (foreArm) {
        foreArm.rotation.z = Math.sin(t * 4 + 0.5) * 0.15
      }
    } else {
      if (arm) {
        arm.rotation.z = THREE.MathUtils.lerp(arm.rotation.z, 0, 0.05)
        arm.rotation.x = THREE.MathUtils.lerp(arm.rotation.x, 0, 0.05)
      }
      if (foreArm) {
        foreArm.rotation.z = THREE.MathUtils.lerp(foreArm.rotation.z, 0, 0.05)
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.85, 0]}>
      <primitive object={scene} />
    </group>
  )
}

