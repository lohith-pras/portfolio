'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildCity, CITY_SEED } from './cityData'
import { mulberry32, range } from '@/lib/rng'
import { useDescent } from './DescentContext'
import { PHASE, envelope, localProgress } from './phases'

const CYAN = new THREE.Color(0x00f5ff)
const NEURAL_Y = 16

export function Overlays() {
  const { progress, visible } = useDescent()
  const layout = useMemo(() => buildCity(CITY_SEED), [])

  // ---- Beat 1: V2X links ----
  const links = useRef<THREE.LineSegments>(null)
  const linkMat = useRef<THREE.LineBasicMaterial>(null)
  const linkData = useMemo(() => {
    const r = mulberry32(0x71)
    const nodes = layout.roadsZ.flatMap((x) => layout.roadsX.map((z) => new THREE.Vector3(x, 0.5, z)))
    const pairs: [THREE.Vector3, THREE.Vector3][] = []
    for (let i = 0; i < 40; i++) {
      const a = nodes[Math.floor(range(r, 0, nodes.length))]
      const b = nodes[Math.floor(range(r, 0, nodes.length))]
      if (a.distanceTo(b) < layout.cell * 2.2 && a !== b) pairs.push([a, b])
    }
    const pts: number[] = []
    pairs.forEach(([a, b]) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z))
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [layout])

  // ---- Beat 2: Neural plane ----
  const neural = useRef<THREE.Group>(null)
  const neuralMat = useRef<THREE.LineBasicMaterial>(null)
  const neuralGeo = useMemo(() => {
    const r = mulberry32(0xA1)
    const n = 24
    const nodes = Array.from({ length: n }, () =>
      new THREE.Vector3(range(r, -layout.half, layout.half), 0, range(r, -layout.half, layout.half)),
    )
    const pts: number[] = []
    nodes.forEach((a) => {
      nodes.forEach((b) => {
        if (a !== b && a.distanceTo(b) < layout.cell * 2) pts.push(a.x, a.y, a.z, b.x, b.y, b.z)
      })
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [layout])

  // ---- Beat 3: Energy streams ----
  const energy = useRef<THREE.Points>(null)
  const energyMat = useRef<THREE.PointsMaterial>(null)
  const energyGeo = useMemo(() => {
    const pts: number[] = []
    layout.chargers.forEach((c) => {
      for (let i = 0; i < 20; i++) pts.push(c.x, i * 0.25, c.z)
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [layout])

  useFrame(({ clock }) => {
    if (!visible.current) return
    const p = progress.current

    // Beat 1 — V2X links
    const vis1 = envelope(p, PHASE.beat1, 0.03)
    if (links.current) links.current.visible = vis1 > 0.001
    if (linkMat.current) linkMat.current.opacity = vis1 * (0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 3))

    // Beat 2 — Neural plane
    const vis2 = envelope(p, PHASE.beat2, 0.04)
    const rise = localProgress(p, PHASE.beat2)
    if (neural.current) {
      neural.current.visible = vis2 > 0.001
      neural.current.position.y = NEURAL_Y * (0.6 + 0.4 * rise) // rises into place
    }
    if (neuralMat.current) neuralMat.current.opacity = vis2 * 0.8

    // Beat 3 — Electromobility energy streams
    const vis3 = envelope(p, PHASE.beat3, 0.04)
    if (energy.current) energy.current.visible = vis3 > 0.001
    if (energyMat.current) energyMat.current.opacity = vis3 * (0.6 + 0.4 * Math.sin(clock.getElapsedTime() * 4))
  })

  return (
    <group>
      {/* Beat 1 — V2X connectivity links */}
      <lineSegments ref={links} geometry={linkData} visible={false}>
        <lineBasicMaterial ref={linkMat} color={CYAN} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* Beat 2 — AI neural plane */}
      <group ref={neural} visible={false}>
        <lineSegments geometry={neuralGeo}>
          <lineBasicMaterial ref={neuralMat} color={0x66ffff} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
      </group>

      {/* Beat 3 — Electromobility energy streams */}
      <points ref={energy} geometry={energyGeo} visible={false}>
        <pointsMaterial ref={energyMat} color={CYAN} size={0.18} sizeAttenuation transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}
