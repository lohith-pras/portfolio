'use client'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleCamera } from './cameraPath'
import { useDescent } from './DescentContext'

export function useDescentCamera() {
  const { camera } = useThree()
  const { progress, mouse, visible } = useDescent()
  const lerpedMouse = useRef(new THREE.Vector2())
  const lookTarget = useRef(new THREE.Vector3())

  useFrame(({ clock }) => {
    // Offscreen pause — skip all work when #hero is not visible.
    if (!visible.current) return

    const p = Number.isNaN(progress.current) ? 0 : progress.current
    const pose = sampleCamera(p)

    // Idle drift — small, continuous so it's never frozen.
    const t = clock.getElapsedTime()
    const driftX = Math.sin(t * 0.13) * 0.6
    const driftY = Math.cos(t * 0.11) * 0.4

    // Mouse parallax — lerp toward target.
    lerpedMouse.current.lerp(mouse.current, 0.05)
    const mx = lerpedMouse.current.x * 2.2
    const my = lerpedMouse.current.y * 1.4

    camera.position.set(pose.position[0] + driftX + mx, pose.position[1] + driftY + my, pose.position[2])
    lookTarget.current.set(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2])
    camera.lookAt(lookTarget.current)
  })
}
