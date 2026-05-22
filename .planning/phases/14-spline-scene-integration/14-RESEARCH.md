# Phase 14: Spline Scene Integration — Research

## Goal
Wire the published Spline scene URL into `SplineAbout.tsx`, implement the GSAP ScrollTrigger greeting animation that fires exactly once on section scroll-in (with `once: true`), confirm the character returns to its idle loop after the greeting, and validate that the Lighthouse mobile score remains ≥ 85.

---

## Prerequisites from Phase 13
- `SplineAbout.tsx` exists with `onLoad` callback and `splineRef`
- `@splinetool/react-spline@^4.1.0` and `@splinetool/runtime@^1.12.95` installed
- `AboutIllustration.tsx` conditionally renders `SplineAbout` on desktop
- Phase 13 human-verification checkpoint was approved

---

## Spline Scene Design Requirements

The scene needs to be designed in [spline.design](https://spline.design) before the URL can be wired. Key design constraints:

### Character Design
- Stylized, not realistic — matches the geometric/low-poly aesthetic of the `StaticIllustrationFallback` (Phase 13)
- Warm palette: electric orange (`#FF4500`) → crimson (`#C0001A`) ambient light on dark background
- Must have at minimum two **named states/animations** in the Spline editor:
  1. **`greeting`** — a one-time wave, nod, or gesture animation (~1–2 seconds)
  2. **`idle`** — a looping subtle animation (e.g. slow breathing, floating, slight rotation) that plays after greeting

### Event System in Spline
Spline exposes an event system on the app instance returned by `onLoad`. To trigger named animations:
```ts
// Trigger named animation/state on a named object
spline.emitEvent('mouseDown', 'ObjectName')
// OR via variable-driven approach:
spline.setVariable('is_greeting', true)
```

The exact API call depends on how the scene was authored:
- If animations are bound to **mouse events** → use `emitEvent(eventType, objectName)`
- If animations are driven by **variables** → use `setVariable(name, value)`
- If animations are timeline clips → use the `SplineEvent` system

**For this phase, the planner must treat this as a blocker: the exact Spline event API call is scene-specific and depends on how the character is authored.** The executor must be given the specific object name and event type by the user before coding the trigger.

---

## GSAP ScrollTrigger Integration

### Pattern
```tsx
'use client'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

// Inside SplineAbout.tsx, after onLoad:
const containerRef = useRef<HTMLDivElement>(null)
const splineRef = useRef<unknown>(null)
const hasGreeted = useRef(false)

useGSAP(() => {
  if (!splineRef.current) return

  ScrollTrigger.create({
    trigger: containerRef.current,
    start: 'top 80%',         // when top of container hits 80% from viewport top
    once: true,               // fires exactly once — never replays
    onEnter: () => {
      if (hasGreeted.current) return
      hasGreeted.current = true
      // Trigger greeting animation:
      // spline.emitEvent('mouseDown', 'Character') ← scene-specific
      // After greeting duration, idle loop begins automatically (handled in Spline editor)
    },
  })
}, { dependencies: [/* splineRef.current */], scope: containerRef })
```

### `once: true` vs `hasGreeted.current` guard
Both are used for belt-and-suspenders:
- `once: true` in ScrollTrigger kills the trigger after first fire — no repeated `onEnter` calls
- `hasGreeted.current` guards against edge cases where the trigger fires before the Spline instance is fully initialised and `onEnter` runs before `splineRef` is populated

### Timing Coordination
The ScrollTrigger cannot fire until both conditions are true:
1. The Spline scene has loaded (`onLoad` called, `splineRef.current` set)
2. The About section has scrolled into the trigger zone

This creates a race condition if the user scrolls past About before the Spline scene loads. **Solution**: Check `hasGreeted.current` inside `onLoad` — if the section was already scrolled into view before load completed, fire the greeting immediately.

```tsx
const handleLoad = (spline: unknown) => {
  splineRef.current = spline
  // If already scrolled into view before scene loaded, greet immediately
  const rect = containerRef.current?.getBoundingClientRect()
  if (rect && rect.top < window.innerHeight * 0.8) {
    if (!hasGreeted.current) {
      hasGreeted.current = true
      triggerGreeting(spline)
    }
  }
}
```

---

## Lighthouse Mobile Verification

### Target: ≥ 85
The existing Lighthouse budget must be preserved. Risk factors:
1. **Spline runtime bundle size** (~300–500KB) — mitigated by `ssr: false` dynamic import and desktop-only conditional render. Mobile never loads the runtime.
2. **First Contentful Paint regression** — if the Spline Suspense fallback is slow to resolve, it could affect LCP. The skeleton div (`animate-pulse`) must be lightweight.
3. **Main thread blocking** — Spline initialises a WebGL context on first render. Desktop users may see a brief jank if the scene is large. This is acceptable for desktop; mobile is unaffected.

### How to Test
```bash
# Build production bundle
npm run build
npm run start

# Then run Lighthouse CLI against mobile profile:
npx lighthouse http://localhost:3000/en --emulated-form-factor=mobile --output=json | grep '"score"' | head -5
```

Or use Chrome DevTools → Lighthouse → Mobile → Generate Report.

---

## Blocker: Scene URL + Event API

**This phase CANNOT be fully executed without:**
1. A published Spline scene URL (`https://prod.spline.design/XXXX/scene.splinecode`)
2. The exact object name and event type in the Spline scene that triggers the greeting animation

**The plan will include a `checkpoint:human-action` task to collect these from the user before the ScrollTrigger code is written.**

---

## Verification Architecture (Nyquist)

**Static**:
- `npm run build` — must succeed after wiring the real scene URL
- `npm run type-check` — no TypeScript errors

**Manual**:
1. Desktop viewport: Scroll About section into view → greeting animation fires exactly once
2. Scroll back up and re-scroll → greeting does NOT replay (idle loop continues)
3. Mobile viewport: No Spline runtime loaded (Network tab, DevTools)
4. Lighthouse mobile audit → score ≥ 85
