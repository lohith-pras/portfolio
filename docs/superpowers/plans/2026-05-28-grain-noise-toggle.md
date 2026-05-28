# Grain Noise Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a navbar toggle that starts with shader grain on ("too noisy") and filters it off with a static-burst animation, referencing the signal-processing metaphor of noise removal.

**Architecture:** A new `GrainContext` holds `grainEnabled` (default `true`, no persistence). `GrainProvider` wraps the layout. `NavbarDesktop` reads the context to render a toggle button between the Life link and the divider. `ShaderCanvas` reads the context to set the `grain` prop and plays a framer-motion burst overlay animation when grain is turned off.

**Tech Stack:** React context, framer-motion v12 (`useAnimate`), SVG `feTurbulence` filter, Tailwind CSS, TypeScript, Next.js App Router

**Spec:** `docs/superpowers/specs/2026-05-28-grain-noise-toggle-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/GrainContext.tsx` | Context value, `GrainProvider`, `useGrain` hook |
| Modify | `src/app/[locale]/layout.tsx` | Wrap children with `GrainProvider` |
| Modify | `src/components/NavbarDesktop.tsx` | Toggle button between Life and divider |
| Modify | `src/components/ShaderCanvas.tsx` | Read `grainEnabled`, burst overlay animation |

---

### Task 1: Create GrainContext

**Files:**
- Create: `src/components/GrainContext.tsx`

- [ ] **Step 1: Create the context file**

Create `src/components/GrainContext.tsx` with this exact content:

```tsx
'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type GrainContextValue = {
  grainEnabled: boolean
  toggleGrain: () => void
}

const GrainContext = createContext<GrainContextValue | null>(null)

export function GrainProvider({ children }: { children: ReactNode }) {
  const [grainEnabled, setGrainEnabled] = useState(true)

  function toggleGrain() {
    setGrainEnabled((prev) => !prev)
  }

  return (
    <GrainContext.Provider value={{ grainEnabled, toggleGrain }}>
      {children}
    </GrainContext.Provider>
  )
}

export function useGrain() {
  const ctx = useContext(GrainContext)
  if (!ctx) throw new Error('useGrain must be used within GrainProvider')
  return ctx
}
```

- [ ] **Step 2: Verify types pass**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && rtk tsc --noEmit
```

Expected: no errors (or only pre-existing errors unrelated to this file).

- [ ] **Step 3: Commit**

```bash
rtk git add src/components/GrainContext.tsx && rtk git commit -m "feat: add GrainContext for grain toggle state"
```

---

### Task 2: Wire GrainProvider into layout

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Add the import**

In `src/app/[locale]/layout.tsx`, add this import after the existing imports:

```tsx
import { GrainProvider } from '@/components/GrainContext'
```

- [ ] **Step 2: Wrap content with GrainProvider**

In the `return` statement, wrap the content inside `NextIntlClientProvider`:

Before:
```tsx
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NavbarDesktop />
      <NavbarMobile />
      <PageTransition>
        {children}
      </PageTransition>
    </NextIntlClientProvider>
  )
```

After:
```tsx
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <GrainProvider>
        <NavbarDesktop />
        <NavbarMobile />
        <PageTransition>
          {children}
        </PageTransition>
      </GrainProvider>
    </NextIntlClientProvider>
  )
```

- [ ] **Step 3: Verify types pass**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && rtk tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
rtk git add src/app/[locale]/layout.tsx && rtk git commit -m "feat: wrap layout with GrainProvider"
```

---

### Task 3: Add toggle button to NavbarDesktop

**Files:**
- Modify: `src/components/NavbarDesktop.tsx`

- [ ] **Step 1: Add the useGrain import**

In `src/components/NavbarDesktop.tsx`, add this import after the existing imports:

```tsx
import { useGrain } from '@/components/GrainContext'
```

- [ ] **Step 2: Read context in the component**

Inside `NavbarDesktop`, after the existing `const isLife = ...` line, add:

```tsx
const { grainEnabled, toggleGrain } = useGrain()
```

- [ ] **Step 3: Add the toggle button**

In the JSX, the right-side group currently starts with the Life link. Insert the button *before* the Life link, inside the `<div className="flex items-center gap-6">`:

```tsx
<button
  type="button"
  onClick={toggleGrain}
  className="font-mono text-xs text-foreground/40 hover:text-foreground/70 transition-colors bg-transparent border-none p-0 cursor-pointer"
  aria-label={grainEnabled ? 'Disable grain texture' : 'Enable grain texture'}
>
  {grainEnabled ? 'too noisy' : 'filtered'}
</button>
```

