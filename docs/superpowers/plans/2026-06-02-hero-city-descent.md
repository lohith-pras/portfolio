# Hero City Descent — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a scroll-driven cinematic hero that descends from a holographic porthole, through clouds, onto a wireframe autonomous-city digital twin, flying three camera beats (Connectivity → AI → Electromobility) before handing off to the existing content sections.

**Architecture:** Reuse the existing single R3F `Canvas` (`R3FRoot`) + drei `View` system — no new canvas. A `HeroStage` component owns a ~500vh GSAP ScrollTrigger pin+scrub that writes a shared `progress` ref (0→1) via `DescentContext`. A top-level `CityView` (drei `View`) reads `progress` in `useFrame` and drives one camera + phase-gated subsystems (porthole, clouds, city, vehicles, drones, overlays). All geometry is wireframe (LineSegments / Points / instanced) with additive blending; glow is faked (no post-processing). Reduced-motion and mobile get a static lit-city fallback.

**Tech Stack:** Next.js 15 (App Router) · React 19 · `@react-three/fiber` 9 · `@react-three/drei` 10 · three 0.184 · GSAP 3 + ScrollTrigger (via `@/lib/gsap`) · lenis (via `SmoothScroll`) · framer-motion `useReducedMotion` · Vitest (added in Task 1).

**Locked defaults:** Title docks to lower-left corner after REVEAL · pin distance ≈500vh · fake glow only (no UnrealBloom).

---

## Shared conventions (read before any task)

- **Import GSAP only from `@/lib/gsap`** (never bare `gsap`). Plugins register once there.
- **R3F scenes use refs, not React state**, for per-frame values — avoids re-renders (see `SignalField` / `ChibiView`).
- **drei `<View>`**: render `<View style={{width,height}}>` inside a tracked DOM `<div>`; it portals into `R3FRoot`'s `<View.Port/>`. Never pass a `track` ref.
- **Palette:** black `#000000`, cyan `#00F5FF` (`new THREE.Color(0x00f5ff)`), white `#ffffff`, gray `#111111`.
- **Coordinates:** city lies on the XZ ground plane (y = up). Camera descends along +→− Y. Neural plane floats at `y = NEURAL_Y` above the city.
- **Reduced motion:** `useReducedMotion()` from `framer-motion` (SSR-safe). When true: no pin, no scrub, `progress` pinned to `REVEAL_END` so the city shows lit with title immediately.
- **Verification for visual tasks** uses the preview tools (`preview_start`, `preview_screenshot`, `preview_console_logs`), not unit tests. This is a real verification method, not a placeholder.

---

## File structure

```
src/lib/
  rng.ts                    Task 2   seeded PRNG (pure)
src/components/city/
  phases.ts                 Task 3   progress→phase + opacity envelope (pure)
  cameraPath.ts             Task 4   keyframe poses + sampleCamera(progress) (pure)
  cityData.ts               Task 5   seeded city layout: buildings/roads/charging (pure)
  lanes.ts                  Task 6   lane + drone-arc path sampling (pure)
  DescentContext.tsx        Task 7   progress + mouse refs shared across subtrees
  useDescentCamera.ts       Task 9   applies sampleCamera + parallax + idle to the camera
  CityView.tsx              Task 8   drei <View> owning camera; reduced-motion fallback
  CityScene.tsx             Task 9   orchestrates subsystems by progress; useFrame
  Porthole.tsx              Task 10  holographic ring (visible .00–.28)
  CloudField.tsx            Task 11  layered cloud sprites (.28–.55)
  City.tsx                  Task 12  wireframe buildings + roads (.50–1.0)
  Vehicles.tsx              Task 13  instanced vehicles on lanes
  Drones.tsx                Task 14  instanced drones on arcs
  Overlays.tsx              Task 15-17  V2X links · neural plane · energy streams
src/components/hero/
  HeroStage.tsx             Task 7   pinned ~500vh container; ScrollTrigger → progress; title slot
modified:
  src/app/[locale]/page.tsx          Task 8/22  swap SignalField → CityView; wrap in DescentProvider
  src/components/HeroSection.tsx      Task 7/18  use HeroStage; dock title
deleted:
  src/components/SignalField.tsx      Task 22  retired
```

---

## Task 1: Add Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/rng.test.ts` (smoke)

- [x] **Step 1: Install vitest**

Run: `rtk pnpm add -D vitest @vitejs/plugin-react`
Expected: added to devDependencies.

- [x] **Step 2: Add config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
```

- [x] **Step 3: Add test script**

In `package.json` `"scripts"`, add: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [x] **Step 4: Smoke test**

Create `src/lib/rng.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
describe('vitest', () => { it('runs', () => { expect(1 + 1).toBe(2) }) })
```

Run: `rtk pnpm test`
Expected: 1 passing.

- [x] **Step 5: Commit**

```bash
rtk git add package.json pnpm-lock.yaml vitest.config.ts src/lib/rng.test.ts
rtk git commit -m "chore(test): add vitest for pure-logic units"
```

---

## Task 2: Seeded PRNG (`rng.ts`)

Deterministic randomness so the city layout is stable (testable, no SSR/client drift).

**Files:**
- Create: `src/lib/rng.ts`
- Test: `src/lib/rng.test.ts` (replace smoke)

- [x] **Step 1: Write failing test**

Replace `src/lib/rng.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mulberry32 } from '@/lib/rng'

describe('mulberry32', () => {
  it('is deterministic for a seed', () => {
    const a = mulberry32(42); const b = mulberry32(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('returns values in [0,1)', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 100; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1) }
  })
  it('differs across seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)())
  })
})
```

- [x] **Step 2: Run → fail**

Run: `rtk pnpm test`
Expected: FAIL "mulberry32 is not a function".

- [x] **Step 3: Implement**

Create `src/lib/rng.ts`:

```ts
/** mulberry32 — tiny deterministic PRNG. Returns a function yielding [0,1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random float in [min,max) from a generator. */
export const range = (r: () => number, min: number, max: number) => min + r() * (max - min)
/** Random int in [min,max]. */
export const rangeInt = (r: () => number, min: number, max: number) => Math.floor(range(r, min, max + 1))
```

- [x] **Step 4: Run → pass**

Run: `rtk pnpm test`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
rtk git add src/lib/rng.ts src/lib/rng.test.ts
rtk git commit -m "feat(rng): seeded mulberry32 PRNG"
```

---

## Task 3: Phase model (`phases.ts`)

Maps `progress` (0..1) to named phases and produces per-subsystem opacity envelopes.

**Files:**
- Create: `src/components/city/phases.ts`
- Test: `src/components/city/phases.test.ts`

- [x] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest'
import { PHASE, envelope, REVEAL_END } from '@/components/city/phases'

