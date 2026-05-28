# Design Spec: 3D Animated Avatar — About Section

**Date:** 2026-05-28  
**Status:** Approved

---

## Goal

Replace the current SVG placeholder in the About section's glass card with a personalized, animated 3D chibi avatar built from a Ready Player Me GLB, rendered via React Three Fiber.

---

## Architecture

Three files added/modified:

```
src/components/
  AvatarScene.tsx      ← Three.js Canvas + scene setup (new)
  AvatarModel.tsx      ← RPM GLB loader + animation state machine (new)
  AboutSection.tsx     ← swap SVG placeholder for <AvatarScene> (modified)
src/lib/
  avatar.ts            ← avatar URL + animation CDN constants (new)
```

`AvatarScene` is a `'use client'` component, dynamically imported in `AboutSection` via `next/dynamic` with `ssr: false`. This prevents Three.js from running server-side. It renders a `<Canvas>` inside the existing `aspect-square` glass card div, replacing the SVG placeholder entirely.

---

## Avatar Source

- Created at [readyplayer.me](https://readyplayer.me) using a selfie or manual customization
- Format: half-body or full-body GLB (full-body preferred; camera frames upper body)
- Avatar URL stored in `src/lib/avatar.ts` as a constant — easy to swap

```ts
// src/lib/avatar.ts
export const AVATAR_URL = 'https://models.readyplayer.me/<id>.glb?morphTargets=ARKit'
export const IDLE_ANIMATION_URL = 'https://models.readyplayer.me/animations/idle.glb'
export const WAVE_ANIMATION_URL = 'https://models.readyplayer.me/animations/wave.glb'
```

---

## 3D Scene

**Canvas config:**
- `gl={{ alpha: true, antialias: true }}` — transparent background, smooth edges
- `camera={{ position: [0, 0.3, 2.2], fov: 35 }}` — slightly elevated, narrow FOV for portrait framing
- `style={{ width: '100%', height: '100%' }}` fills the existing glass card

**Lighting:**
- `ambientLight` intensity `0.6`
- `directionalLight` from upper-left, intensity `1.2`
- No environment map — keeps bundle lean

**Controls:** None. Camera is fixed. Character centered at origin, scaled to fill ~80% of card height.

---

## Animation System

Two animation clips loaded from RPM's public animation CDN (pre-rigged for RPM skeletons, no retargeting needed):

| Clip | URL | Playback |
|------|-----|----------|
| `idle` | `…/animations/idle.glb` | Loop, plays immediately on mount |
| `wave` | `…/animations/wave.glb` | One-shot, triggered on section enter |

**State machine:**

1. Mount → play `idle` (loop, crossfade 0.5s)
2. Section scrolls into view (detected via Framer Motion `useInView`) → crossfade to `wave` (0.3s)
3. `wave` finishes → crossfade back to `idle` (0.3s)
4. Wave only fires once per page load

`useAnimations` from `@react-three/drei` manages clip switching. The `inView` boolean is detected outside the Canvas (Framer Motion ref on the glass card div) and passed as a prop into `AvatarModel`.

---

## Loading & SSR

- `AvatarScene` uses `next/dynamic({ ssr: false })` — Three.js never executes on the server
- `<Suspense>` wraps `AvatarModel` inside the Canvas; while GLBs load, the existing glass card gradient is visible (no layout shift)
- `useGLTF.preload(AVATAR_URL)` called at module level in `AvatarScene` to begin fetching early
- All three GLBs (avatar, idle, wave) are fetched from RPM CDN at runtime — no files bundled in `/public`

---

## Accessibility & Reduced Motion

- `useReducedMotion()` (already used in `AboutSection`) passed into `AvatarModel`
- If true: idle animation frozen at frame 0, wave never triggers
- Canvas itself is decorative; `aria-hidden="true"` on the wrapper

---

## Success Criteria

1. Avatar renders in the glass card on desktop and mobile
2. Idle animation plays on load with no jank
3. Wave animation fires once when section scrolls into view
4. No SSR errors (canvas only mounts client-side)
5. Glass card gradient visible during load (no blank flash)
6. `prefers-reduced-motion` disables all animation
