# Hero City Descent — Milestone Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. **Work ONE milestone at a time.** Milestones M2–M15 are summarized; expand a milestone into full task detail only when you reach it (just-in-time) so we never front-load.

**Goal:** Build the scroll-driven hero descent (porthole → clouds → wireframe city + beats) as small, independently shippable milestones, architected so a stylized skin bolts on later.

**Source of truth:** spec `docs/superpowers/specs/2026-06-02-hero-city-descent-design.md`. Detailed code basis for many tasks lives in the companion plan `2026-06-02-hero-city-descent.md` — reuse it when expanding M2+.

**Tech:** Next 15 · React 19 · R3F 9 / drei 10 / three 0.184 · GSAP ScrollTrigger (`@/lib/gsap`) · lenis · Vitest.

**Principle (from spec §11):** DATA (`cityData`) ⊥ MOTION (`useAgents`) ⊥ SKIN (`useRenderProfile` → wireframe now, stylized later). Each visual piece is a thin skin-selector. Ship wireframe only.

**Reference skills (installed `~/.claude/skills/threejs-*`):** consult the matching skill when expanding each milestone.

| Skill | Use in |
|---|---|
| `threejs-fundamentals` | M5 scene/camera/renderer setup, Object3D hierarchy |
| `threejs-geometry` | M8 building edges, **instancing** for M9 vehicles / M10 drones |
| `threejs-materials` | wireframe + additive blending now; stylized skin later |
| `threejs-shaders` | M7 cloud noise texture, beat energy/link flow |
| `threejs-animation` | scripted motion (`useAgents`), camera rig choreography |
| `threejs-textures` | M7 procedural cloud texture, future stylized surfaces |
| `threejs-loaders` | parked — only if GLB is ever added (spec §8a stylized) |
| `threejs-postprocessing` | reference only — bloom is OFF (fake glow, spec §10) |
| `threejs-lighting` | parked — wireframe is unlit; relevant for stylized skin |
| `threejs-interaction` | mouse parallax input (M5) |

---

## Milestone map (each small — 1–4 files)

| # | Milestone | Ships (visible/testable) | Size |
|---|---|---|---|
| **M0** | Foundation & cleanup | clean branch, green build, test runner | XS |
| **M1** | Pure logic: rng + phases | tested PRNG + phase math | XS |
| **M2** | Pure logic: cameraPath | tested camera-pose sampler | XS |
| **M3** | Pure logic: cityData + lanes | tested city layout + path samplers | S |
| **M4** | Scroll plumbing | scroll updates a `progress` number (no 3D) | S |
| **M5** | CityView + camera rig | debug grid; camera descends on scroll | S |
| **M6** | Porthole | holographic ring opener, dissolves on enter | S |
| **M7** | Clouds (defined) | multi-octave cloud deck flown through | S |
| **M8** | City wireframe + skin seam | wireframe buildings/roads; `useRenderProfile` seam | M |
| **M9** | Agents + vehicles | `useAgents`; vehicles loop lanes | S |
| **M10** | Drones | drones arc above city | XS |
| **M11** | Beat 1 — Connectivity | V2X links pulse | S |
| **M12** | Beat 2 — AI | neural plane rises | S |
| **M13** | Beat 3 — Electromobility | energy streams at chargers | S |
| **M14** | Title + skip | name resolves → docks; caret; skip-intro | S |
| **M15** | Perf + a11y + retire | offscreen pause, reduced-motion, drop SignalField | M |

Wireframe hero = **done at M15**. Stylized skin = a *future* roadmap (spec §8a), its own milestones later.

---

## M0 — Foundation & cleanup

**Goal:** Commit the keep-worthy WIP, drop scratch, add Vitest. No visuals. Leaves `feat/hero-bg` clean + green.

**Files:** WIP across repo; `package.json`; `vitest.config.ts`.

- [ ] **Step 1: Stage keep-worthy WIP**

Keep: smooth-scroll groundwork + cleanup + pnpm + the tuner-unwire already done.

```bash
rtk git add package.json pnpm-lock.yaml pnpm-workspace.yaml \
  src/components/SmoothScroll.tsx 'src/app/[locale]/layout.tsx' \
  src/components/R3FRoot.tsx src/components/SignalField.tsx \
  src/components/R3FRootWrapper.tsx src/components/SignalFieldWrapper.tsx \
  'src/app/[locale]/page.tsx' src/app/layout.tsx src/app/globals.css CLAUDE.md
```

- [ ] **Step 2: Verify type-check before commit**