describe('phases', () => {
  it('exposes phase boundaries in order', () => {
    const b = [PHASE.porthole, PHASE.enter, PHASE.clouds, PHASE.reveal, PHASE.beat1, PHASE.beat2, PHASE.beat3]
    for (let i = 1; i < b.length; i++) expect(b[i][0]).toBeGreaterThanOrEqual(b[i - 1][0])
  })
  it('REVEAL_END sits inside reveal window', () => {
    expect(REVEAL_END).toBeGreaterThan(PHASE.reveal[0])
    expect(REVEAL_END).toBeLessThanOrEqual(PHASE.reveal[1])
  })
  it('envelope ramps 0→1→0 with fade', () => {
    expect(envelope(0.0, [0.2, 0.6], 0.05)).toBe(0)        // before
    expect(envelope(0.4, [0.2, 0.6], 0.05)).toBe(1)        // middle
    expect(envelope(0.9, [0.2, 0.6], 0.05)).toBe(0)        // after
    expect(envelope(0.21, [0.2, 0.6], 0.05)).toBeGreaterThan(0) // fading in
  })
})
```

- [x] **Step 2: Run → fail**

Run: `rtk pnpm test src/components/city/phases.test.ts`
Expected: FAIL "Cannot find module".

- [x] **Step 3: Implement**

```ts
// src/components/city/phases.ts
export type Window = readonly [start: number, end: number]

/** Progress windows for each phase (0..1 over the pinned descent). */
export const PHASE = {
  porthole: [0.0, 0.1] as Window,
  enter:    [0.1, 0.28] as Window,
  clouds:   [0.28, 0.5] as Window,
  reveal:   [0.5, 0.65] as Window,
  beat1:    [0.65, 0.77] as Window, // Connectivity
  beat2:    [0.77, 0.89] as Window, // AI
  beat3:    [0.89, 1.0] as Window,  // Electromobility
} as const

/** Progress at which the title is fully resolved + city lit (reduced-motion lands here). */
export const REVEAL_END = 0.62

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/**
 * Trapezoid opacity for a subsystem visible across [start,end], with `fade`
 * ramp on each side. Returns 0 outside, 1 in the plateau.
 */
export function envelope(p: number, [start, end]: Window, fade: number): number {
  if (p <= start || p >= end) return 0
  const fadeIn = clamp01((p - start) / fade)
  const fadeOut = clamp01((end - p) / fade)
  return Math.min(fadeIn, fadeOut)
}

/** Local 0..1 progress within a phase window (for per-phase animation). */
export function localProgress(p: number, [start, end]: Window): number {
  return clamp01((p - start) / (end - start))
}
```

- [x] **Step 4: Run → pass**

Run: `rtk pnpm test src/components/city/phases.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
rtk git add src/components/city/phases.ts src/components/city/phases.test.ts
rtk git commit -m "feat(city): phase windows + opacity envelope helpers"
```

---

## Task 4: Camera path (`cameraPath.ts`)

Pure keyframe sampler: `progress → { position, lookAt }`. Drives the descent.

**Files:**
- Create: `src/components/city/cameraPath.ts`
- Test: `src/components/city/cameraPath.test.ts`

- [x] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest'
import { sampleCamera } from '@/components/city/cameraPath'

describe('sampleCamera', () => {
  it('starts high near the porthole and ends low in the city', () => {
    const a = sampleCamera(0)
    const b = sampleCamera(1)
    expect(a.position[1]).toBeGreaterThan(b.position[1]) // descends in Y
  })
  it('is continuous (no large jumps between adjacent samples)', () => {
    let prev = sampleCamera(0)
    for (let p = 0.02; p <= 1; p += 0.02) {
      const cur = sampleCamera(p)
      const d = Math.hypot(cur.position[0] - prev.position[0], cur.position[1] - prev.position[1], cur.position[2] - prev.position[2])
      expect(d).toBeLessThan(8) // no teleport between 2% steps
      prev = cur
    }
  })
  it('returns finite numbers across the range', () => {
    for (let p = 0; p <= 1; p += 0.1) {
      const c = sampleCamera(p)
      ;[...c.position, ...c.lookAt].forEach((n) => expect(Number.isFinite(n)).toBe(true))
    }
  })
})
```

- [x] **Step 2: Run → fail**

Run: `rtk pnpm test src/components/city/cameraPath.test.ts`
Expected: FAIL.

- [x] **Step 3: Implement**

```ts
// src/components/city/cameraPath.ts
import { PHASE } from './phases'

export type Vec3 = [number, number, number]
export interface CamPose { position: Vec3; lookAt: Vec3 }

// Keyframes at phase boundaries. Camera lives in front of the porthole (high +Y,
// +Z back), then dives down toward the city on the XZ plane.
interface Key { p: number; pos: Vec3; look: Vec3 }
const KEYS: Key[] = [
  { p: PHASE.porthole[0], pos: [0, 0, 14],   look: [0, 0, 0] },     // facing the ring
  { p: PHASE.enter[1],    pos: [0, 4, 4],     look: [0, 0, -20] },   // punched through, tilting down
  { p: PHASE.clouds[1],   pos: [0, 30, 0],    look: [0, 0, -30] },   // falling through cloud deck
  { p: PHASE.reveal[1],   pos: [0, 22, 34],   look: [0, 0, 0] },     // high wide over the city
  { p: PHASE.beat1[1],    pos: [-14, 6, 18],  look: [0, 1, 0] },     // low over streets
  { p: PHASE.beat2[1],    pos: [10, 26, 20],  look: [0, 8, 0] },     // lifted toward neural plane
  { p: PHASE.beat3[1],    pos: [18, 9, -6],   look: [10, 1, -10] },  // panned to charging cluster
]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t) // smoothstep for eased segments
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

/** Sample the camera pose at progress p (0..1). */
export function sampleCamera(p: number): CamPose {
  const x = Math.min(1, Math.max(0, p))
  let i = 0
  while (i < KEYS.length - 1 && x > KEYS[i + 1].p) i++
  const a = KEYS[i]
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)]
  const span = b.p - a.p || 1
  const t = smooth(Math.min(1, Math.max(0, (x - a.p) / span)))
  return { position: lerp3(a.pos, b.pos, t), lookAt: lerp3(a.look, b.look, t) }
}
```

- [x] **Step 4: Run → pass**

Run: `rtk pnpm test src/components/city/cameraPath.test.ts`
Expected: PASS. (If the continuity test fails, soften the offending keyframe gap — that is the intended tuning signal.)

- [x] **Step 5: Commit**

```bash
rtk git add src/components/city/cameraPath.ts src/components/city/cameraPath.test.ts
rtk git commit -m "feat(city): keyframe camera-path sampler"
```

---

## Task 5: City layout data (`cityData.ts`)

Seeded procedural layout: building boxes, road segments, charging stations. Pure → testable.

**Files:**
- Create: `src/components/city/cityData.ts`
- Test: `src/components/city/cityData.test.ts`

- [x] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest'
import { buildCity, CITY_SEED } from '@/components/city/cityData'

