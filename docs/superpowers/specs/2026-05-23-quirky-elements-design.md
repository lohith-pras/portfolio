# Quirky Portfolio Elements — Design Spec

**Date:** 2026-05-23
**Status:** Approved, ready for implementation
**Approach:** C — right tool per element (GSAP for scroll narrative, R3F for 3D, Framer Motion for flags)

---

## Scope

Four additions to portfolio_v2 (Next.js 15 + R3F + Framer Motion + GSAP):

1. Shader gradient color tweak
2. EV charging scroll transition (homepage)
3. MIMO beamforming simulator (homepage section)
4. Vertical waving banners (Life page)

---

## 1. Shader Gradient Update

**File:** `src/components/ShaderCanvas.tsx`

**Change:** Single prop on `<ShaderGradient>`:
```
color3="#0A0A0A"  →  color3="#030B1A"
```

Near-black with Red Bull Racing dark navy undertone. Orange → crimson → deep navy-black. No other props change.

**Motion principles:** No animation change. Jakub lens — subtle production polish.

---

## 2. EV Charging Scroll Transition

### Purpose
Personality element that communicates electromobility identity. Plays during hero scroll zone, then disappears.

### Placement
Fixed overlay, `z-10`, `pointer-events-none`. Active only while hero is in viewport. Positioned `fixed bottom-16 left-0 right-0`, centered horizontally.

### New file
`src/components/EVTransitionScene.tsx` — `'use client'`

### Scene
Minimal geometric SVG (no copyrighted design):
- Side-profile EV silhouette: angular, Cybertruck-inspired, hand-crafted SVG paths
- Charging station: upright post with connector cable

### GSAP Timeline (scrub: true, tied to `#hero` ScrollTrigger)

| Scroll % | Action | GSAP tween |
|----------|--------|------------|
| 0 → 20% | EV drives in from right | `translateX: "200%" → "0%"`, `ease: "power2.out"` |
| 20 → 50% | Cable extends + plugs in | SVG `stroke-dashoffset` from full length → 0 |
| 50 → 70% | Charge pulse | Lightning bolt opacity 0→1→0 loop + radial glow rings `scale: 1→2, opacity: 1→0` |
| 70 → 85% | Cable retracts, EV drives off left | `stroke-dashoffset` reverses, `translateX: "0%" → "-200%"` |
| 85 → 100% | Scene fades | `opacity: 1 → 0` on container |

### Integration
Add `<EVTransitionScene />` to `src/app/[locale]/page.tsx` alongside `<ShaderCanvasWrapper />`.

### Accessibility
`prefers-reduced-motion`: skip animation, render static scene at 20% opacity or hide (`display: none`). Check via `window.matchMedia` at mount, same pattern as `ShaderCanvas.tsx`.

### Motion lens
Jhey (playful, expressive) — rare trigger, full delight justified.

---

## 3. MIMO Beamforming Simulator

### Purpose
Interactive 3D simulator showcasing MIMO signal concepts. Acts as a technical identity section — demonstrates graduate-level antenna/signal knowledge in a visual, explorable format.

### Placement
New section on homepage, after `WorkSection` in `src/app/[locale]/page.tsx`.

### Component tree
```
src/components/mimo/
  MIMOSection.tsx          — section wrapper, Framer Motion scroll reveal
  SimulatorHeader.tsx      — title + 1-line description per mode
  MIMOSimulatorClient.tsx  — 'use client', orchestrates canvas + controls, holds mode state
  SimulatorCanvas.tsx      — R3F canvas, dynamic import (ssr: false)
  AntennaArray.tsx         — 4-element ULA, glowing white cylinders
  BeamPattern.tsx          — mode-aware beam geometry, receives mode + params as props
  SimulatorControls.tsx    — HTML controls (tabs + sliders + instructions)
```

### 3D Scene
- Camera: fixed perspective, ~45° elevation, looking down at array — no orbit
- Floor: faint wireframe `PlaneGeometry`, `#ffffff` at 5% opacity
- Antenna array: 4 `CylinderGeometry` meshes in a row (ULA), white, `PointLight` orange glow (`#FF4500`) at each element

### Beam geometry
- `ConeGeometry` with `MeshBasicMaterial`, `transparent: true`, `opacity: 0.3`, `blending: AdditiveBlending`
- Steering: Framer Motion `useSpring` on mesh `rotation.z` — smooth, spring-physics snap
- Null notch (null steering mode): narrow inverse cone subtracted via `CSG` or rendered as a dark cone overlaid at lower opacity

### Three modes

**Tab switcher** — 3 buttons styled to match existing nav, above canvas.

#### Beamforming
- Single cone, color `#FF4500`
- Control: `<input type="range">` for steering angle −60° → +60°
- Header text: "Steer the beam — move the slider"

#### Null Steering
- Main orange cone + narrow dark notch indicating null direction
- Controls: steering angle slider + draggable red sphere on floor plane (`onPointerMove` → raycaster → update jammer position)
- Null steers automatically toward jammer position
- Header text: "Main beam tracks the user. Null tracks the interferer."