Run: `rtk tsc --noEmit`
Expected: 0 errors. (If `page.tsx` still imports `SignalField`, that's fine — SignalField is retired in M15, not yet.)

- [ ] **Step 3: Commit the groundwork**

```bash
rtk git commit -m "chore(hero): smooth-scroll groundwork + pnpm migration + r3f cleanup"
```

- [ ] **Step 4: Drop scratch (untracked)**

```bash
rm -rf 'src/app/[locale]/test-bg' 'public/Lohith Tarikere copy.png'
```

Verify gone: `rtk git status` shows them absent.

- [ ] **Step 5: Decide prototype + launch.json tracking**

Keep `prototypes/city-descent.html` (reference) and `.claude/launch.json` (preview). Add them:

```bash
rtk git add prototypes/city-descent.html .claude/launch.json
rtk git commit -m "chore(spike): keep city-descent prototype + preview launch config"
```

- [ ] **Step 6: Add Vitest**

Run: `rtk pnpm add -D vitest @vitejs/plugin-react`

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

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 7: Smoke test + commit**

Create `src/lib/_smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
describe('vitest', () => { it('runs', () => { expect(1 + 1).toBe(2) }) })
```

Run: `rtk pnpm test`
Expected: 1 passing.

```bash
rtk git add package.json pnpm-lock.yaml vitest.config.ts src/lib/_smoke.test.ts
rtk git commit -m "chore(test): add vitest runner"
```

**M0 done when:** `rtk tsc --noEmit` clean, `rtk pnpm test` green, branch has no scratch.

---

## M1 — Pure logic: rng + phases

**Goal:** Deterministic PRNG + phase-window math. Pure functions, TDD. No rendering.

**Files:** `src/lib/rng.ts` (+test); `src/components/city/phases.ts` (+test).

- [ ] **Step 1: Failing test for `mulberry32`**

`src/lib/rng.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mulberry32 } from '@/lib/rng'

describe('mulberry32', () => {
  it('is deterministic for a seed', () => {
    const a = mulberry32(42), b = mulberry32(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('returns [0,1)', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 100; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1) }
  })
})
```

- [ ] **Step 2: Run → fail** — `rtk pnpm test src/lib/rng.test.ts` → "not a function".

- [ ] **Step 3: Implement `src/lib/rng.ts`**

```ts
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const range = (r: () => number, min: number, max: number) => min + r() * (max - min)
export const rangeInt = (r: () => number, min: number, max: number) => Math.floor(range(r, min, max + 1))
```

- [ ] **Step 4: Run → pass.**

- [ ] **Step 5: Failing test for `phases`**

`src/components/city/phases.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { PHASE, envelope, localProgress, REVEAL_END } from '@/components/city/phases'

describe('phases', () => {
  it('boundaries ascend', () => {
    const b = [PHASE.porthole, PHASE.enter, PHASE.clouds, PHASE.reveal, PHASE.beat1, PHASE.beat2, PHASE.beat3]
    for (let i = 1; i < b.length; i++) expect(b[i][0]).toBeGreaterThanOrEqual(b[i - 1][0])
  })
  it('REVEAL_END inside reveal', () => {
    expect(REVEAL_END).toBeGreaterThan(PHASE.reveal[0]); expect(REVEAL_END).toBeLessThanOrEqual(PHASE.reveal[1])
  })
  it('envelope ramps 0→1→0', () => {
    expect(envelope(0.0, [0.2, 0.6], 0.05)).toBe(0)
    expect(envelope(0.4, [0.2, 0.6], 0.05)).toBe(1)
    expect(envelope(0.9, [0.2, 0.6], 0.05)).toBe(0)
  })
  it('localProgress maps window to 0..1', () => {
    expect(localProgress(0.4, [0.2, 0.6])).toBeCloseTo(0.5)
  })
})
```

- [ ] **Step 6: Run → fail.**

- [ ] **Step 7: Implement `src/components/city/phases.ts`**

```ts
export type Window = readonly [start: number, end: number]
export const PHASE = {
  porthole: [0.0, 0.1] as Window, enter: [0.1, 0.28] as Window, clouds: [0.28, 0.5] as Window,
  reveal: [0.5, 0.65] as Window, beat1: [0.65, 0.77] as Window, beat2: [0.77, 0.89] as Window, beat3: [0.89, 1.0] as Window,
} as const
export const REVEAL_END = 0.62
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export function envelope(p: number, [s, e]: Window, fade: number): number {
  if (p <= s || p >= e) return 0
  return Math.min(clamp01((p - s) / fade), clamp01((e - p) / fade))
}
export function localProgress(p: number, [s, e]: Window): number { return clamp01((p - s) / (e - s)) }
```

- [ ] **Step 8: Run → pass. Commit.**

```bash
rtk git add src/lib/rng.ts src/lib/rng.test.ts src/components/city/phases.ts src/components/city/phases.test.ts
rtk git rm src/lib/_smoke.test.ts
rtk git commit -m "feat(city): seeded rng + phase-window math (tested)"
```

**M1 done when:** both test files green, `rtk tsc --noEmit` clean.

---

## M2 — Pure logic: cameraPath  *(expand JIT)*

**Goal:** `sampleCamera(progress) → {position, lookAt}` keyframe sampler. Pure, TDD.
**Ships:** tested camera-pose function (used by M5).
**Tasks:** failing test (descends in Y; continuous; finite) → implement `src/components/city/cameraPath.ts` with the `KEYS` from spec §storyboard / spike → pass → commit.
**Verify:** `rtk pnpm test src/components/city/cameraPath.test.ts` green. **Code basis:** companion plan Task 4.

---

## M3 — Pure logic: cityData + lanes  *(expand JIT)*

**Goal:** Seeded grid city **with detail fields** (spec §11) + lane/arc samplers. Pure, TDD.
**Ships:** deterministic `buildCity(seed)` (buildings incl. `antenna?`, `roofProp?`, `category`) + `buildLanes`/`sampleLane`/`buildDroneArcs`/`sampleArc`.
**Tasks:** test+impl `cityData.ts` (deterministic, in-bounds, ≥3 chargers, detail fields populated) → test+impl `lanes.ts` (one lane per road line, y≈0, wraps, arcs rise) → commit.
**Verify:** both test files green. **Code basis:** companion plan Tasks 5 + 6, plus add `antenna?/roofProp?/category` to the `Building` type now (wireframe ignores them).

---

## M4 — Scroll plumbing  *(expand JIT)*

**Goal:** `DescentContext` (shared `progress`/`mouse` refs) + `HeroStage` (≈500vh GSAP pin+scrub writing `progress`). No 3D.
**Ships:** scrolling the hero updates a `data-progress` attribute 0→1; reduced-motion pins to `REVEAL_END`.
**Tasks:** `DescentContext.tsx` → `HeroStage.tsx` (PIN_VH=500) → wire `HeroSection` to wrap content in `HeroStage`.
**Verify:** preview — scroll, read `data-progress` rising; console clean. **Code basis:** companion plan Task 7.

---

## M5 — CityView + camera rig  *(expand JIT)*

**Goal:** drei `View` (own camera) + `useDescentCamera` (sampleCamera + parallax + idle). Debug grid only.
**Ships:** cyan debug grid behind hero; camera descends/parallaxes as you scroll. SignalField still present (removed M15).
**Tasks:** `CityView.tsx` (View + PerspectiveCamera + reduced-motion key) → `CityScene.tsx` (grid + rig + pointer parallax) → `useDescentCamera.ts` → swap `CityView` into `page.tsx` under `DescentProvider` (keep SignalField for now or hide).
**Verify:** preview screenshots at scroll 0 / mid / end — grid viewed from descending angles; no WebGL errors. **Code basis:** companion plan Tasks 8 + 9.

---

## M6 — Porthole  *(expand JIT)*

**Goal:** Holographic ring (torus + bolt nodes), visible .00–.28, breathe + scale-through-dissolve.
**Ships:** cyan ring on black at top; scales past frame + fades on enter (verified in spike).
**Tasks:** `skins/PortholeRing.tsx` (or `Porthole.tsx`) → mount in `CityScene`.
**Verify:** preview `?`-scroll to porthole → ring centered; to .2 → dissolving. **Code basis:** companion plan Task 10 + spike `Porthole` block.

---

## M7 — Clouds (defined)  *(expand JIT)*

**Goal:** `CloudsBasic` — **multi-octave noise** cloud texture + a few depth layers (not flat sprites), visible .28–.55. Addresses "needs more definition."
**Ships:** layered cloud deck the camera falls through, cyan-rimmed, on dark sky.
**Tasks:** procedural noise canvas texture (2–3 octaves) → sprite/layer field → opacity from `envelope(clouds)` → mount.
**Verify:** preview scroll .3–.5 — clouds read with form + depth, thin out into reveal. **Code basis:** companion plan Task 11, upgraded texture per spec §11.

---

## M8 — City wireframe + skin seam  *(expand JIT)*

**Goal:** First skinned subsystem. Introduce the seam: `useRenderProfile()` + `skins/` + thin `City` selector. Wireframe buildings + glowing roads, reveal at .50.
**Ships:** wireframe city draws in below as clouds clear; the render-skin pattern exists.
**Tasks:** `useRenderProfile.ts` (returns `'wireframe'` for now; capability branch dormant) → `skins/CityWireframe.tsx` (buildings EdgesGeometry merged + road LineSegments) → `City.tsx` selector → mount, remove debug grid.
**Verify:** preview .5–1.0 — city renders; `rtk tsc` clean. **Code basis:** companion plan Task 12 + spec §11 seam.

---

## M9 — Agents + vehicles  *(expand JIT)*

**Goal:** Shared motion: `useAgents()` (vehicle transforms from lanes) + `skins/VehiclesWireframe.tsx` + `Vehicles` selector.
**Ships:** instanced vehicles loop the roads; counts adapt to device.
**Tasks:** `useAgents.ts` (vehicle agents update) → `VehiclesWireframe.tsx` (InstancedMesh) → `Vehicles.tsx` selector → mount.
**Verify:** preview .65 — vehicles move, no teleports; mobile viewport sparser. **Code basis:** companion plan Task 13, split per spec §11 (motion in `useAgents`).

---

## M10 — Drones  *(expand JIT)*

**Goal:** `skins/DronesWireframe.tsx` + `Drones` selector, arcs from `useAgents` (extend it for drones).
**Ships:** wireframe drones arc at altitude, spinning.
**Tasks:** extend `useAgents` with drone arcs → `DronesWireframe.tsx` → selector → mount.
**Verify:** preview city phases — drones above streets. **Code basis:** companion plan Task 14.

---

## M11 — Beat 1: Connectivity  *(expand JIT)*

**Goal:** `Overlays` V2X links — pulsing lines between roadside nodes, gated to `beat1`.
**Ships:** thin cyan links pulse during beat 1, fade before beat 2.
**Tasks:** `Overlays.tsx` link block (static node set + deterministic near pairs) → mount.
**Verify:** preview .70 — links pulse. **Code basis:** companion plan Task 15.

---

## M12 — Beat 2: AI  *(expand JIT)*

**Goal:** Neural plane rising above city, gated to `beat2`. (Spike tuning note: raise altitude + brighten so it clearly floats above.)
**Ships:** translucent wireframe plane rises into place with depth over the streets.
**Tasks:** add neural block to `Overlays` (node grid at higher `NEURAL_Y`, nearest-neighbor links, rises on `localProgress`).
**Verify:** preview .83 — plane distinct above city. **Code basis:** companion plan Task 16 + spike fix (higher/brighter).

---

## M13 — Beat 3: Electromobility  *(expand JIT)*

**Goal:** Energy streams at chargers, gated to `beat3`.
**Ships:** cyan energy columns pulse upward at charging stations as camera pans.
**Tasks:** add energy block to `Overlays` (points per charger animating upward).
**Verify:** preview .95 — energy at chargers. **Code basis:** companion plan Task 17.

---

## M14 — Title + skip  *(expand JIT)*

**Goal:** `DescentTitle` (caret in porthole → name resolves at REVEAL → docks lower-left through beats) + `SkipIntro`.
**Ships:** "Scroll to enter" caret; name + tagline resolve then dock; skip-intro button.
**Tasks:** `hero/DescentTitle.tsx` (rAF reads progress) → use in `HeroSection` → `hero/SkipIntro.tsx` → mount.
**Verify:** preview sequence — caret → resolve → dock; scramble fires once; skip scrolls to About. **Code basis:** companion plan Tasks 18 + 20 (skip).

---

## M15 — Perf + a11y + retire  *(expand JIT)*

**Goal:** Offscreen pause, device-adaptive counts confirmed, reduced-motion fallback verified, retire `SignalField`, final build.
**Ships:** the finished wireframe hero; SignalField gone; Vercel build green.
**Tasks:** add `visible` ref + IntersectionObserver gate to all `useFrame`s → confirm reduced-motion path (no pin, lit city, immediate title) → `rtk grep SignalField` clean → `rtk git rm SignalField.tsx` → `rtk pnpm test` + `rtk tsc` + `rtk next build` → end-to-end screenshot pass.
**Verify:** full storyboard reads; build passes (what Vercel runs). **Code basis:** companion plan Tasks 19 + 20 + 21.

---

## Self-review

**Spec coverage:** porthole M6 · clouds(defined) M7 · city M8 · vehicles M9 · drones M10 · 3 beats M11–13 · title/dock M14 · pin500/anchored-title/no-bloom baked in · reduced-motion+skip+offscreen M15 · render-skin seam M8 + `useAgents` M9/M10 + `useRenderProfile` M8 + `cityData` detail fields M3 (spec §11) · retire SignalField M15. ✓ Out-of-scope (physics, real sim, GLB, stylized skin) absent by design. ✓

**Small-pieces check:** every milestone is 1–4 files; M2–M15 carry only a goal+task list (expanded JIT) so no milestone is front-loaded. ✓

**Consistency:** shared names — `progress`/`mouse`/`visible` via `useDescent`; `PHASE`/`envelope`/`localProgress`/`REVEAL_END`; `sampleCamera`; `buildCity`/`buildLanes`/`useAgents`/`useRenderProfile` — consistent across milestones + spec §11. ✓