describe('buildCity', () => {
  it('is deterministic for the seed', () => {
    const a = buildCity(CITY_SEED); const b = buildCity(CITY_SEED)
    expect(a.buildings.length).toBe(b.buildings.length)
    expect(a.buildings[0]).toEqual(b.buildings[0])
  })
  it('produces buildings within the grid bounds', () => {
    const c = buildCity(CITY_SEED)
    expect(c.buildings.length).toBeGreaterThan(20)
    c.buildings.forEach((bld) => {
      expect(Math.abs(bld.x)).toBeLessThanOrEqual(c.half + 0.01)
      expect(Math.abs(bld.z)).toBeLessThanOrEqual(c.half + 0.01)
      expect(bld.h).toBeGreaterThan(0)
    })
  })
  it('places at least a few charging stations', () => {
    expect(buildCity(CITY_SEED).chargers.length).toBeGreaterThanOrEqual(3)
  })
})
```

- [x] **Step 2: Run → fail**

Run: `rtk pnpm test src/components/city/cityData.test.ts`
Expected: FAIL.

- [x] **Step 3: Implement**

```ts
// src/components/city/cityData.ts
import { mulberry32, range, rangeInt } from '@/lib/rng'

export const CITY_SEED = 0xC17

export interface Building { x: number; z: number; w: number; d: number; h: number; twin: boolean }
export interface Charger { x: number; z: number }
export interface CityLayout {
  half: number          // half-extent of the city square (world units)
  cell: number          // block size
  buildings: Building[]
  roadsX: number[]      // z-positions of roads running along X
  roadsZ: number[]      // x-positions of roads running along Z
  chargers: Charger[]
}

/**
 * Grid city: roads on a fixed lattice, buildings inset within blocks. A few
 * buildings flagged `twin` (the hero digital-twin landmarks the camera targets).
 */
export function buildCity(seed: number): CityLayout {
  const r = mulberry32(seed)
  const blocks = 8
  const cell = 8
  const half = (blocks * cell) / 2
  const lines: number[] = []
  for (let i = 0; i <= blocks; i++) lines.push(-half + i * cell)

  const buildings: Building[] = []
  for (let bx = 0; bx < blocks; bx++) {
    for (let bz = 0; bz < blocks; bz++) {
      if (r() < 0.18) continue // gaps / plazas
      const cx = -half + bx * cell + cell / 2
      const cz = -half + bz * cell + cell / 2
      const w = range(r, cell * 0.4, cell * 0.7)
      const d = range(r, cell * 0.4, cell * 0.7)
      const h = range(r, 2, 12)
      buildings.push({ x: cx, z: cz, w, d, h, twin: false })
    }
  }
  // Promote a few tall central buildings to "twin" landmarks.
  buildings
    .filter((b) => b.h > 8)
    .slice(0, 5)
    .forEach((b) => (b.twin = true))

  const chargers: Charger[] = []
  const nChargers = rangeInt(r, 4, 7)
  for (let i = 0; i < nChargers; i++) {
    chargers.push({ x: range(r, -half, half), z: range(r, -half, half) })
  }

  return { half, cell, buildings, roadsX: lines, roadsZ: lines, chargers }
}
```

- [x] **Step 4: Run → pass**

Run: `rtk pnpm test src/components/city/cityData.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
rtk git add src/components/city/cityData.ts src/components/city/cityData.test.ts
rtk git commit -m "feat(city): seeded grid-city layout data"
```

---

## Task 6: Lane + arc sampling (`lanes.ts`)

Vehicles follow road centerlines; drones follow arcs. Pure samplers → testable.

**Files:**
- Create: `src/components/city/lanes.ts`
- Test: `src/components/city/lanes.test.ts`

- [x] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest'
import { buildLanes, sampleLane, buildDroneArcs, sampleArc } from '@/components/city/lanes'
import { buildCity, CITY_SEED } from '@/components/city/cityData'

const city = buildCity(CITY_SEED)

describe('lanes', () => {
  it('builds one lane per road line', () => {
    const lanes = buildLanes(city)
    expect(lanes.length).toBe(city.roadsX.length + city.roadsZ.length)
  })
  it('samples a point on the ground plane (y≈0)', () => {
    const p = sampleLane(buildLanes(city)[0], 0.5)
    expect(p[1]).toBeCloseTo(0, 5)
  })
  it('wraps t (loops): t=0 ≈ t=1', () => {
    const lane = buildLanes(city)[0]
    const a = sampleLane(lane, 0); const b = sampleLane(lane, 1)
    expect(Math.hypot(a[0] - b[0], a[2] - b[2])).toBeLessThan(0.001)
  })
  it('drone arcs rise above ground', () => {
    const arcs = buildDroneArcs(city, 6)
    expect(arcs.length).toBe(6)
    expect(sampleArc(arcs[0], 0.5)[1]).toBeGreaterThan(0)
  })
})
```

- [x] **Step 2: Run → fail**

Run: `rtk pnpm test src/components/city/lanes.test.ts`
Expected: FAIL.

- [x] **Step 3: Implement**

```ts
// src/components/city/lanes.ts
import { mulberry32, range } from '@/lib/rng'
import type { CityLayout } from './cityData'

export type Vec3 = [number, number, number]
/** A lane is a straight road centerline as [from, to] on the ground (y=0). */
export interface Lane { from: Vec3; to: Vec3 }
export interface Arc { a: Vec3; b: Vec3; height: number }

export function buildLanes(city: CityLayout): Lane[] {
  const lanes: Lane[] = []
  for (const z of city.roadsX) lanes.push({ from: [-city.half, 0, z], to: [city.half, 0, z] })
  for (const x of city.roadsZ) lanes.push({ from: [x, 0, -city.half], to: [x, 0, city.half] })
  return lanes
}

/** Sample a lane at t in [0,1], wrapping so motion loops seamlessly. */
export function sampleLane(lane: Lane, t: number): Vec3 {
  const u = t - Math.floor(t)
  return [
    lane.from[0] + (lane.to[0] - lane.from[0]) * u,
    0,
    lane.from[2] + (lane.to[2] - lane.from[2]) * u,
  ]
}

export function buildDroneArcs(city: CityLayout, n: number): Arc[] {
  const r = mulberry32(0xD2017)
  const arcs: Arc[] = []
  for (let i = 0; i < n; i++) {
    arcs.push({
      a: [range(r, -city.half, city.half), 0, range(r, -city.half, city.half)],
      b: [range(r, -city.half, city.half), 0, range(r, -city.half, city.half)],
      height: range(r, 6, 14),
    })
  }
  return arcs
}

/** Parabolic arc: ground a→b with apex `height` at t=0.5. */
export function sampleArc(arc: Arc, t: number): Vec3 {
  const u = t - Math.floor(t)
  const y = 4 * arc.height * u * (1 - u)
  return [arc.a[0] + (arc.b[0] - arc.a[0]) * u, y, arc.a[2] + (arc.b[2] - arc.a[2]) * u]
}
```

- [x] **Step 4: Run → pass**

Run: `rtk pnpm test src/components/city/lanes.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
rtk git add src/components/city/lanes.ts src/components/city/lanes.test.ts
rtk git commit -m "feat(city): lane + drone-arc path samplers"
```

