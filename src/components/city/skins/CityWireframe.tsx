'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshReflectorMaterial } from '@react-three/drei'
import { buildCity, CITY_SEED } from '../cityData'
import { useDescent } from '../DescentContext'

// ─── Cyberpunk Neon Cyan Palette ─────────────────────────────────────────────
const GROUND_COLOR    = new THREE.Color(0x050a10)  // dark teal/navy void
const FILL_COLOR      = new THREE.Color(0x000000)  // pure black building fill
const ROAD_FILL       = new THREE.Color(0x4db8ff).multiplyScalar(1.5)  // glowing arterial roads
const ROAD_COLOR      = new THREE.Color(0x4db8ff).multiplyScalar(2)
const INTERSECT_COLOR = new THREE.Color(0xffffff).multiplyScalar(4)    // pure white hot intersection cores
const GLOW_COLOR      = new THREE.Color(0xff0000).multiplyScalar(2.0)  // red window streaks
const ANTENNA_COLOR   = new THREE.Color(0xff0000).multiplyScalar(3.0)
const RING_COLOR      = new THREE.Color(0x4db8ff).multiplyScalar(2)
const STAR_COLOR      = new THREE.Color(0x4db8ff).multiplyScalar(3)
const ROOF_COLOR      = new THREE.Color(0x00ffcc).multiplyScalar(1.8)  // teal roof props

const ROAD_HW = 2.5   // wider grid road half-width to accommodate extra space

