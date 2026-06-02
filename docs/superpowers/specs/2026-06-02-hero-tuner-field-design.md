# Hero Tuner + Signal Field Redesign

**Date:** 2026-06-02
**Status:** Approved

## Problem

1. **Field appears interaction-driven.** Clicking the page steps the background
   animation. Root cause: `SignalField` runs `frameloop="demand"` with a
   self-sustaining `invalidate()` loop inside `useFrame` that early-returns
   (skipping the `invalidate`) when `isHeroVisible` flips false at the
   IntersectionObserver threshold. Once the chain breaks it never restarts on
   its own, so the only thing painting new frames is pointer/click events
   (R3F auto-invalidates on pointer). The field is a *stalled* loop being
   manually stepped.
2. **Knob does nothing to the field.** `TunerDevice` publishes `clarity` via
   `setTune()`, but `SignalField` never reads `tuneRef`. The wiring is absent.
3. **Tuner is desktop-only and fixed-size** (`hidden lg:block`, 340×210).
4. **Knob rotation is clamped** to ±150° with a single bounded sweet-spot.
5. **Too many particles** (12000), heavy — and now must run on mobile too.

## Goals

- Field pulses **automatically**, continuously, with no interaction.
- Knob is genuinely **functional**: free 360° spin, drives field intensity.
- Tuner is **responsive** across all breakpoints, fluid, touch-draggable.
- **Fewer particles**, adaptive to device.

## Design

### 1. Fix the demand-loop stall (auto-pulse)
`SignalField` must keep animating while the hero is visible regardless of the
per-frame early-return. Keep the keep-alive `invalidate()` alive — either move
it so it runs whenever the hero is visible (not gated behind the early-return),
or drive a dedicated `requestAnimationFrame` ticker that calls `invalidate()`
while `isHeroVisible.current` is true. Offscreen pause is preserved (loop stops
when hero leaves, observer re-kicks on re-entry). Net: beams breathe on their
own; clicks no longer step anything.

### 2. Wire knob → field
Add `uTune` uniform (0→1) to the particle shader and the wave-plane shader.
`SignalField` reads `useTunerContext().tuneRef` each frame and writes it into
`uTune`. This is the missing link that makes the knob functional.

### 3. Intensity = auto-pulse × knob ceiling
- Beams breathe on a `uTime` sine envelope (automatic, always running).
- `uTune` scales the **ceiling**: locked → large bright swell; detuned → dim,
  low-amplitude flicker. A low non-zero floor keeps the field from going fully
  black at `uTune=0`.
- Applies to wave-plane `glow`/`hotCore` and particle `waveVis`/`brightness`.

### 4. Knob mechanics — infinite spin, lock per turn (`useTuner.ts`)
- Remove the `±HALF_ARC` clamp; `targetAngle` accumulates freely both ways.
- Clarity from angular distance to the nearest sweet-spot **mod 2π** (wrap the
  delta to `[-π, π]`), so the lock recurs once every full revolution.
- `angleToFreq` maps `angle mod 2π` → 88..108, cycling.
- On release, snap to the nearest sweet-spot orientation (`SWEET + k·2π`).
- `knobSpin.rotation.y = -knobAngle` is already unbounded → full visual spin.
- Reduced-motion: start locked, no spin (unchanged).

### 5. Responsive + touch (`HeroSection.tsx`, `TunerView.tsx`)
- Drop `hidden lg:block` → visible on all breakpoints.
- Fluid container: `w-[clamp(190px,42vw,340px)]` with a fixed aspect-ratio
  (~1.62) so the 3D scene scales by CSS only and never distorts.
- Reposition on `<md` so it clears the hero name.
- Add `touch-action: none` to `.tuner-view` so knob drag doesn't fight page
  scroll on touch devices. Existing pointer events already cover touch.

### 6. Lighter, adaptive particles (`SignalField.tsx`)
- Replace the `PARTICLE_COUNT = 12000` constant with a runtime count computed
  once on the client: ~6000 desktop, ~3000 on mobile / low-power
  (`matchMedia('(max-width: 768px)')` + `navigator.hardwareConcurrency`).
- `makeWavePositions` / `makeRandomPositions` take a `count` parameter; the
  buffers are `useMemo`'d on count.

## Verification
- Load and don't touch → beams pulse on their own (stall fixed).
- Drag knob → free spin, FREQ cycles 88↔108, locked state visibly brighter
  than detuned.
- Mobile/tablet → tuner visible, touch-drag works, page scroll intact except
  during an active knob drag.
- Particle count reduced; smoother on mobile.
- `prefers-reduced-motion` → static field, locked tuner, no spin.

## Out of scope
- Scroll snap (separate exploration).
- Tuner decorative buttons remain non-functional.