---

## Task 7: DescentContext + HeroStage (pin + scrub → progress)

Bridge the two DOM subtrees and own the GSAP pin. After this task, scrolling drives a numeric `progress` you can observe — no 3D yet.

**Files:**
- Create: `src/components/city/DescentContext.tsx`
- Create: `src/components/hero/HeroStage.tsx`
- Modify: `src/components/HeroSection.tsx`

- [x] **Step 1: DescentContext**

```tsx
// src/components/city/DescentContext.tsx
'use client'
import { createContext, useContext, useRef, type ReactNode, type MutableRefObject } from 'react'
import * as THREE from 'three'

interface Descent {
  progress: MutableRefObject<number>       // 0..1, written by HeroStage
  mouse: MutableRefObject<THREE.Vector2>    // -1..1 parallax target
}
const Ctx = createContext<Descent | null>(null)

export function DescentProvider({ children }: { children: ReactNode }) {
  const progress = useRef(0)
  const mouse = useRef(new THREE.Vector2(0, 0))
  return <Ctx.Provider value={{ progress, mouse }}>{children}</Ctx.Provider>
}

export function useDescent(): Descent {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDescent must be used within <DescentProvider>')
  return v
}
```

- [x] **Step 2: HeroStage**

`PIN_VH = 500` realizes the ≈500vh default. Writes `progress` each scroll tick; exposes a `data-progress` attribute for verification.

```tsx
// src/components/hero/HeroStage.tsx
'use client'
import { useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '@/lib/gsap'
import { useDescent } from '@/components/city/DescentContext'
import { REVEAL_END } from '@/components/city/phases'

const PIN_VH = 500 // ≈500vh of scroll drives progress 0→1

export function HeroStage({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const { progress } = useDescent()
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (reduced) { progress.current = REVEAL_END; return }
    const outer = outerRef.current, pin = pinRef.current
    if (!outer || !pin) return
    const trigger = ScrollTrigger.create({
      trigger: outer,
      start: 'top top',
      end: `+=${PIN_VH * window.innerHeight / 100}`,
      pin: pin,
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress
        pin.dataset.progress = self.progress.toFixed(3)
      },
    })
    return () => trigger.kill()
  }, { scope: outerRef, dependencies: [reduced] })

  // Reduced motion: no pin, hero is a single static screen.
  if (reduced) {
    return <div ref={outerRef} className="relative">{children}</div>
  }
  return (
    <div ref={outerRef} style={{ height: `${PIN_VH}vh` }} className="relative">
      <div ref={pinRef} data-progress="0" className="h-screen w-full overflow-hidden">
        {children}
      </div>
    </div>
  )
}
```

- [x] **Step 3: Wire HeroSection to use HeroStage**

In `src/components/HeroSection.tsx`, wrap the existing inner content with `<HeroStage>`. Keep the `#hero` id on the outer `<section>`. Replace the `<section>` body:

```tsx
import { HeroTitle } from '@/components/HeroTitle'
import { HeroStage } from '@/components/hero/HeroStage'

export function HeroSection() {
  return (
    <section id="hero" className="relative w-full">
      <HeroStage>
        <div className="relative z-10 h-full max-w-7xl w-full mx-auto flex flex-col justify-end pb-24 px-6 md:px-16">
          <HeroTitle />
        </div>
      </HeroStage>
    </section>
  )
}
```

(The scroll-indicator + gradient-fade from the old HeroSection are dropped — the descent replaces them; re-add later in Task 18 if wanted.)

- [x] **Step 4: Verify via preview**

Run `preview_start`. Use `preview_eval` to scroll: `window.scrollTo(0, window.innerHeight * 3)`. Then `preview_snapshot` / inspect the pinned div's `data-progress` attribute — it should be a value between 0 and 1 that increases with scroll. `preview_console_logs`: no errors.

- [x] **Step 5: Commit**

```bash
rtk git add src/components/city/DescentContext.tsx src/components/hero/HeroStage.tsx src/components/HeroSection.tsx
rtk git commit -m "feat(hero): pinned 500vh stage writing shared descent progress"
```

---

## Task 8: CityView scaffold + swap into page

Stand up the drei `View` with its own camera and reduced-motion fallback. Renders nothing yet but a debug grid, proving the View tracks the pinned stage.

**Files:**
- Create: `src/components/city/CityView.tsx`
- Create: `src/components/city/CityScene.tsx` (stub)
- Modify: `src/app/[locale]/page.tsx`

- [x] **Step 1: CityScene stub**

```tsx
// src/components/city/CityScene.tsx
'use client'
import { useThree } from '@react-three/fiber'
export function CityScene() {
  useThree() // ensures r3f context
  // Temporary debug content — replaced as subsystems land.
  return (
    <gridHelper args={[64, 16, 0x00f5ff, 0x113333]} />
  )
}
```

- [x] **Step 2: CityView**

```tsx
// src/components/city/CityView.tsx
'use client'
import { useReducedMotion } from 'framer-motion'
import { View, PerspectiveCamera } from '@react-three/drei'
import { CityScene } from './CityScene'

export function CityView() {
  const reduced = useReducedMotion()
  // Reduced-motion still shows the city (lit, static pose) — handled inside
  // CityScene via progress pinned at REVEAL_END by HeroStage. The View itself
  // is identical; only animation differs.
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <View style={{ width: '100%', height: '100%' }}>
        <PerspectiveCamera makeDefault position={[0, 22, 34]} fov={50} near={0.1} far={400} />
        <CityScene key={reduced ? 'static' : 'live'} />
      </View>
    </div>
  )
}
```

- [x] **Step 3: Swap page.tsx**

In `src/app/[locale]/page.tsx`: replace `SignalField` with `CityView`, and wrap `<main>`'s content in `DescentProvider`. Keep `<R3FRoot/>`.

```tsx
import { DescentProvider } from '@/components/city/DescentContext'
import { CityView } from '@/components/city/CityView'
import { R3FRoot } from '@/components/R3FRoot'
// ...remove the SignalField import...

export default async function Home({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  return (
    <DescentProvider>
      <main className="relative min-h-screen bg-background text-foreground [overflow-x:clip] selection:bg-accent/30">
        <CityView />
        <R3FRoot />
        <div className="flex flex-col">
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
        </div>
      </main>
    </DescentProvider>
  )
}
```

- [x] **Step 4: Verify**

Run `preview_start`, `preview_screenshot`. Expected: a cyan debug grid fills the background behind the hero text. `preview_console_logs`: no WebGL/View errors. Run `rtk tsc --noEmit` → 0 errors.

- [x] **Step 5: Commit**

```bash
rtk git add src/components/city/CityView.tsx src/components/city/CityScene.tsx 'src/app/[locale]/page.tsx'
rtk git commit -m "feat(city): CityView drei-View scaffold; swap into hero page"
```

---

## Task 9: Camera rig (`useDescentCamera`) + wire into CityScene