export function CityWireframe() {
  const { visible } = useDescent()
  const group = useRef<THREE.Group>(null)
  const layout = useMemo(() => buildCity(CITY_SEED), [])

  // Max building height — used for color gradients and scan shader
  const maxH = useMemo(() => layout.buildings.reduce((m, b) => Math.max(m, b.h), 30), [layout])

  // ── Grid road fills ──────────────────────────────────────────────────────────
  const roadFillGeo = useMemo(() => {
    const positions: number[] = []
    const indices: number[] = []
    let o = 0
    const H = layout.half
    const quad = (ax: number, az: number, bx: number, bz: number, cx: number, cz: number, dx: number, dz: number) => {
      positions.push(ax, 0.005, az, bx, 0.005, bz, cx, 0.005, cz, dx, 0.005, dz)
      indices.push(o, o+1, o+2, o, o+2, o+3); o += 4
    }
    for (const z of layout.roadsX) quad(-H, z - ROAD_HW, H, z - ROAD_HW, H, z + ROAD_HW, -H, z + ROAD_HW)
    for (const x of layout.roadsZ) quad(x - ROAD_HW, -H, x + ROAD_HW, -H, x + ROAD_HW, H, x - ROAD_HW, H)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setIndex(indices)
    return geo
  }, [layout])

  // ── Grid road edge curbs ─────────────────────────────────────────────────────
  const roadEdgeGeo = useMemo(() => {
    const pts: number[] = []
    const indices: number[] = []
    let o = 0
    const H = layout.half
    const curbW = 0.15
    const addCurb = (x0: number, z0: number, x1: number, z1: number) => {
      // A simple thick quad for the curb
      const dx = x1 - x0, dz = z1 - z0
      const len = Math.hypot(dx, dz)
      const nx = -dz / len * curbW, nz = dx / len * curbW
      pts.push(
        x0 - nx, 0.05, z0 - nz,
        x1 - nx, 0.05, z1 - nz,
        x1 + nx, 0.05, z1 + nz,
        x0 + nx, 0.05, z0 + nz
      )
      indices.push(o, o+1, o+2, o, o+2, o+3)
      o += 4
    }

    for (const z of layout.roadsX) {
      addCurb(-H, z - ROAD_HW, H, z - ROAD_HW)
      addCurb(-H, z + ROAD_HW, H, z + ROAD_HW)
    }
    for (const x of layout.roadsZ) {
      addCurb(x - ROAD_HW, -H, x - ROAD_HW, H)
      addCurb(x + ROAD_HW, -H, x + ROAD_HW, H)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [layout])

  // ── Intersection hotspot pads ────────────────────────────────────────────────
  const nodeGeo = useMemo(() => {
    const positions: number[] = []
    const indices: number[] = []
    let o = 0
    const s = ROAD_HW * 1.1
    for (const z of layout.roadsX) {
      for (const x of layout.roadsZ) {
        positions.push(x-s, 0.02, z-s, x+s, 0.02, z-s, x+s, 0.02, z+s, x-s, 0.02, z+s)
        indices.push(o, o+1, o+2, o, o+2, o+3); o += 4
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setIndex(indices)
    return geo
  }, [layout])

  // ── Crosswalk stripes ────────────────────────────────────────────────────────
  const crosswalkGeo = useMemo(() => {
    const pts: number[] = []
    const indices: number[] = []
    let o = 0
    const w = ROAD_HW
    const n = 5
    const addRect = (x0: number, z0: number, x1: number, z1: number) => {
      const dx = x1 - x0, dz = z1 - z0
      const len = Math.hypot(dx, dz)
      const nx = -dz / len * 0.15, nz = dx / len * 0.15
      pts.push(
        x0 - nx, 0.02, z0 - nz,
        x1 - nx, 0.02, z1 - nz,
        x1 + nx, 0.02, z1 + nz,
        x0 + nx, 0.02, z0 + nz
      )
      indices.push(o, o+1, o+2, o, o+2, o+3)
      o += 4
    }

    for (const z of layout.roadsX) {
      for (const x of layout.roadsZ) {
        for (let i = 0; i < n; i++) {
          const off = -w + 0.22 + (i / (n - 1)) * (2 * w - 0.44)
          addRect(x + off, z - w - 0.9, x + off, z - w - 0.18)
          addRect(x + off, z + w + 0.18, x + off, z + w + 0.9)
          addRect(x + w + 0.18, z + off, x + w + 0.9, z + off)
          addRect(x - w - 0.9, z + off, x - w - 0.18, z + off)
        }
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [layout])

  // ── Solid building fills (occlusion) ─────────────────────────────────────────
  const fillGeo = useMemo(() => {
    const positions: number[] = []
    const indices: number[] = []
    let vo = 0
    const addBox = (x: number, z: number, w: number, d: number, y0: number, y1: number) => {
      const hw = w / 2, hd = d / 2
      positions.push(
        x-hw, y0, z-hd,  x+hw, y0, z-hd,  x+hw, y0, z+hd,  x-hw, y0, z+hd,
        x-hw, y1, z-hd,  x+hw, y1, z-hd,  x+hw, y1, z+hd,  x-hw, y1, z+hd,
      )
      const o = vo
      indices.push(
        o+3, o+2, o+6, o+3, o+6, o+7,
        o+0, o+4, o+5, o+0, o+5, o+1,
        o+0, o+3, o+7, o+0, o+7, o+4,
        o+1, o+5, o+6, o+1, o+6, o+2,
        o+4, o+7, o+6, o+4, o+6, o+5,
        o+0, o+1, o+2, o+0, o+2, o+3,
      )
      vo += 8
    }

    const cyl = new THREE.CylinderGeometry(1, 1, 1, 16)
    const cylPos = cyl.attributes.position.array as ArrayLike<number>
    const cylIdx = cyl.index!.array as ArrayLike<number>

    const addCylinder = (x: number, z: number, w: number, d: number, y0: number, y1: number) => {
      const h = y1 - y0
      const rw = w / 2, rd = d / 2
      const baseVo = vo
      for (let i = 0; i < cylPos.length; i += 3) {
        positions.push(cylPos[i] * rw + x, (cylPos[i+1] + 0.5) * h + y0, cylPos[i+2] * rd + z)
      }
      for (let i = 0; i < cylIdx.length; i++) {
        indices.push(cylIdx[i] + baseVo)
      }
      vo += cylPos.length / 3
    }

    for (const b of layout.buildings) {
      if (b.shape === 'cylinder') {
        addCylinder(b.x, b.z, b.w, b.d, 0, b.h)
      } else {
        addBox(b.x, b.z, b.w, b.d, 0, b.h)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    cyl.dispose()
    return geo
  }, [layout])

  // ── Building wireframe edges — height-gradient vertex colors (red → cyan) ────
  const edgeGeo = useMemo(() => {
    const merged: number[] = []
    const colors: number[] = []

    const box = new THREE.BoxGeometry(1, 1, 1)
    const boxEdges = new THREE.EdgesGeometry(box)
    const boxArr = boxEdges.attributes.position.array as ArrayLike<number>

    const cyl = new THREE.CylinderGeometry(1, 1, 1, 16)
    const cylEdges = new THREE.EdgesGeometry(cyl)
    const cylArr = cylEdges.attributes.position.array as ArrayLike<number>

    const pushVertex = (px: number, py: number, pz: number) => {
      merged.push(px, py, pz)
      // t=0 → red (2,0,0); t=1 → cyan (0,1.8,2); midpoint is magenta-ish
      const t = Math.min(py / maxH, 1.0)
      colors.push(2.0 * (1.0 - t), 2.0 * t, 2.0 * t)
    }

    const addEdgeBox = (x: number, z: number, w: number, d: number, y0: number, y1: number) => {
      const h = y1 - y0
      for (let i = 0; i < boxArr.length; i += 3) {
        pushVertex(boxArr[i] * w + x, (boxArr[i+1] + 0.5) * h + y0, boxArr[i+2] * d + z)
      }
    }

    const addEdgeCylinder = (x: number, z: number, w: number, d: number, y0: number, y1: number) => {
      const h = y1 - y0
      const rw = w / 2, rd = d / 2
      for (let i = 0; i < cylArr.length; i += 3) {
        pushVertex(cylArr[i] * rw + x, (cylArr[i+1] + 0.5) * h + y0, cylArr[i+2] * rd + z)
      }
    }

    for (const b of layout.buildings) {
      const addShape = b.shape === 'cylinder' ? addEdgeCylinder : addEdgeBox

      if (b.tier) {
        addShape(b.x, b.z, b.w, b.d, 0, b.h * b.tier.hFraction)
        addShape(b.x, b.z, b.tier.w, b.tier.d, b.h * b.tier.hFraction, b.h)
      } else {
        addShape(b.x, b.z, b.w, b.d, 0, b.h)
      }
    }
    box.dispose(); boxEdges.dispose()
    cyl.dispose(); cylEdges.dispose()

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(merged, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geo
  }, [layout, maxH])

  // ── Antenna masts on tallest buildings ───────────────────────────────────────
  const antennaGeo = useMemo(() => {
    const pts: number[] = []
    for (const b of layout.buildings) {
      if (!b.antenna) continue
      pts.push(b.x, b.h, b.z, b.x, b.h + 3.5, b.z)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [layout])

  // ── Window glow streaks ──────────────────────────────────────────────────────
  const glowGeo = useMemo(() => {
    const pts: number[] = []
    layout.buildings.forEach((b, i) => {
      if (b.h < 8 || i % 2 !== 0) return
      const hw = b.w / 2
      const cols = 3
      for (let c = 0; c < cols; c++) {
        const x = b.x - hw + ((c + 1) / (cols + 1)) * b.w
        pts.push(x, 0.5, b.z + b.d / 2, x, b.h * 0.88, b.z + b.d / 2)
      }
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [layout])

  // ── Roof prop geometry — helipad / water tank / vent ─────────────────────────
  const roofPropGeo = useMemo(() => {
    const pts: number[] = []

    for (const b of layout.buildings) {
      if (!b.roofProp) continue
      const { x, z, h, w, d } = b
      const y = h + 0.05

      if (b.roofProp === 'helipad') {
        const r = Math.min(w, d) * 0.28
        const n = 12
        for (let i = 0; i < n; i++) {
          const a1 = (i / n) * Math.PI * 2
          const a2 = ((i + 1) / n) * Math.PI * 2
          pts.push(x + Math.cos(a1) * r, y, z + Math.sin(a1) * r)
          pts.push(x + Math.cos(a2) * r, y, z + Math.sin(a2) * r)
        }
        // H marker
        const hw2 = r * 0.45, hh = r * 0.55
        pts.push(x - hw2, y, z - hh, x - hw2, y, z + hh)
        pts.push(x + hw2, y, z - hh, x + hw2, y, z + hh)
        pts.push(x - hw2, y, z,      x + hw2, y, z)
      }

      if (b.roofProp === 'tank') {
        const tw = Math.min(w * 0.3, 1.5)
        const th = tw * 1.2
        const tx = x + w * 0.15, tz = z + d * 0.15
        // bottom rectangle
        pts.push(tx - tw/2, y,    tz - tw/2, tx + tw/2, y,    tz - tw/2)
        pts.push(tx + tw/2, y,    tz - tw/2, tx + tw/2, y,    tz + tw/2)
        pts.push(tx + tw/2, y,    tz + tw/2, tx - tw/2, y,    tz + tw/2)
        pts.push(tx - tw/2, y,    tz + tw/2, tx - tw/2, y,    tz - tw/2)
        // top rectangle
        pts.push(tx - tw/2, y+th, tz - tw/2, tx + tw/2, y+th, tz - tw/2)
        pts.push(tx + tw/2, y+th, tz - tw/2, tx + tw/2, y+th, tz + tw/2)
        pts.push(tx + tw/2, y+th, tz + tw/2, tx - tw/2, y+th, tz + tw/2)
        pts.push(tx - tw/2, y+th, tz + tw/2, tx - tw/2, y+th, tz - tw/2)
        // vertical edges
        pts.push(tx - tw/2, y, tz - tw/2, tx - tw/2, y+th, tz - tw/2)
        pts.push(tx + tw/2, y, tz - tw/2, tx + tw/2, y+th, tz - tw/2)
        pts.push(tx + tw/2, y, tz + tw/2, tx + tw/2, y+th, tz + tw/2)
        pts.push(tx - tw/2, y, tz + tw/2, tx - tw/2, y+th, tz + tw/2)
      }

      if (b.roofProp === 'vent') {
        const s = Math.min(w, d) * 0.22
        pts.push(x - s, y, z - s, x + s, y, z + s)
        pts.push(x + s, y, z - s, x - s, y, z + s)
        pts.push(x - s, y, z,     x + s, y, z)
        pts.push(x, y, z - s,     x, y, z + s)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [layout])

  // ── Orbital ring — horizontal circle above the skyline ───────────────────────
  const orbitalRingGeo = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 26, 26, 0, Math.PI * 2, false, 0)
    const pts2d = curve.getPoints(96)
    const positions: number[] = []
    const RING_Y = 30
    for (let i = 0; i < pts2d.length; i++) {
      const next = pts2d[(i + 1) % pts2d.length]
      positions.push(pts2d[i].x, RING_Y, pts2d[i].y)
      positions.push(next.x, RING_Y, next.y)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])

  // ── Star / asterisk icons ─────────────────────────────────────────────────────
  const starGeo = useMemo(() => {
    const pts: number[] = []
    const RING_Y = 30

    const addStar = (x: number, y: number, z: number, size = 1.2) => {
      pts.push(x - size, y, z,              x + size, y, z)
      pts.push(x, y, z - size,              x, y, z + size)
      pts.push(x - size*0.7, y, z - size*0.7, x + size*0.7, y, z + size*0.7)
      pts.push(x - size*0.7, y, z + size*0.7, x + size*0.7, y, z - size*0.7)
      pts.push(x, y - size*0.4, z,          x, y + size*0.4, z)
    }

    const numRingStars = 8
    for (let i = 0; i < numRingStars; i++) {
      const angle = (i / numRingStars) * Math.PI * 2
      addStar(Math.cos(angle) * 26, RING_Y, Math.sin(angle) * 26, 1.4)
    }

    const scatterPositions: [number, number, number][] = [
      [-34, 18, -22], [30, 14, -32], [32, 20, 26], [-30, 16, 30],
      [0, 34, -20],   [20, 24, -4],  [-22, 22, 2],  [4, 28, 22],
    ]
    for (const [sx, sy, sz] of scatterPositions) {
      addStar(sx, sy, sz, 0.9)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [])

  // ── Data-scan sweep — ShaderMaterial horizontal band ─────────────────────────
  const scanMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      maxH: { value: maxH },
    },
    vertexShader: /* glsl */`
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */`
      uniform float time;
      uniform float maxH;
      varying vec3 vWorldPos;
      void main() {
        float scanY = mod(time * 6.0, maxH + 15.0);
        float d = abs(vWorldPos.y - scanY);
        float a = smoothstep(5.0, 0.0, d) * 0.20;
        float t = clamp(vWorldPos.y / maxH, 0.0, 1.0);
        vec3 col = mix(vec3(1.0, 0.15, 0.0), vec3(0.0, 0.9, 1.0), t);
        gl_FragColor = vec4(col, a);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [maxH])

  // ── Animation refs ───────────────────────────────────────────────────────────
  const ringGroupRef = useRef<THREE.Group>(null)
  const antennaMatRef = useRef<THREE.LineBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!visible.current) return
    const g = group.current
    if (!g) return
    g.visible = true

    const t = clock.getElapsedTime()

    // Slowly rotate orbital ring + stars
    if (ringGroupRef.current) ringGroupRef.current.rotation.y = t * 0.07

    // Pulse antenna opacity
    if (antennaMatRef.current) {
      antennaMatRef.current.opacity = 0.05 + 0.9 * (0.5 + 0.5 * Math.sin(t * 3.5 + 1.0))
    }

    // Advance scan sweep
    scanMat.uniforms.time.value = t
  })

  return (
    <group ref={group}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[layout.half * 2.4, layout.half * 2.4]} />
        <MeshReflectorMaterial 
          blur={[300, 100]} 
          resolution={1024} 
          mixBlur={1} 
          mixStrength={40} 
          roughness={0.6} 
          depthScale={1.2} 
          minDepthThreshold={0.4} 
          maxDepthThreshold={1.4} 
          color="#050a10" 
          metalness={0.5} 
          mirror={0.5} 
        />
      </mesh>

      {/* Building solid fills — rendered first to occlude road geometry behind them */}
      <mesh geometry={fillGeo} castShadow receiveShadow>
        <meshStandardMaterial color={0x050a10} metalness={0.7} roughness={0.3} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>

      {/* Building glass faces — dark cyan tint gives interior depth without breaking wireframe look */}
      <mesh geometry={fillGeo}>
        <meshBasicMaterial color={0x061828} transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Data-scan sweep — reuses fillGeo so the band only appears on building surfaces */}
      <mesh geometry={fillGeo}>
        <primitive object={scanMat} attach="material" />
      </mesh>

      {/* Grid road fill bands */}
      <mesh geometry={roadFillGeo} receiveShadow>
        <meshStandardMaterial color={0x111111} roughness={0.8} metalness={0.1} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
      </mesh>

      {/* Grid road edge curbs */}
      <mesh geometry={roadEdgeGeo} receiveShadow castShadow>
        <meshStandardMaterial color={0x333333} roughness={0.9} />
      </mesh>

      {/* Crosswalk stripes at intersections */}
      <mesh geometry={crosswalkGeo} receiveShadow>
        <meshStandardMaterial color={0xdddddd} roughness={0.9} metalness={0} />
      </mesh>

      {/* Intersection hotspot pads */}
      <mesh geometry={nodeGeo} receiveShadow>
        <meshStandardMaterial color={0x222222} roughness={0.9} polygonOffset polygonOffsetFactor={-2} />
      </mesh>

      {/* Building wireframe edges — vertex colors give red→cyan height gradient */}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial vertexColors transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* Roof props — helipad, water tank, vent */}
      <lineSegments geometry={roofPropGeo}>
        <lineBasicMaterial color={ROOF_COLOR} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* Antenna masts — pulsing glowing spires on tallest towers */}
      <lineSegments geometry={antennaGeo}>
        <lineBasicMaterial ref={antennaMatRef} color={ANTENNA_COLOR} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* Window glow streaks — vertical light on tall buildings */}
      <lineSegments geometry={glowGeo}>
        <lineBasicMaterial color={GLOW_COLOR} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* Orbital ring + stars — rotates slowly around Y axis */}
      <group ref={ringGroupRef}>
        <lineSegments geometry={orbitalRingGeo}>
          <lineBasicMaterial color={RING_COLOR} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
        <lineSegments geometry={starGeo}>
          <lineBasicMaterial color={STAR_COLOR} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
      </group>
    </group>
  )
}
