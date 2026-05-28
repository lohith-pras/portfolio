# ChibiCharacter Component — Design Spec

**Date:** 2026-05-28  
**Status:** Approved

---

## Overview

A React Three Fiber chibi character displayed in the About section's right-side glass card, replacing `AvatarScene`. Four pose textures swap based on interaction and lifecycle events. Continuous floating idle animation via `useFrame`. Mouse parallax for depth.

---

## Assets

Place in `/public/chibi/`:

| File | Pose | Trigger |
|------|------|---------|
| `idle.png` | Neutral standing | Default |
| `wave.png` | Waving | Page load (2s) |
| `point.png` | Pointing | Hover |
| `celebrate.png` | Jumping/celebrate | About section enters viewport (1.5s) |

---

## File Structure

```
src/
  components/chibi/
    ChibiCharacter.tsx   ← R3F mesh, useFrame, texture swap, parallax
    ChibiCanvas.tsx      ← Canvas wrapper, Suspense, error boundary, dynamic import
  hooks/
    useChibiAnimation.ts ← pose state machine, timers, IntersectionObserver
```

---

## State Machine (`useChibiAnimation`)

```ts
type ChibiPose = 'idle' | 'wave' | 'point' | 'celebrate'
```

**Priority (highest → lowest):** `celebrate > point > wave > idle`

### Triggers

| Event | Transition | Duration |
|-------|-----------|----------|
| Component mount | `idle → wave → idle` | wave lasts 2000ms |
| Hover enter | `* → point` | blocked if celebrate active |
| Hover leave | `point → idle` | immediate |
| `#about` enters viewport | `* → celebrate → idle` | celebrate lasts 1500ms; fires once |

### Hook signature

```ts
interface ChibiAnimationState {
  pose: ChibiPose
  onPointerEnter: () => void
  onPointerLeave: () => void
}

function useChibiAnimation(sectionId: string): ChibiAnimationState
```

IntersectionObserver targets `document.querySelector(sectionId)` with `threshold: 0.3`, `once: true`.

Timers managed with `useRef` to avoid stale closure issues. Cleanup on unmount.

---

## ChibiCharacter (mesh)

**Geometry:** `PlaneGeometry(1.8, 2.4)` — approximately 280px tall at camera distance.

**Material:** `MeshBasicMaterial` — unlit, preserves chibi art colours.

**Textures:** `useTexture` preloads all 4 paths on mount via array form. Active `map` set by current pose.

### useFrame loop

```ts
// Float bob
mesh.position.y = baseY + Math.sin(clock.elapsedTime * 0.8) * 0.05

// Slight rotation
mesh.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.02

// Mouse parallax (lerp toward target)
mesh.position.x = lerp(mesh.position.x, mouse.x * 0.15, 0.05)
mesh.position.y += lerp(0, mouse.y * 0.15, 0.05)  // additive to bob
```

Mouse position tracked via `window` `mousemove` event in a `useEffect`, stored in a `useRef` (avoids re-renders). Values normalised to `[-1, 1]`.

---

## ChibiCanvas (wrapper)

```tsx
<Canvas
  camera={{ position: [0, 0, 3], fov: 40 }}
  gl={{ alpha: true, antialias: true }}
  style={{ background: 'transparent' }}
  onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))}
>
  <Suspense fallback={null}>
    <ChibiCharacter />
  </Suspense>
</Canvas>
```

- Error boundary wraps Canvas, returns `null` on WebGL failure (matches `AvatarScene` pattern)
- Exported via `next/dynamic({ ssr: false })` — no SSR
- Full width/height of parent container

---

## AboutSection Integration

Single change to `AboutSection.tsx`:

```tsx
// Before
<AvatarScene />

// After
<ChibiCanvas />
```

`ChibiCanvas` fills the existing `glass` card container (`aspect-square`, `max-w-[400px]`).

---

## TypeScript

- `ChibiPose` union type exported from `useChibiAnimation.ts`
- No `any` — all refs typed (`useRef<THREE.Mesh>`, `useRef<{x:number,y:number}>`)
- Texture array typed via `@react-three/drei`'s `useTexture` overload

---

## Performance

| Concern | Approach |
|---------|---------|
| Texture load | `useTexture([...all 4 paths])` — preloads all on mount |
| WebGL pixel ratio | Capped at 1.5 via `gl.setPixelRatio` |
| Mouse tracking | `useRef` — no state updates per frame |
| WebGL failure | Error boundary → silent `null` |
| Reduced motion | Inherit `useReducedMotion` from parent; skip float + parallax if true |

---

## Out of Scope

- Scroll-based fade (AboutSection's Framer Motion `whileInView` already handles section visibility)
- GSAP for any animation (all motion via `useFrame`)
- Sound effects
