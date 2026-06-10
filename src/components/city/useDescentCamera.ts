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
  useFrame(({ camera, clock }, dt) => {
    if (!visible.current) return

    const t = clock.getElapsedTime()
    const pose = sampleCamera(progress.current)

    // Idle drift — small, continuous so it's never frozen.
    const driftX = Math.sin(t * 0.13) * 1.2
    const driftY = Math.cos(t * 0.11) * 0.8

    // Mouse parallax — framerate-independent lerp toward target.
    const mouseAlpha = 1.0 - Math.exp(-3.0 * dt)
    lerpedMouse.current.lerp(mouse.current, mouseAlpha)
    // Phase-aware: parallax is tiny top-down (p=0), large at street level (p>=0.65).
    const p = progress.current
    const parallaxScale = THREE.MathUtils.clamp(
      THREE.MathUtils.mapLinear(p, 0, 0.65, 2, 10), 2, 10,
    )
    const mx = lerpedMouse.current.x * parallaxScale
    const my = lerpedMouse.current.y * parallaxScale * 0.6

    camTarget.current.set(
      pose.position[0] + driftX + mx,
      pose.position[1] + driftY + my,
      pose.position[2],
    )
    // Phase-aware lerp: slow/cinematic during descent, snappier on interactive drift.
    const camK = p < 0.65 ? 4.0 : 8.0
    const camAlpha = 1.0 - Math.exp(-camK * dt)
    camera.position.lerp(camTarget.current, camAlpha)
    lookTarget.current.set(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2])
    camera.lookAt(lookTarget.current)

    // Cinematic Dutch tilt — ramped in after p>0.5, driven by mouse x. Applied
    // AFTER lookAt() since lookAt resets rotation each frame.
    const rollRamp = THREE.MathUtils.smoothstep(p, 0.5, 0.65)
    const rollTarget = -lerpedMouse.current.x * 0.025 * rollRamp
    const rollAlpha = 1.0 - Math.exp(-8.0 * dt)
    camera.rotation.z += (rollTarget - camera.rotation.z) * rollAlpha
  })
}
