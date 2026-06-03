'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32, range } from '@/lib/rng'
import { useDescent } from './DescentContext'
import { PHASE, envelope } from './phases'

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/**
 * Procedural cloud sprite texture: multi-octave (fbm) value noise gives the puff
 * internal structure — wisps and density variation, not a flat radial blob — with
 * a soft radial falloff so edges feather out. Cool cyan-white tint per spec §10.
 */
function makeCloudTexture(seed: number): THREE.Texture {
  const s = 256
  const c = document.createElement('canvas'); c.width = c.height = s
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(s, s)

  const r = mulberry32(seed)
  const makeGrid = (period: number) => {
    const g = new Float32Array(period * period)
    for (let i = 0; i < g.length; i++) g[i] = r()
    return g
  }
  const g4 = makeGrid(4), g8 = makeGrid(8), g16 = makeGrid(16)

  const vnoise = (g: Float32Array, period: number, u: number, v: number) => {
    const gx = u * period, gy = v * period
    const x0 = Math.floor(gx) % period, y0 = Math.floor(gy) % period
    const x1 = (x0 + 1) % period, y1 = (y0 + 1) % period
    const fx = gx - Math.floor(gx), fy = gy - Math.floor(gy)
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
    const a = g[y0 * period + x0] + (g[y0 * period + x1] - g[y0 * period + x0]) * sx
    const b = g[y1 * period + x0] + (g[y1 * period + x1] - g[y1 * period + x0]) * sx
    return a + (b - a) * sy
  }

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const u = x / s, v = y / s
      let n = 0.5 * vnoise(g4, 4, u, v) + 0.3 * vnoise(g8, 8, u, v) + 0.2 * vnoise(g16, 16, u, v)
      n = Math.min(1, Math.max(0, (n - 0.2) / 0.6)) // softer contrast for fluffiness
      const d = Math.hypot(u - 0.5, v - 0.5) * 2 // 0 center → ~1 edge
      const fall = 1 - smoothstep(0.4, 1.0, d)
      const idx = (y * s + x) * 4
      // Pure white, fluffy clouds
      img.data[idx] = 255; img.data[idx + 1] = 255; img.data[idx + 2] = 255
      img.data[idx + 3] = Math.round(n * fall * 255)
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true
  return tex
}

export function CloudField() {
  const { progress, visible } = useDescent()
  const group = useRef<THREE.Group>(null)
  // Two texture variants so neighbouring puffs don't read as identical stamps.
  const texA = useMemo(() => makeCloudTexture(0xC10D), [])
  const texB = useMemo(() => makeCloudTexture(0x5EA), [])
  const matA = useMemo(
    () => new THREE.SpriteMaterial({ 
      map: texA, transparent: true, depthWrite: false, blending: THREE.NormalBlending, opacity: 0.8,
      stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc
    }),
    [texA],
  )
  const matB = useMemo(
    () => new THREE.SpriteMaterial({ 
      map: texB, transparent: true, depthWrite: false, blending: THREE.NormalBlending, opacity: 0.8,
      stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc
    }),
    [texB],
  )

  // Cloud puffs scattered through a vertical band the camera falls through —
  // layered in depth (z) so the descent reads as flying *through* the deck.
  const puffs = useMemo(() => {
    const r = mulberry32(0xC10DF1E)
    return Array.from({ length: 80 }, (_, i) => ({
      pos: new THREE.Vector3(range(r, -34, 34), range(r, -10, 28), range(r, -34, 34)),
      scale: range(r, 9, 22),
      mat: i % 2 === 0 ? matA : matB,
    }))
  }, [matA, matB])

  useFrame((_, delta) => {
    if (!visible.current) return
    // Start window below 0 so clouds are fully visible at initial load (progress 0)
    const vis = envelope(progress.current, [-1, PHASE.clouds[1]], 0.06)
    const g = group.current
    if (!g) return
    g.visible = vis > 0.001
    matA.opacity = 0.8 * vis
    matB.opacity = 0.8 * vis

    // Cloud physics: slow horizontal drift (wind)
    g.children.forEach((child) => {
      child.position.x += 1.2 * delta // Wind blowing on X axis
      if (child.position.x > 34) child.position.x -= 68
    })

    // Seamlessly disable the stencil mask once we pass through the porthole.
    // The porthole component hides itself at PHASE.enter[1] (0.28).
    // Switching to AlwaysStencilFunc prevents the clouds from suddenly vanishing.
    const passedPorthole = progress.current >= PHASE.enter[1]
    const currentStencilFunc = passedPorthole ? THREE.AlwaysStencilFunc : THREE.EqualStencilFunc
    if (matA.stencilFunc !== currentStencilFunc) {
      matA.stencilFunc = currentStencilFunc
      matB.stencilFunc = currentStencilFunc
    }
  })

  return (
    <group ref={group} visible={false}>
      {puffs.map((p, i) => (
        <sprite key={i} position={p.pos} scale={[p.scale, p.scale, 1]} material={p.mat} />
      ))}
    </group>
  )
}
