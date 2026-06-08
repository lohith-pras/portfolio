'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDescent } from './DescentContext'
import { sampleCamera } from './cameraPath'

export function useDescentCamera() {
  const { progress, mouse, visible } = useDescent()
  const lerpedMouse = useRef(new THREE.Vector2())
  const camTarget = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3())

  // Read the camera off the per-frame state instead of useThree(): no extra
  // store subscription / re-render, and a stable hook order in CityScene.
  useFrame(({ camera, clock }) => {
    if (!visible.current) return

    const t = clock.getElapsedTime()
    const pose = sampleCamera(progress.current)

    // Idle drift — small, continuous so it's never frozen.
    const driftX = Math.sin(t * 0.13) * 1.2
    const driftY = Math.cos(t * 0.11) * 0.8

    // Mouse parallax — lerp toward target.
    lerpedMouse.current.lerp(mouse.current, 0.05)
    const mx = lerpedMouse.current.x * 4
    const my = lerpedMouse.current.y * 2.5

    camTarget.current.set(
      pose.position[0] + driftX + mx,
      pose.position[1] + driftY + my,
      pose.position[2],
    )
    camera.position.lerp(camTarget.current, 0.12)
    lookTarget.current.set(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2])
    camera.lookAt(lookTarget.current)
  })
}