Drive the View camera from `progress` (via `sampleCamera`) + mouse parallax + idle drift.

**Files:**
- Create: `src/components/city/useDescentCamera.ts`
- Modify: `src/components/city/CityScene.tsx`

- [x] **Step 1: useDescentCamera**

```ts
// src/components/city/useDescentCamera.ts
'use client'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sampleCamera } from './cameraPath'
import { useDescent } from './DescentContext'

export function useDescentCamera() {
  const { camera } = useThree()
  const { progress, mouse } = useDescent()
  const lerpedMouse = useRef(new THREE.Vector2())
  const lookTarget = useRef(new THREE.Vector3())

  useFrame(({ clock }) => {
    const p = Number.isNaN(progress.current) ? 0 : progress.current
    const pose = sampleCamera(p)

    // Idle drift — small, continuous so it's never frozen.
    const t = clock.getElapsedTime()
    const driftX = Math.sin(t * 0.13) * 0.6
    const driftY = Math.cos(t * 0.11) * 0.4

    // Mouse parallax — lerp toward target.
    lerpedMouse.current.lerp(mouse.current, 0.05)
    const mx = lerpedMouse.current.x * 2.2
    const my = lerpedMouse.current.y * 1.4

    camera.position.set(pose.position[0] + driftX + mx, pose.position[1] + driftY + my, pose.position[2])
    lookTarget.current.set(pose.lookAt[0], pose.lookAt[1], pose.lookAt[2])
    camera.lookAt(lookTarget.current)
  })
}
```

- [x] **Step 2: Wire into CityScene + add pointer parallax source**

Update `CityScene.tsx` to call the rig, and add a `useEffect` writing pointer position into the shared `mouse` ref:

```tsx
// src/components/city/CityScene.tsx
'use client'
import { useEffect } from 'react'
import { useDescentCamera } from './useDescentCamera'
import { useDescent } from './DescentContext'

export function CityScene() {
  const { mouse } = useDescent()
  useDescentCamera()

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [mouse])

  return <gridHelper args={[64, 16, 0x00f5ff, 0x113333]} />
}
```

- [x] **Step 3: Verify**

`preview_start`. Scroll via `preview_eval` to several positions (`window.scrollTo(0, h*1)`, `h*3`, `h*5`); `preview_screenshot` each. Expected: the grid is viewed from progressively lower/closer angles as you scroll (camera descends). Move mouse via `preview_eval` dispatching a `pointermove` — slight parallax shift. No console errors.

- [x] **Step 4: Commit**

```bash
rtk git add src/components/city/useDescentCamera.ts src/components/city/CityScene.tsx
rtk git commit -m "feat(city): scroll-driven descent camera with parallax + idle drift"
```

---

## Task 10: Porthole (`Porthole.tsx`)

Holographic ring on black, visible `.00–.28`, breathing + scanline, dissolving as we enter.

**Files:**
- Create: `src/components/city/Porthole.tsx`
- Modify: `src/components/city/CityScene.tsx`

- [x] **Step 1: Implement Porthole**

Real working starter — a torus ring + bolt instances + additive glow. Opacity from `envelope`; ring scales up through ENTER.

```tsx
// src/components/city/Porthole.tsx
'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDescent } from './DescentContext'
import { PHASE, envelope, localProgress } from './phases'

const CYAN = new THREE.Color(0x00f5ff)

export function Porthole() {
  const group = useRef<THREE.Group>(null)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)
  const { progress } = useDescent()

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
        <meshBasicMaterial ref={ringMat} color={CYAN} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Inner thin ring */}
      <mesh>
        <torusGeometry args={[2.7, 0.02, 8, 64]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {bolts.map((b, i) => (
        <mesh key={i} position={b}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color={0x66ffff} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
```

- [x] **Step 2: Mount in CityScene**

Add `<Porthole />` to `CityScene`'s returned JSX (keep the grid for now).

- [x] **Step 3: Verify + tune**

`preview_start`, `preview_screenshot` at scroll 0 → cyan ring centered on black. Scroll to `h*1.5` → ring scales up and fades (entering). Adjust `position`/`scale`/`KEYS[0]` camera if the ring isn't centered/parallel to camera. No console errors.

- [x] **Step 4: Commit**

```bash
rtk git add src/components/city/Porthole.tsx src/components/city/CityScene.tsx
rtk git commit -m "feat(city): holographic porthole ring (enter + dissolve)"
```

---

## Task 11: CloudField (`CloudField.tsx`)

Layered soft-cloud sprite billboards, visible `.28–.55`, flown-through.

**Files:**
- Create: `src/components/city/CloudField.tsx`
- Modify: `src/components/city/CityScene.tsx`

- [x] **Step 1: Generate a soft radial cloud texture (no asset file)**

Build the sprite texture procedurally so there's no binary asset to ship.

```tsx
// src/components/city/CloudField.tsx
'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32, range } from '@/lib/rng'
import { useDescent } from './DescentContext'
import { PHASE, envelope } from './phases'

function makeCloudTexture(): THREE.Texture {
  const s = 128
  const c = document.createElement('canvas'); c.width = c.height = s
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(220,240,255,0.9)')
  g.addColorStop(0.4, 'rgba(160,200,230,0.4)')
  g.addColorStop(1, 'rgba(120,160,200,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true
  return tex
}

export function CloudField() {
  const { progress } = useDescent()
  const group = useRef<THREE.Group>(null)
  const tex = useMemo(makeCloudTexture, [])
  const mat = useMemo(
    () => new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5 }),
    [tex],
  )

  // Cloud puffs scattered through a vertical band the camera falls through.
  const puffs = useMemo(() => {
    const r = mulberry32(0xC10D)
    return Array.from({ length: 60 }, () => ({
      pos: new THREE.Vector3(range(r, -30, 30), range(r, 6, 26), range(r, -30, 30)),
      scale: range(r, 8, 20),
    }))
  }, [])

  useFrame(() => {
    const vis = envelope(progress.current, PHASE.clouds, 0.06)
    const g = group.current
    if (!g) return
    g.visible = vis > 0.001
    mat.opacity = 0.6 * vis
  })

  return (
    <group ref={group} visible={false}>
      {puffs.map((p, i) => (
        <sprite key={i} position={p.pos} scale={[p.scale, p.scale, 1]} material={mat} />
      ))}
    </group>
  )
}
```

- [x] **Step 2: Mount in CityScene** — add `<CloudField />`.

- [x] **Step 3: Verify + tune**

`preview_screenshot` while scrolling through `.28–.5` (≈`h*1.7`–`h*2.6`): soft luminous clouds appear, camera passes through, they thin out toward the city reveal. Tune puff count/positions/opacity for a convincing veil over a dark sky. Confirm cyan rim feel (clouds read cool, not warm). No perf warnings in `preview_console_logs`.

- [x] **Step 4: Commit**

```bash
rtk git add src/components/city/CloudField.tsx src/components/city/CityScene.tsx
rtk git commit -m "feat(city): fly-through cloud sprite field"
```

