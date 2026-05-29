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

It is a **pure aesthetic toy** — the clear screen reveals no real content, just
a clean waveform + a `FREQ` readout. Delight, not information.

## Locked Decisions

| # | Decision |
|---|----------|
| Purpose | Aesthetic toy. Static resolves to clean waveform. No real info revealed. |
| Fidelity | Full 3D device — modeled body, bezel, screen, physical knob, buttons, lighting. |
| Build | Procedural R3F geometry (no GLTF / Blender asset). |
| Interaction | Click-drag circular rotation of the knob. Single sweet-spot + magnetic snap. |
| Placement | Hero bottom-right, opposite the name (shared `justify-end` bottom row). Desktop only. |
| Screen content | Minimal — animated waveform + `FREQ` readout. No weather flavor. |
| Color | Screen glow = site accent `#FF1E00`. |
| Idle behavior | Animates while detuned/interacting; goes quiet (no render) once locked clear. Demand-friendly. |

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

**Wiring:**
- `HeroSection` adds a bottom-right container `div` (`hidden lg:block`) in the
  same bottom row as the name. `TunerView` renders into it.
- The R3F `<Canvas>` root (`R3FRoot.tsx`) and its `<View.Port />` are unchanged.
- Name stays bottom-left; widget bottom-right.

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
- Real data on the screen (weather, status, live stats).
- GLTF / Blender asset pipeline.
- Functional buttons (TMP/RAD/SYS are decoration only).

## Success Criteria

1. On desktop hero, a 3D device renders bottom-right, opposite the name, in the accent palette.
2. Dragging the knob circularly rotates it and crossfades the screen between static and a clean waveform.
3. A single sweet-spot locks the screen clear; magnetic snap assists near it.
4. `FREQ` readout updates with the knob angle and stays crisp.
5. Once locked and idle, the canvas stops rendering (no continuous cost); re-arms on interaction.
6. Not mounted below the `lg` breakpoint; `prefers-reduced-motion` starts near-locked.
