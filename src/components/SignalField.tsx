'use client'

/**
 * SignalField.tsx — Particle "Signal Field" R3F View for the Hero background.
 *
 * Renders ~3000 particles as a sine-wave interference pattern via a custom
 * ShaderMaterial. Uses the shared R3FRoot Canvas (View-based), so NO new
 * Canvas is created here.
 *
 * Features:
 *  - Two wave sources → standing-wave interference pattern, driven by uTime
 *  - Palette: #FF4500 → #C0001A → #0A0A0A, edge-attenuated
 *  - Load animation: particles converge from scattered → wave over heroConverge seconds
 *  - Scroll: camera pulls back + uDisperse 0→1 via GSAP ScrollTrigger
 *  - Mouse parallax: subtle ±5° field tilt, lerped for smoothness
 *  - frameloop="demand" compatible: invalidate() gated by IntersectionObserver
 *  - Reduced-motion: static radial-gradient fallback (identical to ShaderCanvas)
 *  - grainEnabled from context: button stays functional; no visual effect on field
 *    (grain toggle does NOT affect this field — keeping scope minimal)
 */

import { useRef, useEffect, useMemo } from 'react'
import { View, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '@/lib/gsap'
import { durations } from '@/lib/motion'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PARTICLE_COUNT = 3000
const FIELD_W = 12.0
const FIELD_H = 6.0
const CAMERA_Z_DEFAULT = 6
const CAMERA_Z_SCROLLED = 10

// ---------------------------------------------------------------------------
// GLSL shaders — inline template strings (no .glsl files needed)
// ---------------------------------------------------------------------------
const vertexShader = `
#define FIELD_W 12.0
#define FIELD_H 6.0

uniform float uTime;
uniform float uConverge;
uniform float uDisperse;
uniform vec2  uMouse;
uniform float uPixelRatio;

attribute vec3 aRandomPos;

varying float vHeight;
varying float vEdgeDist;

float waveHeight(vec2 p, float t) {
  vec2 srcA = vec2(-FIELD_W * 0.5, 0.0);
  vec2 srcB = vec2( FIELD_W * 0.5, 0.0);
  float dA = distance(p, srcA);
  float dB = distance(p, srcB);
  float wA = sin(dA * 2.0 - t * 1.8);
  float wB = sin(dB * 2.0 + t * 1.4);
  return (wA + wB) * 0.25;
}

void main() {
  vec3 wavePos = position;
  wavePos.z = waveHeight(position.xy, uTime);

  vec3 dispersePos = aRandomPos * 1.6;

  vec3 pos = mix(aRandomPos, wavePos, uConverge);
  pos = mix(pos, dispersePos, uDisperse);

  // Mouse parallax tilt ~5deg max
  float angleX = uMouse.y * 0.087;
  float angleY = uMouse.x * 0.087;
  float cosX = cos(angleX);
  float sinX = sin(angleX);
  float cosY = cos(angleY);
  float sinY = sin(angleY);
  vec3 tilted;
  tilted.x = cosY * pos.x + sinY * pos.z;
  tilted.y = sinX * (-sinY * pos.x + cosY * pos.z) + cosX * pos.y;
  tilted.z = cosX * (-sinY * pos.x + cosY * pos.z) - sinX * pos.y;
  pos = tilted;

  vHeight = wavePos.z;

  float normX = abs(position.x) / (FIELD_W * 0.5);
  float normY = abs(position.y) / (FIELD_H * 0.5);
  vEdgeDist = clamp(max(normX, normY), 0.0, 1.0);

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  // Base size: 8 CSS pixels (≈logical pixels), scaled by device pixel ratio so
  // particles are never sub-pixel on HiDPI screens. Distance-attenuate gently
  // (world-space denominator / 6 keeps size stable near default camera z=6)
  // and clamp to a visible [4, 20] device-pixel range.
  float basePx = 8.0 * uPixelRatio;
  float distScale = 6.0 / max(-mvPos.z, 0.5);
  gl_PointSize = clamp(basePx * distScale, 4.0, 20.0);
  gl_Position = projectionMatrix * mvPos;
}
`

const fragmentShader = `
varying float vHeight;
varying float vEdgeDist;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float r = dot(uv, uv);
  if (r > 0.25) discard;

  vec3 colOrange  = vec3(1.0, 0.271, 0.0);
  vec3 colCrimson = vec3(0.753, 0.0, 0.102);
  vec3 colDark    = vec3(0.04, 0.04, 0.04);

  float h = clamp(vHeight * 2.0 + 0.5, 0.0, 1.0);
  vec3 waveColor = mix(colCrimson, colOrange, h);

  float edgeFade = 1.0 - smoothstep(0.5, 1.0, vEdgeDist);
  vec3 col = mix(colDark, waveColor, edgeFade);

  float alpha = edgeFade * (1.0 - smoothstep(0.15, 0.25, r));
  alpha = clamp(alpha, 0.0, 1.0);

  if (alpha < 0.01) discard;
  gl_FragColor = vec4(col, alpha);
}
`

// ---------------------------------------------------------------------------
// Geometry helpers — stable across renders
// ---------------------------------------------------------------------------
function makeWavePositions(): Float32Array {
  const pos = new Float32Array(PARTICLE_COUNT * 3)
  let idx = 0
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[idx++] = (Math.random() - 0.5) * FIELD_W
    pos[idx++] = (Math.random() - 0.5) * FIELD_H
    pos[idx++] = 0
  }
  return pos
}

