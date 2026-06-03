'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildCity, CITY_SEED } from './cityData'
import { buildDroneArcs, sampleArc } from './lanes'
import { mulberry32, range } from '@/lib/rng'
import { useDescent } from './DescentContext'
import { PHASE } from './phases'

const COUNT = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 4 : 10

export function Drones() {
  const { progress, visible } = useDescent()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const layout = useMemo(() => buildCity(CITY_SEED), [])
  const arcs = useMemo(() => buildDroneArcs(layout, COUNT), [layout])
  const agents = useMemo(() => {
    const r = mulberry32(0xD2046)
    return arcs.map((_, i) => ({ arc: i, t: r(), speed: range(r, 0.05, 0.12) }))
  }, [arcs])
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
      const p = sampleArc(arcs[a.arc], a.t)
      dummy.position.set(p[0], p[1], p[2])
      dummy.rotation.y += dt * 2
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} visible={false}>
      <octahedronGeometry args={[0.35, 0]} />
      <meshBasicMaterial color={0x99ffff} wireframe transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}
