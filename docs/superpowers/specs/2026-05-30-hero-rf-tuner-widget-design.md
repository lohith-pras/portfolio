# Hero RF Tuner Widget — Design

**Date:** 2026-05-30
**Status:** Approved (brainstorming) → ready for implementation plan
**Scope:** Desktop only. A 3D "tune the signal" widget in the hero section.

## Concept

A skeuomorphic hardware device sitting in the hero, bottom-right (opposite the
name). The user grabs a milled-aluminum knob and rotates it to "tune" — like
dialing in the RF frequency on an old TV. The device's screen crossfades from
RF static (snow) into a clean glowing waveform when the knob hits a single
sweet-spot frequency. A magnetic snap pulls the knob to lock when close.

The knob is **functional**: its tune value drives the hero's EM-wave background
(`SignalField`). Detuned = an incoherent, noisy particle field + RF-static screen;
tuned to the sweet-spot = a clean coherent standing wave in the background + a
clear waveform on the screen. Screen and background reflect the **same** state.
This widget **replaces** the old `too noisy / filtered` grain toggle as the hero's
interactive control.

## Locked Decisions

| # | Decision |
|---|----------|
| Purpose | Functional control. Knob `tune` (0–1 clarity) drives the `SignalField` background coherence AND the screen static↔waveform together. |
| Fidelity | Full 3D device — modeled body, bezel, screen, physical knob, buttons, lighting. |
| Build | Procedural R3F geometry (no GLTF / Blender asset). Blender MCP not available; procedural confirmed. |
| Interaction | Click-drag circular rotation of the knob. Single sweet-spot + magnetic snap. |
| Placement | Hero bottom-right, opposite the name (shared `justify-end` bottom row). Desktop only. |
| Screen content | Minimal — animated waveform + `FREQ` readout. No weather flavor. |
| Color | Screen glow = site accent `#FF1E00`. |
| Background link | New `uCoherence` uniform on `SignalField`; driven by knob `clarity` via a shared `TunerContext`. |
| Grain toggle | Removed. The `too noisy / filtered` button in `HeroSection` is deleted; tuner is the new hero control. |
| Idle behavior | Tuner screen animates while detuned/interacting; quiet once locked. `SignalField` keeps its own existing render loop. |

## Architecture & Files

Mirrors the existing `src/components/chibi/` View pattern. New folder
`src/components/tuner/`:

| File | Role |
|------|------|
| `TunerView.tsx` | Tracked `<div>` + `<View track>` wrapper + error boundary. Same shape as `ChibiView`. |
| `TunerDevice.tsx` | 3D scene: device body, bezel, knob, buttons, screen, lights, camera. Owns tuning state. |
| `TunerScreen.tsx` | Screen plane: `ShaderMaterial` (static↔waveform) + drei `<Text>` FREQ readout. |
| `tunerScreen.glsl.ts` | Fragment (+ vertex passthrough) shader source for the screen. Inline-able if small. |
| `useTuner.ts` | Knob drag → angle → `clarity` (0–1); magnetic snap; demand-render invalidate control. |
| `TunerContext.tsx` | Shared state: `{ tune: number (0–1), setTune }`. Knob writes; `SignalField` reads. Same pattern as `GrainContext`. |

**Edited file:** `src/components/SignalField.tsx` — add `uCoherence` uniform, read
`tune` from `TunerContext`, drive coherence in the shader (see SignalField
Integration). Existing scroll/mouse/converge behavior untouched.

**Wiring:**
- `HeroSection`: **remove** the `too noisy / filtered` grain toggle button and its
  `useGrain` usage. Add a bottom-right container `div` (`hidden lg:block`) in the
  same bottom row as the name; `TunerView` renders into it.
- Wrap hero (or the existing provider scope where `GrainProvider` lives) with
  `TunerProvider` so both `TunerView` and `SignalField` share it.
- The R3F `<Canvas>` root (`R3FRoot.tsx`) and its `<View.Port />` are unchanged.
- Name stays bottom-left; widget bottom-right.
- `GrainContext` / `GrainProvider` are left in place (SignalField still imports
  `grainEnabled` as a no-op); fully ripping out grain is out of scope.

## Geometry & Lighting

Local units, landscape slab (reference proportions):

- **Body**: `RoundedBox` ~`[3.2, 1.7, 0.35]`, radius ~0.12. Dark matte
  (`#161616`, roughness ~0.85, low metalness). Beveled edge catches key light.
- **Screen recess/bezel**: inset darker frame on the left ~60% of the face.
- **Screen**: flat plane ~`[1.7, 1.15]` set into the recess (material per next section).
- **Knob**: `Cylinder` ~r0.42 h0.18, right side. Milled-aluminum: metalness ~0.9 +
  radial-groove normal/roughness texture (procedural canvas or small tiled texture)
  so concentric rings catch light when turning. Accent dot (`#FF1E00`) near top edge
  marks rotation.
- **Buttons**: 3 small `RoundedBox` stacked far right (TMP/RAD/SYS as decoration,
  non-functional). Top one faintly accent-lit.
- **Labels**: skip, or one tiny drei `<Text>` only. Minimal.

**Lighting** (local, inside the View):
- Key `directionalLight` upper-left, soft.
- Low `ambientLight` fill — keep blacks rich, not crushed.
- Lightweight `Environment` (drei) **only** for the knob's metal reflection;
  drop to a cheap `envMapIntensity` if Environment is too heavy.

