'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildCity, CITY_SEED } from '../cityData'
import { useDescent } from '../DescentContext'
import { PHASE, localProgress } from '../phases'

// Site palette — matches globals.css
const ACCENT     = new THREE.Color(0xff1e00) // #FF1E00 — accent red
const ACCENT_WARM = new THREE.Color(0xff4500) // #FF4500 — orange-red (buildings)

export function CityWireframe() {
  const { progress, visible } = useDescent()
  const group = useRef<THREE.Group>(null)
  const layout = useMemo(() => buildCity(CITY_SEED), [])

  // Road grid as a single LineSegments along the lattice.
  const roads = useMemo(() => {
    const pts: number[] = []
    for (const z of layout.roadsX) pts.push(-layout.half, 0.01, z, layout.half, 0.01, z)
    for (const x of layout.roadsZ) pts.push(x, 0.01, -layout.half, x, 0.01, layout.half)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [layout])

  // Building edges merged into one LineSegments (translate unit-box edges per building).
  // twin/WHITE accent buildings are a follow-up tuning pass — layout.buildings[].twin
  // carries the hook for later.
  const buildingGeo = useMemo(() => {
    const merged: number[] = []
    const box = new THREE.BoxGeometry(1, 1, 1)
    const edges = new THREE.EdgesGeometry(box)
    const arr = edges.attributes.position.array as ArrayLike<number>
    for (const b of layout.buildings) {
      for (let i = 0; i < arr.length; i += 3) {
        merged.push(arr[i] * b.w + b.x, (arr[i + 1] + 0.5) * b.h, arr[i + 2] * b.d + b.z)
      }
    }
    box.dispose(); edges.dispose()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(merged, 3))
    return geo
  }, [layout])

  useFrame(() => {
    if (!visible.current) return
    // Draw-in: fade the whole city up during REVEAL.
    const draw = localProgress(progress.current, [PHASE.reveal[0], PHASE.reveal[1]])
    const g = group.current
    if (!g) return
    g.visible = progress.current >= PHASE.reveal[0] - 0.02
    g.traverse((o) => {
      const m = (o as THREE.LineSegments).material as THREE.LineBasicMaterial | undefined
      if (m && 'opacity' in m) m.opacity = draw
    })
  })

  return (
    <group ref={group} visible={false}>
      <lineSegments geometry={roads}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={buildingGeo}>
        <lineBasicMaterial color={ACCENT_WARM} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  )
}