#### MU-MIMO
- 2–4 colored cones: `#FF4500`, `#1434CB` (RBR blue), `#22c55e`, `#eab308`
- Each cone targets a user node (colored sphere on floor)
- Interaction: click floor → place/move user node (max 4); reset button clears all
- Header text: "Place users. Each gets its own beam."

### Controls panel
Plain HTML below canvas, styled to match site (`text-white/70`, `border-white/10`):
- Mode tabs
- Mode-specific controls (slider / drag instruction / click instruction + reset)

### Accessibility
`prefers-reduced-motion`: R3F canvas renders static pose (no `useSpring` animation). Controls remain functional — position changes are instant.

### Motion lens
Jhey (interactive, expressive) — user-initiated, rare, portfolio centerpiece.

---

## 4. Vertical Waving Banners

### Purpose
Personality element on Life page — fandoms (F1 + cricket) expressed as arena-style hanging banners.

### Placement
New subsection in `src/components/LifeClient.tsx`, between photo grid and hobbies list. Heading: "Fandoms" (editable).

### New file
`src/components/WavingFlag.tsx` — `'use client'`

### Props
```ts
interface WavingFlagProps {
  bgColor: string       // banner background
  accentColor: string   // text/number color
  label: string         // short name e.g. "RBR"
  number: string        // player/driver number e.g. "3"
}
```

### Two banner instances

| Banner | `bgColor` | `accentColor` | `label` | `number` |
|--------|-----------|---------------|---------|----------|
| Red Bull Racing | `#001489` | `#FF0000` | `RBR` | `3` |
| Royal Challengers | `#D40024` | `#FFC906` | `RCB` | `18` |

No trademarked logos — colors + abbreviated name + number only.

### Layout
```
  ┌─────────────────────────┐
  │  ══════════════════════ │  ← horizontal rod (2px line)
  │    ┌────┐   ┌────┐     │
  │    │ RB │   │ RC │     │
  │    │ R  │   │ B  │     │
  │    │    │   │    │     │
  │    │ 3  │   │ 18 │     │
  │    └────┘   └────┘     │
  └─────────────────────────┘
```
Banner dimensions: ~70px wide × 180px tall. Gap between banners: 24px.

### Wind wave animation
Vertical travelling wave — top anchored (zero amplitude), bottom free (max amplitude). 10 horizontal strips stacked, each `overflow: hidden`:

```ts
// Framer Motion useAnimationFrame(t)
// t = ms elapsed (RAF timestamp) — multiply by 0.001 to get seconds
// i = strip index 0 (top) → 9 (bottom)
const SPEED = 1.5          // rad/s
const MAX_AMPLITUDE = 7    // px

strips.forEach((el, i) => {
  const tNorm = i / 9
  const amplitude = tNorm * MAX_AMPLITUDE           // 0px at top, 7px at bottom
  const phase = tNorm * Math.PI * 2                 // wave shape across height
  const tSec = t * 0.001                            // ms → seconds
  el.style.transform = `translateX(${amplitude * Math.sin(SPEED * tSec + phase)}px)`
})
```

Each banner gets a different base phase offset (~0.8 rad apart) so they don't wave in sync.

### Accessibility
`prefers-reduced-motion`: no `useAnimationFrame`, strips render flat. Banner still visible as decorative element.

### Motion lens
Jakub (production polish) + Jhey (playful) — occasional trigger, gentle continuous motion appropriate.

---

## File Change Summary

| File | Change |
|------|--------|
| `src/components/ShaderCanvas.tsx` | `color3` prop update |
| `src/components/EVTransitionScene.tsx` | New file |
| `src/components/mimo/MIMOSection.tsx` | New file |
| `src/components/mimo/SimulatorHeader.tsx` | New file |
| `src/components/mimo/MIMOSimulatorClient.tsx` | New file |
| `src/components/mimo/SimulatorCanvas.tsx` | New file |
| `src/components/mimo/AntennaArray.tsx` | New file |
| `src/components/mimo/BeamPattern.tsx` | New file |
| `src/components/mimo/SimulatorControls.tsx` | New file |
| `src/components/WavingFlag.tsx` | New file |
| `src/components/LifeClient.tsx` | Add Fandoms subsection |
| `src/app/[locale]/page.tsx` | Add `EVTransitionScene` + `MIMOSection` |

---

## Dependencies

No new npm packages required. All deps already installed:
- `@react-three/fiber`, `@react-three/drei`, `three` — MIMO simulator
- `gsap`, `@gsap/react` — EV scroll transition
- `framer-motion` — banner wave animation

---

## Open Questions (non-blocking)

- EV SVG: hand-craft or open-license source?
- MIMO section heading: "Signal Explorer" / "MIMO Lab" / something more personal?
- Life page subsection heading: "Fandoms" or rename?
