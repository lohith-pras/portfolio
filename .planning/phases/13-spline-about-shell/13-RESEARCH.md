# Phase 13: SplineAbout Component Shell — Research

## Goal
Build the `SplineAbout.tsx` client component and the `StaticIllustrationFallback.tsx` mobile fallback. Wire the desktop-only conditional render into `AboutSection.tsx`. Both components must work without the final published Spline scene URL — Phase 14 wires the actual scene.

---

## Package Verification

### `@splinetool/react-spline`
- **Current version**: `4.1.0` (verified via `npm view`)
- **`/next` subpath**: Confirmed exported at `./dist/react-spline-next.js` with types at `./dist/next/SplineNext.d.ts`
- **Installation**: `npm install @splinetool/react-spline @splinetool/runtime`

### `@splinetool/runtime`
- **Current version**: `1.12.95`
- Must be pinned explicitly to avoid surprise majors alongside `react-spline`

### Import Pattern for App Router
```tsx
// ALWAYS use the /next subpath in RSC contexts and dynamic imports
import SplineNext from '@splinetool/react-spline/next'
```

---

## Conditional Render Strategy

### Desktop Gate: `useIsDesktop` custom hook
- Uses `window.matchMedia('(min-width: 768px)')` with a ResizeObserver/event listener
- Returns `true` when viewport ≥ 768px (Tailwind `md:` breakpoint)
- SSR-safe: returns `false` on first render (server), then hydrates on client
- **Why not Tailwind `hidden md:block`?** The CLAUDE.md "What NOT To Use" table explicitly prohibits CSS hide for Spline — the runtime still loads and the scene runs. Conditional render is mandatory.

### Component Architecture
```
AboutSection.tsx (RSC or client depending on translation usage)
  ├── Left column: text (descriptor + bio paragraphs)
  └── Right column: illustration slot
        ├── [desktop, ≥768px] → SplineAbout.tsx (dynamic import, ssr: false)
        └── [mobile, <768px]  → StaticIllustrationFallback.tsx (plain SVG/JSX)
```

### Dynamic Import Pattern
```tsx
// SplineAbout.tsx — 'use client'
import dynamic from 'next/dynamic'
import SplineNext from '@splinetool/react-spline/next'
// OR use dynamic import for the Spline viewer itself:
const Spline = dynamic(() => import('@splinetool/react-spline/next'), { ssr: false })
```

The `@splinetool/react-spline/next` export already wraps with a Next.js-compatible Suspense boundary and SSR guard — using it inside a `dynamic(..., { ssr: false })` is belt-and-suspenders but safe. A simpler approach: import `SplineNext` directly from `@splinetool/react-spline/next` inside a `'use client'` component — it already handles SSR correctly.

---

## SplineAbout.tsx Design

### Props
```tsx
interface SplineAboutProps {
  sceneUrl?: string  // Optional in Phase 13 — placeholder accepted
  onLoad?: (spline: unknown) => void
  className?: string
}
```

### Placeholder Scene URL
For Phase 13 smoke-test without a published scene, use Spline's official sample scene:
```
https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode
```
This gives a real rendered 3D object in the About section so layout and sizing can be reviewed before the actual character is published.

### ScrollTrigger Shell (Phase 13 prep)
The `onLoad` callback captures the `spline` application instance:
```tsx
const splineRef = useRef<unknown>(null)
const handleLoad = (spline: unknown) => {
  splineRef.current = spline
  // ScrollTrigger wiring happens in Phase 14 — shell only
}
```

### Sizing
```tsx
className="w-full h-full aspect-square rounded-2xl overflow-hidden"
```

---

## StaticIllustrationFallback.tsx Design

### Visual Style Match
Must match the Spline character's visual language:
- Palette: `#FF4500` (electric orange) → `#C0001A` (crimson) on dark `#101010`
- Stylized abstract figure (geometric/low-poly human silhouette, not realistic)
- Slight glow or gradient aura to suggest the warm 3D lighting from the Spline character

### Implementation Options
**Option A — SVG inline**: Full control, zero network request, works on all devices. Preferred.
**Option B — static PNG/WebP**: Faster to produce but requires an extra asset file.

**Decision**: SVG inline — zero deps, perfectly sharp on retina, fully styled via Tailwind/CSS vars.

### SVG Design Approach
```svg
<!-- Geometric human silhouette with warm gradient aura -->
<svg viewBox="0 0 200 200">
  <defs>
    <radialGradient id="aura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FF4500" stopOpacity="0.3"/>
      <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="100" cy="100" r="90" fill="url(#aura)"/>
  <!-- Stylized figure geometry: head, torso, arms... -->
</svg>
```

---

## `useIsDesktop` Hook

```tsx
// src/hooks/useIsDesktop.ts
'use client'
import { useState, useEffect } from 'react'

export function useIsDesktop(breakpoint = 768): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`)
    setIsDesktop(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return isDesktop
}
```

SSR behavior: `useState(false)` ensures server renders `false` (no Spline), which is the safe default — hydration then flips to `true` on desktop clients.

---

## AboutSection Refactoring

Current `AboutSection.tsx` is **not** a client component — it uses `useTranslations` from next-intl which is server-compatible. Adding `useIsDesktop` (which uses `useEffect`) requires making the illustration slot a client component.

**Strategy**: Keep `AboutSection.tsx` as a server component. Extract the illustration slot into a `AboutIllustration.tsx` client component that contains the `useIsDesktop` hook and conditionally renders `SplineAbout` vs `StaticIllustrationFallback`.

```
AboutSection.tsx (RSC — keeps useTranslations server call)
  └── <AboutIllustration /> (client — owns useIsDesktop + conditional render)
        ├── isDesktop → <SplineAbout sceneUrl={PLACEHOLDER_URL} />
        └── !isDesktop → <StaticIllustrationFallback />
```

---

## Lighthouse / Performance Constraints

- `@splinetool/runtime` is large (~300–500KB). The `dynamic({ ssr: false })` or `/next` subpath import ensures it is never shipped to mobile clients.
- Verify Lighthouse mobile ≥ 85 after Phase 13 by running `npm run build` and checking route sizes — `@splinetool/runtime` should NOT appear in mobile bundle analysis.
- The conditional render gate must be a React-level condition (`if (!isDesktop) return <Fallback />`), NOT a CSS utility — per CLAUDE.md constraint.

---

## Verification Architecture (Nyquist)

**Static**:
- `npm run build` — must succeed, all routes compile
- `npm run type-check` — SplineAbout and StaticIllustrationFallback must be type-clean

**Manual**:
1. Desktop viewport (≥768px): About section shows `SplineAbout` with placeholder scene
2. Mobile viewport (<768px): About section shows `StaticIllustrationFallback` — DevTools Network tab shows **no** `@splinetool/runtime` request
3. Responsive resize: flipping viewport size while page is open correctly swaps between components