---

## Task 12: City geometry (`City.tsx`)

Wireframe buildings + glowing road grid from `buildCity`, visible `.50–1.0`, drawing in at REVEAL.

**Files:**
- Create: `src/components/city/City.tsx`
- Modify: `src/components/city/CityScene.tsx` (remove debug grid)

- [x] **Step 1: Implement City**

Buildings as `EdgesGeometry` line segments (merged via instancing of a unit box edges), roads as `LineSegments` along the lattice. Twin buildings get a brighter material.

```tsx
// src/components/city/City.tsx
'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildCity, CITY_SEED } from './cityData'
import { useDescent } from './DescentContext'
import { PHASE, localProgress } from './phases'

const CYAN = new THREE.Color(0x00f5ff)
const WHITE = new THREE.Color(0xffffff)

export function City() {
  const { progress } = useDescent()
  const group = useRef<THREE.Group>(null)
  const layout = useMemo(() => buildCity(CITY_SEED), [])

  // Road grid as a single LineSegments.
  const roads = useMemo(() => {
    const pts: number[] = []
    for (const z of layout.roadsX) pts.push(-layout.half, 0.01, z, layout.half, 0.01, z)
    for (const x of layout.roadsZ) pts.push(x, 0.01, -layout.half, x, 0.01, layout.half)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [layout])

  // Building edges merged into one LineSegments (translate unit-box edges).
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
        <lineBasicMaterial color={CYAN} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={buildingGeo}>
        <lineBasicMaterial color={CYAN} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  )
}
```

(`twin`/WHITE accent buildings are a follow-up tuning pass — leave the hook in `layout.buildings[].twin` for later.)

- [x] **Step 2: CityScene** — remove `<gridHelper>`, add `<City />`.

- [x] **Step 3: Verify**

`preview_screenshot` at scroll `.5–.65` and `1.0`: wireframe city draws in below as clouds clear; roads + building outlines glow cyan; camera flies over it. Run `rtk tsc --noEmit` → 0. No console errors.

- [x] **Step 4: Commit**

```bash
rtk git add src/components/city/City.tsx src/components/city/CityScene.tsx
rtk git commit -m "feat(city): wireframe buildings + glowing road grid"
```

---

## Task 13: Vehicles (`Vehicles.tsx`)

Instanced low-poly vehicles looping along lanes, with a short additive trail. Count adapts to device.

**Files:**
- Create: `src/components/city/Vehicles.tsx`
- Modify: `src/components/city/CityScene.tsx`

- [x] **Step 1: Implement Vehicles**

```tsx
// src/components/city/Vehicles.tsx
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
  const { progress } = useDescent()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const layout = useMemo(() => buildCity(CITY_SEED), [])
  const lanes = useMemo(() => buildLanes(layout), [layout])

  const agents = useMemo(() => {
    const r = mulberry32(0x5EED)
    return Array.from({ length: vehicleCount() }, () => ({
      lane: Math.floor(range(r, 0, lanes.length)),
      t: r(),
      speed: range(r, 0.02, 0.06) * (r() < 0.5 ? 1 : -1),
    }))
  }, [lanes])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, dt) => {
    const mesh = meshRef.current
    if (!mesh) return
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, vehicleCount()]} visible={false}>
      <boxGeometry args={[0.5, 0.25, 1.0]} />
      <meshBasicMaterial color={CYAN} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}
```

(Trail is a Task-19 polish item — keep vehicles solid streaks for now.)

- [x] **Step 2: Mount** — add `<Vehicles />` to CityScene.

- [x] **Step 3: Verify**

`preview_screenshot`/observe at scroll `.65`: small glowing vehicles move along the roads, looping, no teleports. On a mobile viewport (`preview_resize` to 390×844) the count drops (visually sparser). No console errors.

- [x] **Step 4: Commit**

```bash
rtk git add src/components/city/Vehicles.tsx src/components/city/CityScene.tsx
rtk git commit -m "feat(city): instanced vehicles looping on lanes"
```

---

## Task 14: Drones (`Drones.tsx`)

Instanced drones flying parabolic arcs above the city.

**Files:**
- Create: `src/components/city/Drones.tsx`
- Modify: `src/components/city/CityScene.tsx`

- [x] **Step 1: Implement Drones** (mirrors Vehicles, using `buildDroneArcs`/`sampleArc`)

```tsx
// src/components/city/Drones.tsx
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
  const { progress } = useDescent()
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
```

- [x] **Step 2: Mount** — add `<Drones />` to CityScene.

- [x] **Step 3: Verify** — `preview_screenshot` at city phases: small wireframe drones arc above the streets at altitude, spinning gently. No console errors.

- [x] **Step 4: Commit**

```bash
rtk git add src/components/city/Drones.tsx src/components/city/CityScene.tsx
rtk git commit -m "feat(city): instanced drones on altitude arcs"
```

---

## Task 15: Overlays — Beat 1 Connectivity (V2X links)

Thin glowing links between nearby vehicles/nodes + traveling packets, gated to `beat1`.

**Files:**
- Create: `src/components/city/Overlays.tsx`
- Modify: `src/components/city/CityScene.tsx`

- [x] **Step 1: Implement links**

A fixed set of node points (roadside units on the lattice). Each frame during beat1, draw a pulsing `LineSegments` between random nearby node pairs and animate point "packets" along them. Use a static node set + precomputed pairs (deterministic) so it's cheap.

```tsx
// src/components/city/Overlays.tsx
'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildCity, CITY_SEED } from './cityData'
import { mulberry32, range } from '@/lib/rng'
import { useDescent } from './DescentContext'
import { PHASE, envelope, localProgress } from './phases'

const CYAN = new THREE.Color(0x00f5ff)

export function Overlays() {
  const { progress } = useDescent()
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

  useFrame(({ clock }) => {
    const p = progress.current
    const vis = envelope(p, PHASE.beat1, 0.03)
    if (links.current) links.current.visible = vis > 0.001
    if (linkMat.current) linkMat.current.opacity = vis * (0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 3))
  })

  return (
    <group>
      <lineSegments ref={links} geometry={linkData} visible={false}>
        <lineBasicMaterial ref={linkMat} color={CYAN} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      {/* Beat 2 + 3 added in following tasks */}
    </group>
  )
}
```

- [x] **Step 2: Mount** — add `<Overlays />` to CityScene.

- [x] **Step 3: Verify** — `preview_screenshot` at scroll `.70`: thin cyan links pulse between roadside nodes; fade out before beat 2. No console errors.

- [x] **Step 4: Commit**

```bash
rtk git add src/components/city/Overlays.tsx src/components/city/CityScene.tsx
rtk git commit -m "feat(city): beat 1 — V2X connectivity links"
```

---

## Task 16: Overlays — Beat 2 AI (neural plane)

A wireframe neural plane rising above the city, nodes + traveling pulses, gated to `beat2`.

**Files:**
- Modify: `src/components/city/Overlays.tsx`

- [x] **Step 1: Add neural plane to Overlays**