**Camera**: `PerspectiveCamera`, fov ~35, slight 3-quarter downward tilt so the
device reads as a physical object on a surface, not flat-on.

## Screen Shader

Single `ShaderMaterial` on the screen plane.

**Uniforms:** `uTime`, `uClarity` (0=detuned, 1=locked), `uColor` (`#FF1E00`).

Fragment composes layers, mixed by `uClarity`:

1. **Static** — animated value-noise (hash) per pixel. Full at `clarity=0`,
   fades out as clarity→1. RF snow.
2. **Waveform** — sine across screen (`sin(uv.x*freq + uTime*small)`), drawn via
   distance-to-curve → glow. Sharp/bright at clarity=1; buried in noise and
   vertically jittered at low clarity.
3. **CRT dressing** — faint horizontal scanlines, subtle vignette, slight
   chromatic wobble at low clarity. Optional faint accent grid background.

Crossfade: `clarity` lowers noise, raises waveform sharpness/brightness, reduces
jitter. At lock → near-pure clean waveform on a dark grid.

**FREQ readout**: drei `<Text>` (mono — reuse display font if loadable, else drei
default) overlaid bottom-left of the screen. Value = `floor(map(angle → 88.0–108.0))`,
e.g. `FREQ 104.7`. Color `#FF1E00`, dims slightly under heavy static. Crisp
because it's real text geometry, not baked in the shader.

## Interaction & Tuning

**Knob drag (circular):**
- `onPointerDown` on knob → capture pointer. Track pointer angle around knob
  center; angle delta per move accumulates into `knobAngle`.
- `knobAngle` clamped to a usable arc (e.g. ±150°) so the range has a real
  sweet-spot, no infinite spin.
- `clarity = 1 - smoothstep(0, tolerance, abs(knobAngle - sweetSpot))`. One sweet-spot.
- **Magnetic snap**: on `pointerUp`, if within `snapRange` of `sweetSpot`,
  spring/lerp the angle to the exact sweet-spot and clarity→1. Else stays put.
- Knob mesh `rotation.z = knobAngle`; accent dot rides along.
- Cursor: `grab` / `grabbing` on the tracked div.

**`clarity` is the single shared value** — it drives, every frame:
1. screen `uClarity` (static↔waveform), and
2. `SignalField` `uCoherence` (via `TunerContext.tune`).

So tuning the knob simultaneously clears the screen and resolves the background.

## SignalField Integration

The knob controls the hero's existing particle EM-wave background.

- **Shared state**: `TunerContext` exposes `tune` (0–1, = knob `clarity`).
  `useTuner` calls `setTune(clarity)` on change. `SignalField` reads `tune`.
- **New uniform**: add `uCoherence` (0–1) to `SignalField`'s uniforms. Each frame,
  lerp the live uniform toward `tune` (smoothing) so background reacts smoothly.
- **Shader effect** (in `SignalField` fragment/vertex):
  - `uCoherence → 0`: inject per-particle phase noise / jitter into `waveHeight`
    so the two-source interference scrambles into an incoherent, noisy field.
  - `uCoherence → 1`: zero noise → the clean standing-wave interference pattern.
  - Optionally bias color/brightness toward the brighter palette at full coherence.
- **Render gating**: `SignalField` already invalidates while in view (its
  IntersectionObserver + `uTime` loop), so coherence changes render without new
  plumbing. No extra always-on loop added.
- **Independence**: scroll (`uDisperse`), mouse parallax, and converge load anim
  are untouched and compose on top of coherence.

## Performance

Respect `frameloop="demand"` via `useThree().invalidate`:
- Run the animation loop (drive `uTime`, knob spring) **only while** detuned OR
  interacting.
- Keep invalidating each frame while `interacting` (pointer down) OR `clarity < ~0.99`.
- Once locked (`clarity≈1` and idle) → stop invalidating; the clean waveform
  holds as a static frame. Re-arm on next `pointerEnter` / `pointerDown`.
- Result: 0 render cost in the hero once the tuner is solved and untouched.

**Start state**: detuned (full static), knob off sweet-spot — invites tuning.
Animates from load until solved, then quiet.

**Desktop only**: container `hidden lg:block`; `TunerView` not mounted below `lg`.
No mobile/touch handling built.

**Reduced motion**: respect `prefers-reduced-motion` → start near-locked, skip
ambient static animation.

## Out of Scope

- Mobile / touch layout and interaction.
- Weather/status flavor or live data on the screen.
- GLTF / Blender asset pipeline (no Blender MCP available; procedural confirmed).
- Functional buttons (TMP/RAD/SYS are decoration only).
- Full removal of `GrainContext`/`GrainProvider` (button removed; provider stays as no-op).

## Success Criteria

1. On desktop hero, a 3D device renders bottom-right, opposite the name, in the accent palette.
2. Dragging the knob circularly rotates it and crossfades the screen between static and a clean waveform.
3. A single sweet-spot locks the screen clear; magnetic snap assists near it.
4. The same knob value visibly drives the `SignalField` background: detuned = noisy/incoherent field, sweet-spot = clean coherent standing wave.
5. `FREQ` readout updates with the knob angle and stays crisp.
6. The `too noisy / filtered` grain toggle is gone from the hero.
7. Once locked and idle, the tuner screen stops re-rendering on its own; re-arms on interaction.
8. Not mounted below the `lg` breakpoint; `prefers-reduced-motion` starts near-locked.
