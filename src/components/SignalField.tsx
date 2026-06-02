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
 *  - Reduced-motion: static radial-gradient fallback (HERO-01)
 *  - grainEnabled from context: button stays functional; no visual effect on field
 *    (grain toggle does NOT affect this field — keeping scope minimal)
 */

import { useRef, useEffect, useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import { View, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '@/lib/gsap'
import { durations } from '@/lib/motion'
import { useTunerContext } from '@/components/tuner/TunerContext'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const FIELD_W = 12.0
const FIELD_H = 6.0
const CAMERA_Z_DEFAULT = 6
const CAMERA_Z_SCROLLED = 10

// Adaptive particle budget — lighter on mobile / low-core devices since the
// hero (and its tuner) now render on every breakpoint. Computed once on the
// client; SSR falls back to the desktop count (the field is client-only via
// the View and never server-rendered, so there's no hydration mismatch).
function getParticleCount(): number {
  if (typeof window === 'undefined') return 6000
  const lowPower =
    window.matchMedia('(max-width: 768px)').matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4
  return lowPower ? 3000 : 6000
}

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
  // Scale point size with wave amplitude: bigger at constructive peaks,
  // tiny at destructive nulls. This reinforces the pattern visually.
  float amp = abs(wavePos.z) / 0.5; // 0 at null, ~1 at peak
  float ampScale = 0.4 + amp * 2.0;
  float basePx = 9.0 * uPixelRatio;
  float distScale = 6.0 / max(-mvPos.z, 0.5);
  gl_PointSize = clamp(basePx * distScale * ampScale, 2.0, 22.0);
  gl_Position = projectionMatrix * mvPos;
}
`

const fragmentShader = `
uniform float uTune;
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

  // KEY: alpha driven by |waveHeight| — nulls vanish, peaks blaze.
  // This makes the interference pattern visible as bright/dark bands.
  float waveVis = smoothstep(0.0, 0.22, abs(vHeight));
  float softDisk = 1.0 - smoothstep(0.15, 0.25, r);
  // Knob ceiling: detuned dims toward a low floor, locked blazes full.
  float tuneGain = mix(0.25, 1.0, uTune);
  float alpha = edgeFade * waveVis * softDisk * tuneGain;
  alpha = clamp(alpha, 0.0, 1.0);

  // Peaks get extra brightness — white-orange glow at constructive zones
  float brightness = (0.5 + 0.5 * smoothstep(0.1, 0.4, abs(vHeight))) * tuneGain;
  vec3 col = mix(colDark, waveColor * brightness, edgeFade);

  if (alpha < 0.01) discard;
  gl_FragColor = vec4(col, alpha);
}
`

// ---------------------------------------------------------------------------
// Wave plane shaders — continuous glow bands showing interference pattern
// ---------------------------------------------------------------------------
const wavePlaneVertexShader = `
varying vec2 vWorld;
void main() {
  vWorld = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const wavePlaneFragmentShader = `
#define FIELD_W 12.0
#define FIELD_H  6.0
uniform float uTime;
uniform float uDisperse;
uniform float uTune;
varying vec2 vWorld;

void main() {
  vec2 srcA = vec2(-FIELD_W * 0.5, 0.0);
  vec2 srcB = vec2( FIELD_W * 0.5, 0.0);
  float dA = distance(vWorld, srcA);
  float dB = distance(vWorld, srcB);
  float wA = sin(dA * 2.0 - uTime * 1.8);
  float wB = sin(dB * 2.0 + uTime * 1.4);
  float wave = (wA + wB) * 0.5; // -1..1

  // pow(2.8) sharpens falloff: peaks bright, nulls true-black
  float glow = pow(abs(wave), 2.8) * 1.1;

  vec3 colOrange  = vec3(1.0, 0.271, 0.0);
  vec3 colCrimson = vec3(0.753, 0.0, 0.102);
  float h = clamp(wave * 0.5 + 0.5, 0.0, 1.0);
  vec3 waveColor = mix(colCrimson, colOrange, h);

  // Warm-white hot core at strongest constructive zones — only blooms
  // when the knob is near lock (scaled by uTune).
  float hotCore = smoothstep(0.7, 1.0, abs(wave)) * 0.45 * uTune;
  vec3 col = mix(waveColor, vec3(1.0, 0.78, 0.45), hotCore);

  // Tight edge fade — glow stays in center, black at borders
  float normX = abs(vWorld.x) / (FIELD_W * 0.5);
  float normY = abs(vWorld.y) / (FIELD_H * 0.5);
  float edgeFade = 1.0 - smoothstep(0.38, 0.85, max(normX, normY));

  // Disperse on scroll; converge opacity handled by parent div
  float visibility = clamp(1.0 - uDisperse * 1.5, 0.0, 1.0);

  // Auto-pulse: slow breathing envelope so the beams swell and fade on a loop
  // with zero interaction. Knob sets the ceiling (uTune); a low floor keeps the
  // field alive even fully detuned.
  float breath = 0.78 + 0.22 * sin(uTime * 0.6);
  float tuneGain = mix(0.2, 1.0, uTune);

  float alpha = glow * edgeFade * visibility * breath * tuneGain;
  gl_FragColor = vec4(col, alpha);
}
`

// ---------------------------------------------------------------------------
// Geometry helpers — stable across renders
// ---------------------------------------------------------------------------
function makeWavePositions(particleCount: number): Float32Array {
  // Rejection-sample XY positions weighted by wave amplitude at t=0.
  // More particles cluster at constructive interference zones → XY density
  // shows the wave band pattern as a 2D projection (Z displacement is invisible
  // from the camera, but XY clustering is visible). As uTime evolves, alpha-by-
  // waveheight makes bands pulsate in brightness.
  const srcAx = -FIELD_W * 0.5
  const srcBx =  FIELD_W * 0.5

  const pos = new Float32Array(particleCount * 3)
  let idx = 0
  let count = 0

  // Bounded rejection-sample: cap at 15 attempts/particle, fill remaining
  // positions uniformly so the loop never hangs on a slow device.
  const MAX_ATTEMPTS = particleCount * 15
  let attempts = 0
  while (count < particleCount && attempts < MAX_ATTEMPTS) {
    attempts++
    const x = (Math.random() - 0.5) * FIELD_W
    const y = (Math.random() - 0.5) * FIELD_H
    const dA = Math.sqrt((x - srcAx) ** 2 + y * y)
    const dB = Math.sqrt((x - srcBx) ** 2 + y * y)
    const wA = Math.sin(dA * 2.0)
    const wB = Math.sin(dB * 2.0)
    const amp = Math.abs((wA + wB) * 0.25) // 0..0.5
    // Accept probability: base 0.08 (sparse at nulls) + heavy weight at peaks
    if (Math.random() < Math.min(0.08 + amp * 3.6, 1.0)) {
      pos[idx++] = x
      pos[idx++] = y
      pos[idx++] = 0
      count++
    }
  }
  // Fill any remaining slots uniformly (only hit if acceptance rate is
  // abnormally low — keeps the loop O(particleCount * 15) worst case)
  while (count < particleCount) {
    pos[idx++] = (Math.random() - 0.5) * FIELD_W
    pos[idx++] = (Math.random() - 0.5) * FIELD_H
    pos[idx++] = 0
    count++
  }
  return pos
}

function makeRandomPositions(particleCount: number): Float32Array {
  const pos = new Float32Array(particleCount * 3)
  let idx = 0
  for (let i = 0; i < particleCount; i++) {
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
  const { invalidate, camera } = useThree()
  const { tuneRef } = useTunerContext()

  const uniforms = useRef({
    uTime:       { value: 0 } as THREE.IUniform<number>,
    uConverge:   { value: 0 } as THREE.IUniform<number>,
    uDisperse:   { value: 0 } as THREE.IUniform<number>,
    uTune:       { value: 0 } as THREE.IUniform<number>,
    uMouse:      { value: new THREE.Vector2(0, 0) } as THREE.IUniform<THREE.Vector2>,
    uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) } as THREE.IUniform<number>,
  })

  const { positions, randomPositions } = useMemo(() => {
    const count = getParticleCount()
    return {
      positions: makeWavePositions(count),
      randomPositions: makeRandomPositions(count),
    }
  }, [])

  const mountTime = useRef<number | null>(null)
  const lerpedMouse = useRef(new THREE.Vector2(0, 0))
  const ptsRef = useRef<THREE.Points>(null)

  // Pixel ratio: update on resize (changes when moving window to a different
  // display). Reading gl.getPixelRatio() every frame is wasteful — it only
  // changes ~once per session. Resize is the closest available trigger.
  useEffect(() => {
    const update = () => {
      uniforms.current.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Offscreen-pause observer — just toggles the visibility flag.
  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        isHeroVisible.current = entry.isIntersecting
      },
      { threshold: 0 }
    )
    obs.observe(hero)
    return () => obs.disconnect()
  }, [])

  // Keep-alive ticker — the field must animate on its own, with no interaction.
  // A dedicated rAF (not useFrame's self-invalidate) drives the demand loop so
  // it CANNOT stall: it always runs, invalidating only while the hero is
  // visible, and resumes automatically on re-entry. Previously the per-frame
  // early-return could break the invalidate chain, leaving pointer events as
  // the only thing stepping frames (the field appeared to react to clicks).
  useEffect(() => {
    let raf = 0
    const tick = () => {
      if (isHeroVisible.current) invalidate()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [invalidate])

  useFrame(({ clock }) => {
    if (!isHeroVisible.current) return

    const t = clock.getElapsedTime()
    const u = uniforms.current

    // Converge animation — easeOutCubic, runs once from mount
    if (mountTime.current === null) mountTime.current = t
    const elapsed = t - mountTime.current
    const raw = Math.min(elapsed / durations.heroConverge, 1)
    u.uConverge.value = 1 - Math.pow(1 - raw, 3)

    // Scroll-driven disperse + camera pull-back
    const sp = isNaN(scrollProgress.current) ? 0 : scrollProgress.current
    u.uDisperse.value = sp
    camera.position.z = CAMERA_Z_DEFAULT + sp * (CAMERA_Z_SCROLLED - CAMERA_Z_DEFAULT)

    // Mouse parallax — lerp for smoothness
    lerpedMouse.current.x += (mouseTarget.current.x - lerpedMouse.current.x) * 0.06
    lerpedMouse.current.y += (mouseTarget.current.y - lerpedMouse.current.y) * 0.06
    u.uMouse.value.copy(lerpedMouse.current)

    // Knob → field intensity ceiling. Smoothed for a gentle settle (clarity is
    // already eased in useTuner, this just avoids any micro-steps).
    u.uTune.value += (tuneRef.current - u.uTune.value) * 0.12

    u.uTime.value = t
    // Frame scheduling is owned by the keep-alive ticker effect above.
  })

  return (
    <>
      {/* Wave glow plane — renders continuous interference bands behind particles */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[FIELD_W * 1.4, FIELD_H * 1.8, 1, 1]} />
        <shaderMaterial
          vertexShader={wavePlaneVertexShader}
          fragmentShader={wavePlaneFragmentShader}
          uniforms={{
            uTime:     uniforms.current.uTime,
            uDisperse: uniforms.current.uDisperse,
            uTune:     uniforms.current.uTune,
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Particles — ambient depth texture floating above wave plane */}
      <points ref={ptsRef}>
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
    </>
  )
}

// ---------------------------------------------------------------------------
// View wrapper + scroll / mouse / intersection logic
// ---------------------------------------------------------------------------
function SignalFieldViewWithScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
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
      {/*
        drei <View> in the DOM tree renders its OWN tracked element from the
        style/className passed here, then portals the scene into R3FRoot's
        <View.Port/>. Do NOT pass a `track` ref + separate div — the HtmlView
        path ignores `track` and would render a 0-size, invisible view.
      */}
      <View style={{ width: '100%', height: '100%' }}>
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
  // useReducedMotion() handles SSR (returns undefined → falsy → no fallback),
  // subscribes to OS preference changes, and avoids hydration mismatch.
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    // Static radial-gradient fallback (HERO-01)
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_rgba(255,69,0,0.12)_0%,_transparent_60%)]"
        aria-hidden="true"
      />
    )
  }

  return <SignalFieldViewWithScroll />
}
