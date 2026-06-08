'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleCarRoute, type CarRoute } from './carRoutes'
import { useDescent } from './DescentContext'
import { PHASE } from './phases'

// Shared assets — one allocation reused across every car instance.
const FILL = new THREE.MeshBasicMaterial({ color: 0x0a1420 })
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

export function Car({ route, speed, offset }: { route: CarRoute; speed: number; offset: number }) {
  const { progress, visible } = useDescent()
  const group = useRef<THREE.Group>(null)
  const wheels = useRef<THREE.Group[]>([])
  const dist = useRef(offset * route.total)

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    if (!visible.current) return

    const { pos, dir, u } = sampleCarRoute(route, dist.current)
    // Ease down approaching corners, speed up mid-block.
    const v = speed * (0.55 + 0.45 * Math.sin(Math.PI * u))
    dist.current += v * dt

    g.position.set(pos[0], pos[1], pos[2])
    _e.set(0, Math.atan2(-dir[2], dir[0]), 0)
    _q.setFromEuler(_e)
    g.quaternion.slerp(_q, 0.15) // smooth turn-in at intersections

    const spin = v * dt * WHEEL_SPIN
    for (const w of wheels.current) if (w) w.rotation.z += spin
  })

  const addWheel = useMemo(() => (i: number) => (g: THREE.Group | null) => { if (g) wheels.current[i] = g }, [])

  return (
    <group ref={group}>
      {/* Body */}
      <mesh geometry={bodyGeo} material={FILL} position={[0, 0.3, 0]} />
      <lineSegments geometry={bodyEdges} material={EDGE} position={[0, 0.3, 0]} />
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
