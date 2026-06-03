'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildCity, CITY_SEED } from './cityData'
import { buildLanes, sampleLane } from './lanes'
import { mulberry32, range } from '@/lib/rng'
import { useDescent } from './DescentContext'
import { PHASE } from './phases'

const CYAN = new THREE.Color(0x00f5ff)

function vehicleCount(): number {
  if (typeof window === 'undefined') return 40
  const low = window.matchMedia('(max-width: 768px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4
  return low ? 12 : 40
}

export function Vehicles() {
  const { progress, visible } = useDescent()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const layout = useMemo(() => buildCity(CITY_SEED), [])
  const lanes = useMemo(() => buildLanes(layout), [layout])
  const count = useMemo(vehicleCount, [])

  const agents = useMemo(() => {
    const r = mulberry32(0x5EED)
    return Array.from({ length: count }, () => ({
      lane: Math.floor(range(r, 0, lanes.length)),
      t: r(),
      speed: range(r, 0.02, 0.06) * (r() < 0.5 ? 1 : -1),
    }))
  }, [lanes, count])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, dt) => {
    const mesh = meshRef.current
    if (!mesh) return
    if (!visible.current) return
    const active = progress.current >= PHASE.reveal[0]
    mesh.visible = active
    if (!active) return
    agents.forEach((a, i) => {
      a.t += a.speed * dt
      const p = sampleLane(lanes[a.lane], a.t)
      dummy.position.set(p[0], 0.3, p[2])
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} visible={false}>
      <boxGeometry args={[0.5, 0.25, 1.0]} />
      <meshBasicMaterial color={CYAN} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}
