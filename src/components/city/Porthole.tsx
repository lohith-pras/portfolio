'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDescent } from './DescentContext'
import { PHASE, envelope, localProgress } from './phases'

const ACCENT = new THREE.Color(0xff1e00)  // #FF1E00 site accent red

export function Porthole() {
  const group = useRef<THREE.Group>(null)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)
  const { progress, visible } = useDescent()

  // Bolt ring positions.
  const bolts = useMemo(() => {
    const n = 12, rad = 3.2, out: THREE.Vector3[] = []
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      out.push(new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, 0))
    }
    return out
  }, [])

  useFrame(({ clock }) => {
    if (!visible.current) return
    const p = progress.current
    const vis = Math.max(envelope(p, [PHASE.porthole[0], PHASE.enter[1]], 0.04),
                         p < PHASE.porthole[0] + 0.001 ? 1 : 0)
    const g = group.current
    if (!g) return
    g.visible = vis > 0.001
    if (!g.visible) return
    // Sit in front of the camera start; scale up as we punch through ENTER.
    const enter = localProgress(p, PHASE.enter)
    const scale = 1 + enter * 6
    g.scale.setScalar(scale)
    const breathe = 0.9 + 0.1 * Math.sin(clock.getElapsedTime() * 1.5)
    if (ringMat.current) ringMat.current.opacity = vis * breathe
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh>
        <torusGeometry args={[3, 0.08, 12, 64]} />
        <meshBasicMaterial ref={ringMat} color={ACCENT} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Inner thin ring */}
      <mesh>
        <torusGeometry args={[2.7, 0.02, 8, 64]} />
        <meshBasicMaterial color={0xff4500} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {bolts.map((b, i) => (
        <mesh key={i} position={b}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color={0xff6622} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