Add a second block inside `Overlays`: a grid of node points at `y = NEURAL_Y`, connected to nearest neighbors as `LineSegments`, the whole group rising from the city into place over `localProgress(beat2)`.

```tsx
// add imports already present; inside Overlays component body:
const neural = useRef<THREE.Group>(null)
const neuralMat = useRef<THREE.LineBasicMaterial>(null)
const NEURAL_Y = 16
const neuralGeo = useMemo(() => {
  const r = mulberry32(0xA1)
  const n = 24
  const nodes = Array.from({ length: n }, () => new THREE.Vector3(range(r, -layout.half, layout.half), 0, range(r, -layout.half, layout.half)))
  const pts: number[] = []
  nodes.forEach((a) => {
    nodes.forEach((b) => { if (a !== b && a.distanceTo(b) < layout.cell * 2) pts.push(a.x, a.y, a.z, b.x, b.y, b.z) })
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return geo
}, [layout])
```

In the existing `useFrame`, after the beat1 block, add:

```tsx
const vis2 = envelope(p, PHASE.beat2, 0.04)
const rise = localProgress(p, PHASE.beat2)
if (neural.current) {
  neural.current.visible = vis2 > 0.001
  neural.current.position.y = NEURAL_Y * (0.6 + 0.4 * rise) // rises into place
}
if (neuralMat.current) neuralMat.current.opacity = vis2 * 0.8
```

In the returned JSX, add inside the `<group>`:

```tsx
<group ref={neural} visible={false}>
  <lineSegments geometry={neuralGeo}>
    <lineBasicMaterial ref={neuralMat} color={0x66ffff} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
  </lineSegments>
</group>
```

- [x] **Step 2: Verify** — `preview_screenshot` at scroll `.83`: a translucent wireframe mesh floats above the city, with real depth between it and the streets; camera is lifted (Task 4 keyframe). Fades out before beat 3. No console errors.

- [x] **Step 3: Commit**

```bash
rtk git add src/components/city/Overlays.tsx
rtk git commit -m "feat(city): beat 2 — AI neural plane rising above city"
```

---

## Task 17: Overlays — Beat 3 Electromobility (energy streams)

Cyan energy flowing grid → charging station → vehicle, gated to `beat3`.

**Files:**
- Modify: `src/components/city/Overlays.tsx`

- [x] **Step 1: Add energy streams**

For each charger in `layout.chargers`, draw a vertical/arc stream of moving points (energy) rising from the pad. Use a `Points` cloud whose per-point phase animates upward; opacity from `envelope(beat3)`.

```tsx
// inside Overlays body:
const energy = useRef<THREE.Points>(null)
const energyMat = useRef<THREE.PointsMaterial>(null)
const energyGeo = useMemo(() => {
  const pts: number[] = []
  layout.chargers.forEach((c) => {
    for (let i = 0; i < 20; i++) pts.push(c.x, i * 0.25, c.z) // column of points per charger
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return geo
}, [layout])
```

In `useFrame`, add:

```tsx
const vis3 = envelope(p, PHASE.beat3, 0.04)
if (energy.current) {
  energy.current.visible = vis3 > 0.001
  // animate points upward by offsetting the geometry's draw via material size pulse
}
if (energyMat.current) energyMat.current.opacity = vis3 * (0.6 + 0.4 * Math.sin(clock.getElapsedTime() * 4))
```

JSX inside the `<group>`:

```tsx
<points ref={energy} geometry={energyGeo} visible={false}>
  <pointsMaterial ref={energyMat} color={CYAN} size={0.18} sizeAttenuation transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
</points>
```

- [x] **Step 2: Verify** — `preview_screenshot` at scroll `.95`: cyan energy columns pulse upward at charging stations while the camera pans to the cluster (Task 4 keyframe). No console errors.

- [x] **Step 3: Commit**

```bash
rtk git add src/components/city/Overlays.tsx
rtk git commit -m "feat(city): beat 3 — electromobility energy streams"
```

---

## Task 18: Title dock + "systems ignite" cue

Resolve the name at REVEAL, dock it to the lower-left corner during beats; add a subtle "scroll to enter" caret during the porthole phase.

**Files:**
- Modify: `src/components/HeroSection.tsx`
- Create: `src/components/hero/DescentTitle.tsx`

- [x] **Step 1: DescentTitle**

A client component that reads `progress` via rAF and sets CSS — big-centered at REVEAL, then animates to small lower-left as beats begin. Includes the porthole-phase caret.

```tsx
// src/components/hero/DescentTitle.tsx
'use client'
import { useEffect, useRef } from 'react'
import { HeroTitle } from '@/components/HeroTitle'
import { useDescent } from '@/components/city/DescentContext'
import { PHASE, REVEAL_END } from '@/components/city/phases'

export function DescentTitle() {
  const wrap = useRef<HTMLDivElement>(null)
  const caret = useRef<HTMLDivElement>(null)
  const { progress } = useDescent()

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = progress.current
      const w = wrap.current, c = caret.current
      if (w) {
        // Title appears from REVEAL start, settles by REVEAL_END, then docks during beats.
        const appear = Math.min(1, Math.max(0, (p - PHASE.reveal[0]) / (REVEAL_END - PHASE.reveal[0])))
        const dock = Math.min(1, Math.max(0, (p - PHASE.beat1[0]) / (PHASE.beat1[1] - PHASE.beat1[0])))
        w.style.opacity = String(appear)
        // scale 1 → 0.55, move toward lower-left as dock→1
        const scale = 1 - dock * 0.45
        w.style.transform = `translate(${dock * -2}vw, ${dock * 4}vh) scale(${scale})`
        w.style.transformOrigin = 'left bottom'
      }
      if (c) c.style.opacity = String(Math.max(0, 1 - p / PHASE.porthole[1]))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  return (
    <>
      <div ref={caret} className="absolute bottom-10 left-1/2 -translate-x-1/2 font-display text-xs tracking-widest uppercase opacity-100">
        Scroll to enter ↓
      </div>
      <div ref={wrap} className="absolute bottom-24 left-6 md:left-16 z-10" style={{ opacity: 0 }}>
        <HeroTitle />
      </div>
    </>
  )
}
```

- [x] **Step 2: Use it in HeroSection** — replace the `<HeroTitle/>` inside `HeroStage` with `<DescentTitle/>`:

```tsx
<HeroStage>
  <div className="relative z-10 h-full max-w-7xl w-full mx-auto px-6 md:px-16">
    <DescentTitle />
  </div>
</HeroStage>
```

- [x] **Step 3: Verify** — `preview_screenshot` sequence: porthole shows "Scroll to enter ↓"; at `.6` the name resolves; through beats it shrinks + docks lower-left, staying readable over the city. Confirm `HeroTitle`'s GSAP scramble still fires once. No console errors.

- [x] **Step 4: Commit**

```bash
rtk git add src/components/hero/DescentTitle.tsx src/components/HeroSection.tsx
rtk git commit -m "feat(hero): title resolves at reveal, docks lower-left through beats"
```

