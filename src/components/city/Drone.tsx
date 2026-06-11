'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDescent } from './DescentContext'
import { PHASE } from './phases'

// Damped harmonic oscillator: produces natural spring motion with acceleration and decay.
class Spring {
  pos = 0
  vel = 0
  target = 0
  constructor(private k = 8, private d = 3) {}
  update(dt: number) {
    this.vel += (-this.k * (this.pos - this.target) - this.d * this.vel) * dt
    this.pos += this.vel * dt
    return this.pos
  }
}

// Shared assets — one allocation reused across every drone instance.
const FILL = new THREE.MeshStandardMaterial({ color: 0x0a1420, metalness: 0.8, roughness: 0.2 })
const EDGE = new THREE.LineBasicMaterial({
  color: new THREE.Color(0x4db8ff).multiplyScalar(3.0), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false,
})

// Fresnel rim-light: dark→cyan shimmer based on view angle, gives metallic crystal feel.
const FRESNEL = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 } },
  vertexShader: /* glsl */`
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(cameraPosition - wp.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      float f = 1.0 - abs(dot(vNormal, vViewDir));
      f = pow(f, 1.8);
      float pulse = 0.8 + 0.2 * sin(time * 2.0);
      vec3 col = mix(vec3(0.0, 0.2, 0.4), vec3(0.2, 0.9, 1.0), f);
      gl_FragColor = vec4(col * pulse, f * 0.75);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.FrontSide,
})

const droneGeo = new THREE.OctahedronGeometry(1.2, 0)
droneGeo.scale(1, 2.5, 1) // elongated floating crystal shape
droneGeo.computeVertexNormals() // recalculate after non-uniform scale for Fresnel
const droneEdges = new THREE.EdgesGeometry(droneGeo)

const _pos = new THREE.Vector3()

import { Clone, useGLTF } from '@react-three/drei'
import { ASSETS } from './ModelLoader'
import { useState } from 'react'

export function Drone({ curve, speed, offset }: { curve: THREE.CatmullRomCurve3; speed: number; offset: number }) {
  const { progress, visible } = useDescent()
  const group = useRef<THREE.Group>(null)
  const t = useRef(offset)
  const len = useMemo(() => curve.getLength(), [curve])
  const hoverSpring = useRef(new Spring(8, 3))

  const [hovered, setHovered] = useState(false)
  const targetScale = hovered ? 1.5 : 1.0
  const currentScale = useRef(targetScale)

  const { scene: droneModel } = useGLTF(ASSETS.drone)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    if (!visible.current) return

    t.current = (t.current + (speed * dt) / len) % 1
    curve.getPointAt(t.current, _pos)

    // Gentle altitude bob with spring physics: oscillator springs toward a moving target.
    hoverSpring.current.target = Math.sin(state.clock.elapsedTime * 0.4 + offset * 6) * 1.5
    const bob = hoverSpring.current.update(dt)
    g.position.set(_pos.x, _pos.y + bob, _pos.z)

    // Slow rotation
    g.rotation.x += dt * 0.5
    g.rotation.y += dt * 0.7
    
    currentScale.current = THREE.MathUtils.damp(currentScale.current, targetScale, 6.0, dt)
    g.scale.setScalar(currentScale.current)

    FRESNEL.uniforms.time.value = state.clock.elapsedTime
  })

  return (
    <group 
      ref={group}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      <Clone object={droneModel} scale={[0.5, 0.5, 0.5]} />
    </group>
  )
}