The full right-side group should look like:

```tsx
<div className="flex items-center gap-6">
  <button
    type="button"
    onClick={toggleGrain}
    className="font-mono text-xs text-foreground/40 hover:text-foreground/70 transition-colors bg-transparent border-none p-0 cursor-pointer"
    aria-label={grainEnabled ? 'Disable grain texture' : 'Enable grain texture'}
  >
    {grainEnabled ? 'too noisy' : 'filtered'}
  </button>
  <Link
    href="/life"
    className="relative flex items-center gap-2 font-mono text-sm text-foreground/80 hover:text-accent transition-colors pb-1"
  >
    ...
  </Link>
  <div className="w-px h-4 bg-white/20" />
  ...social icons...
</div>
```

- [ ] **Step 4: Verify types pass**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && rtk tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
rtk git add src/components/NavbarDesktop.tsx && rtk git commit -m "feat: add grain toggle button to desktop navbar"
```

---

### Task 4: Wire grain prop + burst overlay into ShaderCanvas

**Files:**
- Modify: `src/components/ShaderCanvas.tsx`

This is the most involved task. The changes are:

1. Import `useGrain` and framer-motion's `useAnimate`
2. Add `useRef` for tracking previous grain state
3. Add `useEffect` that triggers the burst animation when grain turns off
4. Change `grain="off"` to `grain={grainEnabled ? "on" : "off"}`
5. Add a hidden SVG with the `feTurbulence` filter definition
6. Add the burst overlay div inside the canvas wrapper

- [ ] **Step 1: Add imports**

Update the import block in `src/components/ShaderCanvas.tsx`. Change:

```tsx
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '@/lib/gsap'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
```

To:

```tsx
import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { useAnimate } from 'framer-motion'
import { ScrollTrigger } from '@/lib/gsap'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import { useGrain } from '@/components/GrainContext'
```

- [ ] **Step 2: Add grain state and burst animation logic**

Inside `ShaderCanvas`, after the existing `const containerRef = useRef<HTMLDivElement>(null)` line, add:

```tsx
const { grainEnabled } = useGrain()
const [overlayScope, animateOverlay] = useAnimate()
const prevGrainRef = useRef(true)

useEffect(() => {
  const prev = prevGrainRef.current
  prevGrainRef.current = grainEnabled

  if (prev === true && grainEnabled === false && overlayScope.current) {
    animateOverlay(
      overlayScope.current,
      { opacity: [0, 0.65, 0.65, 0] },
      { duration: 0.5, times: [0, 0.16, 0.58, 1], ease: 'easeOut' }
    )
  }
}, [grainEnabled, animateOverlay])
```

- [ ] **Step 3: Update the grain prop on ShaderGradient**

Find this line:

```tsx
grain="off"
```

Change it to:

```tsx
grain={grainEnabled ? 'on' : 'off'}
```

- [ ] **Step 4: Add the SVG filter and burst overlay to the JSX**

In the non-reduced-motion return, inside the outer `<div ref={containerRef} ...>`, add the SVG and overlay *after* `</ShaderGradientCanvas>`:

```tsx
    <div
      ref={containerRef}
      id="shader-canvas"
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      aria-hidden="true"
      style={{ opacity: 1 }}
    >
      <ShaderGradientCanvas ...>
        <ShaderGradient
          ...
          grain={grainEnabled ? 'on' : 'off'}
        />
      </ShaderGradientCanvas>

      {/* SVG filter for burst overlay noise texture */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <filter id="grain-noise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* Burst overlay — framer-motion animates opacity during grain-off transition */}
      <div
        ref={overlayScope}
        className="fixed inset-0 pointer-events-none opacity-0"
        style={{ filter: 'url(#grain-noise)', zIndex: 1 }}
        aria-hidden="true"
      />
    </div>
```

- [ ] **Step 5: Verify types pass**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && rtk tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Visual verification**

Start the dev server if not running:

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && npm run dev
```

Open `http://localhost:3000` and verify:

1. Navbar shows "too noisy" in small monospace text, slightly dim, left of "Life"
2. Shader gradient has visible grain texture on load
3. Click "too noisy" → static burst appears and clears → gradient is smooth → label changes to "filtered"
4. Click "filtered" → grain returns immediately → label returns to "too noisy"
5. Refresh → grain is back on (no persistence)

- [ ] **Step 7: Commit**

```bash
rtk git add src/components/ShaderCanvas.tsx && rtk git commit -m "feat: add burst overlay and grain toggle to ShaderCanvas"
```