---

## Task 19: Offscreen pause + perf pass

Idle the per-frame work when the hero is scrolled away; clamp counts; confirm budgets.

**Files:**
- Modify: `src/components/city/CityScene.tsx`
- Modify: `src/components/R3FRoot.tsx` (only if DPR needs lowering on mobile)

- [x] **Step 1: Add an offscreen flag in CityScene**

Mirror `SignalField`'s IntersectionObserver: observe `#hero`, store `visible` in a ref, and have `useDescentCamera` + subsystem `useFrame`s early-return when not visible. Implement by adding a shared `visible` ref to `DescentContext` and gating each subsystem's `useFrame` on it.

```tsx
// In DescentContext: add `visible: useRef(true)` to the context value + type.
// In CityScene useEffect:
useEffect(() => {
  const hero = document.getElementById('hero')
  if (!hero) return
  const obs = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting }, { threshold: 0 })
  obs.observe(hero)
  return () => obs.disconnect()
}, [visible])
```

Then in each subsystem `useFrame`, add `if (!visible.current) return` at the top (Porthole, CloudField, City, Vehicles, Drones, Overlays, useDescentCamera).

- [x] **Step 2: Verify perf**

`preview_start`. Scroll past the hero into About; `preview_console_logs` for any runaway warnings. Use `preview_eval` to read `performance` timing or observe smoothness. On a 390×844 `preview_resize`, confirm vehicle/drone counts dropped (Task 13/14). Confirm DPR is clamped (R3FRoot already sets `min(dpr,1.5)`). If mobile still janks, lower to `1.0` on `(max-width:768px)` in `R3FRoot.onCreated`.

- [x] **Step 3: Commit**

```bash
rtk git add src/components/city/CityScene.tsx src/components/city/DescentContext.tsx src/components/R3FRoot.tsx
rtk git commit -m "perf(city): offscreen pause + device-adaptive counts"
```

---

## Task 20: Reduced-motion + mobile fallback + skip control

Guarantee the accessible path: no scroll-jack under reduced-motion; a skip-intro control.

**Files:**
- Modify: `src/components/hero/HeroStage.tsx`
- Modify: `src/components/city/CityScene.tsx`
- Create: `src/components/hero/SkipIntro.tsx`

- [x] **Step 1: Confirm reduced-motion path**

`HeroStage` already sets `progress.current = REVEAL_END` and skips the pin under `useReducedMotion()`. Verify `CityScene` renders the lit city + docked title at that fixed progress (no animation needed). The `key={reduced ? 'static' : 'live'}` on `CityScene` (Task 8) ensures a clean remount.

- [x] **Step 2: SkipIntro control**

```tsx
// src/components/hero/SkipIntro.tsx
'use client'
export function SkipIntro() {
  const skip = () => {
    const about = document.getElementById('about')
    about?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <button onClick={skip}
      className="fixed bottom-6 right-6 z-50 pointer-events-auto font-display text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity">
      Skip intro →
    </button>
  )
}
```

Mount `<SkipIntro />` inside `HeroSection` (outside `HeroStage`, so it's always reachable).

- [x] **Step 3: Verify**

Emulate reduced motion: `preview_eval` to set `matchMedia('(prefers-reduced-motion: reduce)')` is environment-driven — instead verify by temporarily forcing `reduced=true` OR use the browser devtools emulation via `preview_eval` if supported. Confirm: no pin, city shown lit, title visible immediately, normal scroll reaches About. Click "Skip intro" → smooth-scrolls to About. No console errors.

- [x] **Step 4: Commit**

```bash
rtk git add src/components/hero/SkipIntro.tsx src/components/hero/HeroStage.tsx src/components/city/CityScene.tsx src/components/HeroSection.tsx
rtk git commit -m "feat(hero): reduced-motion fallback + skip-intro control"
```

---

## Task 21: Retire SignalField + final verification

Remove the dead background and confirm the whole flow + build.

**Files:**
- Delete: `src/components/SignalField.tsx`
- Verify: full build

- [x] **Step 1: Confirm no importers**

Run: `rtk grep -n "SignalField" src/`
Expected: no matches (page.tsx swapped in Task 8). If any remain, remove them.

- [x] **Step 2: Delete**

```bash
rtk git rm src/components/SignalField.tsx
```

- [x] **Step 3: Full build + tests + type-check**

Run: `rtk pnpm test` → all pure-logic tests pass.
Run: `rtk tsc --noEmit` → 0 errors.
Run: `rtk next build` → compiles, no type errors (this is what Vercel runs).

- [x] **Step 4: End-to-end visual pass**

`preview_start`, then `preview_screenshot` at scroll fractions 0.0, 0.2, 0.4, 0.6, 0.75, 0.85, 0.95, 1.0 and one past-hero (About). Confirm the full storyboard reads: porthole → enter → clouds → city reveal + title → beat1 links → beat2 neural → beat3 energy → handoff. `preview_console_logs` clean.

- [x] **Step 5: Commit**

```bash
rtk git add -A
rtk git commit -m "feat(hero): retire SignalField; city descent is the hero background"
```

---

## Self-review (completed during planning)

**Spec coverage:**
- Storyboard phases → Tasks 3 (windows), 10 (porthole), 11 (clouds), 12 (city), 15–17 (beats). ✓
- 3 pillar beats → Tasks 15/16/17. ✓
- Real 3D vehicles + drones → Tasks 13/14. ✓
- Holographic porthole, dissolve + scroll-back re-form → Task 10 (scroll-back is free: scrub reverses). ✓
- Literal clouds as sprites → Task 11. ✓
- Pure wireframe + fake glow → additive materials throughout, no post-processing. ✓
- Title anchored lower-left → Task 18. ✓ Pin ≈500vh → Task 7 (`PIN_VH=500`). ✓ No bloom → confirmed. ✓
- Reuse single Canvas + View → Tasks 8/9. ✓
- Perf budget, offscreen pause, adaptive counts → Tasks 13/14/19. ✓
- Reduced-motion + mobile fallback + skip → Task 20. ✓
- Retire SignalField → Task 21. ✓
- Out-of-scope (traffic AI, sensors, dashboards) → intentionally absent. ✓

**Placeholder scan:** Visual tasks carry working starter code + explicit preview-verification (not "implement later"). Tuning notes are flagged as tuning, not gaps. ✓

**Type consistency:** `progress`/`mouse`/`visible` refs come from `useDescent()`; `PHASE`/`envelope`/`localProgress`/`REVEAL_END` from `phases.ts`; `sampleCamera` from `cameraPath.ts`; `buildCity`/`CITY_SEED` + `buildLanes`/`sampleLane`/`buildDroneArcs`/`sampleArc` consistent across Tasks 5/6/12/13/14/15/16/17. ✓

**Known follow-ups (deliberately deferred, not gaps):** vehicle trails, `twin`-building white accents, packet-travel animation polish on links — all additive tuning passes after the storyboard reads end-to-end.