function makeRandomPositions(): Float32Array {
  const pos = new Float32Array(PARTICLE_COUNT * 3)
  let idx = 0
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[idx++] = (Math.random() - 0.5) * FIELD_W * 2.5
    pos[idx++] = (Math.random() - 0.5) * FIELD_H * 2.5
    pos[idx++] = (Math.random() - 0.5) * 4
  }
  return pos
}

// ---------------------------------------------------------------------------
// R3F scene — receives shared refs, no React state to avoid re-renders
// ---------------------------------------------------------------------------
function SignalFieldScene({
  isHeroVisible,
  scrollProgress,
  mouseTarget,
}: {
  isHeroVisible: React.MutableRefObject<boolean>
  scrollProgress: React.MutableRefObject<number>
  mouseTarget: React.MutableRefObject<THREE.Vector2>
}) {
  const { invalidate, camera, gl } = useThree()

  const uniforms = useRef({
    uTime:       { value: 0 } as THREE.IUniform<number>,
    uConverge:   { value: 0 } as THREE.IUniform<number>,
    uDisperse:   { value: 0 } as THREE.IUniform<number>,
    uMouse:      { value: new THREE.Vector2(0, 0) } as THREE.IUniform<THREE.Vector2>,
    uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) } as THREE.IUniform<number>,
  })

  const { positions, randomPositions } = useMemo(() => ({
    positions: makeWavePositions(),
    randomPositions: makeRandomPositions(),
  }), [])

  const mountTime = useRef<number | null>(null)
  const lerpedMouse = useRef(new THREE.Vector2(0, 0))

  useFrame(({ clock }) => {
    if (!isHeroVisible.current) return

    const t = clock.getElapsedTime()
    const u = uniforms.current

    // Converge animation — easeOutCubic, runs once from mount
    if (mountTime.current === null) mountTime.current = t
    const elapsed = t - mountTime.current
    const raw = Math.min(elapsed / durations.heroConverge, 1)
    u.uConverge.value = 1 - Math.pow(1 - raw, 3)

    // Keep pixel ratio in sync (can change on window move to different display)
    u.uPixelRatio.value = Math.min(gl.getPixelRatio(), 2)

    // Scroll-driven disperse + camera pull-back
    const sp = isNaN(scrollProgress.current) ? 0 : scrollProgress.current
    u.uDisperse.value = sp
    camera.position.z = CAMERA_Z_DEFAULT + sp * (CAMERA_Z_SCROLLED - CAMERA_Z_DEFAULT)

    // Mouse parallax — lerp for smoothness
    lerpedMouse.current.x += (mouseTarget.current.x - lerpedMouse.current.x) * 0.06
    lerpedMouse.current.y += (mouseTarget.current.y - lerpedMouse.current.y) * 0.06
    u.uMouse.value.copy(lerpedMouse.current)

    u.uTime.value = t

    invalidate()
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aRandomPos"
          args={[randomPositions, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ---------------------------------------------------------------------------
// View wrapper + scroll / mouse / intersection logic
// ---------------------------------------------------------------------------
function SignalFieldViewWithScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null!)
  const isHeroVisible = useRef(true)
  const scrollProgress = useRef(0)
  const mouseTarget = useRef(new THREE.Vector2(0, 0))

  // Mouse parallax
  useEffect(() => {
    function onMove(e: PointerEvent) {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseTarget.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // IntersectionObserver — gate invalidate() when hero exits viewport
  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const obs = new IntersectionObserver(
      ([entry]) => { isHeroVisible.current = entry.isIntersecting },
      { threshold: 0 }
    )
    obs.observe(hero)
    return () => obs.disconnect()
  }, [])

  // GSAP ScrollTrigger — drives scrollProgress + container opacity
  useGSAP(() => {
    const container = containerRef.current
    const hero = document.getElementById('hero')
    if (!container || !hero) return

    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        scrollProgress.current = p
        const opacity = 1 - p
        container.style.opacity = String(opacity)
        container.style.visibility = opacity <= 0 ? 'hidden' : ''
      },
    })

    return () => {
      trigger.kill()
      if (containerRef.current) {
        containerRef.current.style.opacity = '1'
        containerRef.current.style.visibility = ''
      }
    }
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      {/* Tracked element — fills fixed parent, defines the View's rect */}
      <div
        ref={trackRef}
        style={{ width: '100%', height: '100%' }}
      />
      <View track={trackRef}>
        <PerspectiveCamera makeDefault position={[0, 0, CAMERA_Z_DEFAULT]} fov={45} />
        <SignalFieldScene
          isHeroVisible={isHeroVisible}
          scrollProgress={scrollProgress}
          mouseTarget={mouseTarget}
        />
      </View>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Public export — hero background
// ---------------------------------------------------------------------------
export function SignalField() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    // Exact same fallback as ShaderCanvas (HERO-01)
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_rgba(255,69,0,0.12)_0%,_transparent_60%)]"
        aria-hidden="true"
      />
    )
  }

  return <SignalFieldViewWithScroll />
}
