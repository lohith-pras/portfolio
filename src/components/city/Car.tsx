'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleCarRoute, type CarRoute } from './carRoutes'
import { useDescent } from './DescentContext'
import { PHASE } from './phases'

// Shared assets — one allocation reused across every car instance.
const FILL = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.4 })
const EDGE = new THREE.LineBasicMaterial({
  color: new THREE.Color(0x4db8ff).multiplyScalar(4.0), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false,
})
const HEADLIGHT_MAT = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(5) })
const TAILLIGHT_MAT = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff1800).multiplyScalar(4) })
const lightGeo = new THREE.SphereGeometry(0.07, 5, 4)

const bodyGeo = new THREE.BoxGeometry(2.4, 0.7, 1.2)
const bodyEdges = new THREE.EdgesGeometry(bodyGeo)
const cabinGeo = new THREE.BoxGeometry(1.0, 0.5, 1.0)
const cabinEdges = new THREE.EdgesGeometry(cabinGeo)
const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 8).rotateX(Math.PI / 2) // axle along local Z
const wheelEdges = new THREE.EdgesGeometry(wheelGeo)

const WHEEL_POS: [number, number, number][] = [
  [0.9, 0.24, 0.56], [0.9, 0.24, -0.56], [-0.9, 0.24, 0.56], [-0.9, 0.24, -0.56],
]
const WHEEL_SPIN = 6 // rad per world-unit travelled

const _q = new THREE.Quaternion()
const _e = new THREE.Euler()

import { Clone, useGLTF } from '@react-three/drei'
import { ASSETS } from './ModelLoader'
import { useState } from 'react'

export function Car({ route, speed, offset }: { route: CarRoute; speed: number; offset: number }) {
  const { progress, visible } = useDescent()
  const group = useRef<THREE.Group>(null)
  const wheels = useRef<THREE.Group[]>([])
  const dist = useRef(offset * route.total)

  // Interaction & Lane Switching state
  const [hovered, setHovered] = useState(false)
  const targetScale = hovered ? 1.15 : 1.0
  const currentScale = useRef(targetScale)
  
  const targetLane = useRef((Math.random() - 0.5) * 1.8) // lanes range from -0.9 to 0.9
  const currentLane = useRef(targetLane.current)

  // Load the car model
  const { scene: carModel } = useGLTF(ASSETS.car)

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    if (!visible.current) return

    // Occasionally decide to switch lanes
    if (Math.random() < 0.002) {
      targetLane.current = (Math.random() - 0.5) * 1.8
    }

    const { pos, dir, u } = sampleCarRoute(route, dist.current)
    const v = speed * (0.55 + 0.45 * Math.sin(Math.PI * u))
    dist.current += v * dt

    // Smooth damp the lane offset and scale
    currentLane.current = THREE.MathUtils.damp(currentLane.current, targetLane.current, 1.5, dt)
    currentScale.current = THREE.MathUtils.damp(currentScale.current, targetScale, 6.0, dt)
    
    // Perpendicular vector for lane offset
    const px = -dir[2]
    const pz = dir[0]

    g.position.set(pos[0] + px * currentLane.current, pos[1], pos[2] + pz * currentLane.current)
    g.scale.setScalar(currentScale.current)

    _e.set(0, Math.atan2(-dir[2], dir[0]), 0)
    _q.setFromEuler(_e)
    const turnAlpha = 1.0 - Math.exp(-10.0 * dt)
    g.quaternion.slerp(_q, turnAlpha)

    const spin = v * dt * WHEEL_SPIN
    for (const w of wheels.current) if (w) w.rotation.z += spin
  })

  const addWheel = useMemo(() => (i: number) => (g: THREE.Group | null) => { if (g) wheels.current[i] = g }, [])

  return (
    <group 
      ref={group}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Body from Loaded Model */}
      <Clone object={carModel} scale={[2.4, 0.7, 1.2]} position={[0, 0.3, 0]} />
      {/* Cabin — raised and set back */}
      <mesh geometry={cabinGeo} material={FILL} position={[-0.18, 0.55, 0]} />
      <lineSegments geometry={cabinEdges} material={EDGE} position={[-0.18, 0.55, 0]} />
      {/* Headlights (front white) and taillights (rear red) */}
      <mesh geometry={lightGeo} material={HEADLIGHT_MAT} position={[1.2, 0.3, 0.44]} />
      <mesh geometry={lightGeo} material={HEADLIGHT_MAT} position={[1.2, 0.3, -0.44]} />
      <mesh geometry={lightGeo} material={TAILLIGHT_MAT} position={[-1.2, 0.3, 0.44]} />
      <mesh geometry={lightGeo} material={TAILLIGHT_MAT} position={[-1.2, 0.3, -0.44]} />
      {/* Wheels — inner group spins fill + edges together */}
      {WHEEL_POS.map((p, i) => (
        <group key={i} position={p}>
          <group ref={addWheel(i)}>
            <mesh geometry={wheelGeo} material={FILL} />
            <lineSegments geometry={wheelEdges} material={EDGE} />
          </group>
        </group>
      ))}
    </group>
  )
}
