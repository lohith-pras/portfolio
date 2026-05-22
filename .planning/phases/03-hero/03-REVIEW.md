---
phase: 03-hero
reviewed: 2026-05-22T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/components/ShaderCanvas.tsx
  - src/components/HeroTitle.tsx
  - src/components/HeroSection.tsx
  - src/components/HeroScrollFade.tsx
  - src/app/[locale]/page.tsx
findings:
  critical: 2
  warning: 3
  info: 2
  total: 7
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-05-22T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files covering the Hero section implementation were reviewed: the WebGL shader gradient canvas, GSAP scramble title animation, hero layout, scroll-fade effect, and the page entry point. The code is generally well-structured and comments are accurate. However, two blockers were found: a duplicate `gsap.registerPlugin(ScrambleTextPlugin)` call that directly violates the project's own architecture rule (and can cause scroll triggers to break in strict mode), and `HeroScrollFade` using raw `useEffect` instead of `useGSAP` — the exact anti-pattern documented in `CLAUDE.md` as forbidden. Three warnings cover a broken scrub pattern, an unused import, and an unused `index` variable. Two info items cover minor style issues.

---

## Critical Issues

### CR-01: Duplicate `gsap.registerPlugin` Call Violates Architecture Contract and Risks Double-Registration

**File:** `src/components/HeroTitle.tsx:26-28`

**Issue:** `@/lib/gsap` already registers `ScrambleTextPlugin` at module level (line 12 of `src/lib/gsap.ts`). `HeroTitle.tsx` imports the already-registered plugin and then conditionally re-registers it:

```ts
// HeroTitle.tsx lines 25-28
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrambleTextPlugin)
}
```

`src/lib/gsap.ts` comment explicitly states: *"Registering inside a hook (useEffect/useGSAP) re-registers every render — PITFALL."* The same principle applies to module-level code in component files: when the component module is evaluated (potentially multiple times across hot reloads, or if the module graph is split), the plugin gets registered again against a GSAP instance that may differ from the one `lib/gsap.ts` registered against. GSAP treats duplicate `registerPlugin` calls as no-ops on the same instance, but if bundler code-splitting causes two GSAP instances to exist in the same page (a known Next.js tree-shaking edge case), the second registration lands on the wrong instance. This is also contradicted by the comment on line 25 itself ("useGSAP must be registered to run correctly with React 19"), which is inaccurate — `useGSAP` hook registration is separate from plugin registration. The comment is misleading noise beside genuinely problematic code.

**Fix:** Delete lines 25-28 from `HeroTitle.tsx` entirely. Plugin registration is already handled centrally in `@/lib/gsap`:

```ts
// Remove this block completely — ScrambleTextPlugin is registered in @/lib/gsap
// if (typeof window !== 'undefined') {
//   gsap.registerPlugin(ScrambleTextPlugin)
// }
```

---

### CR-02: `HeroScrollFade` Uses Raw `useEffect` Instead of `useGSAP` — Forbidden by CLAUDE.md

**File:** `src/components/HeroScrollFade.tsx:30`

**Issue:** `HeroScrollFade` mounts a GSAP `ScrollTrigger` inside a raw `useEffect`. `CLAUDE.md` is explicit: *"Do NOT hand-roll `useLayoutEffect` + `gsap.context()` — use `useGSAP`"* and *"Raw `useEffect` + `gsap.context()`"* is listed in the "What NOT To Use" table. Under React 19 strict-mode development, `useEffect` fires twice (mount → unmount → remount). The cleanup `triggerRef.current?.kill()` inside the effect setup (`line 37`) runs on the first mount's cleanup, but by the time the second mount fires `triggerRef.current` has already been set to `null` by the cleanup function (line 62). This means `ScrollTrigger.create` runs twice, producing two simultaneous scrub triggers on the same `#hero` element. The symptom: the opacity scrub either does nothing or produces a double-speed fade in development, masking real behaviour. In production (no strict mode) this happens to work, making the bug invisible until a HMR cycle or future React change surfaces it.

Additionally, `gsap` is imported from `@/lib/gsap` (line 25) but is never used inside this file — `gsap.` does not appear anywhere in `HeroScrollFade.tsx`. The import is dead.

**Fix:** Rewrite using `useGSAP` from `@gsap/react`, which handles strict-mode double invocation correctly:

```ts
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '@/lib/gsap'     // remove gsap from this import

export function HeroScrollFade() {
  useGSAP(() => {
    const canvas = document.getElementById('shader-canvas') as HTMLElement | null
    const hero = document.getElementById('hero') as HTMLElement | null
    if (!canvas || !hero) return

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const opacity = 1 - self.progress
        if (opacity > 0 && canvas.style.display === 'none') {
          canvas.style.display = ''
        }
        canvas.style.opacity = String(opacity)
        if (opacity <= 0) {
          canvas.style.display = 'none'
        }
      },
    })
    // useGSAP cleans up all ScrollTriggers created in this scope automatically
  }, { dependencies: [] })

  return null
}
```

---

## Warnings

### WR-01: `onUpdate` + Manual Opacity vs. GSAP `scrub` Tween — Behavioural Inconsistency

**File:** `src/components/HeroScrollFade.tsx:43-57`

**Issue:** `scrub: true` is set on the `ScrollTrigger`, which tells GSAP to scrub a tween. But no tween is associated with this trigger — instead, `onUpdate` manually computes opacity from `self.progress`. The `scrub` option on a `ScrollTrigger` that has no linked tween is functionally inert (it does nothing extra); the `onUpdate` callback fires normally regardless. This is not wrong per se, but it is misleading: someone reading this later will expect `scrub` to be driving a GSAP tween, not a hand-rolled `onUpdate`. More concretely, if GSAP's internal scrub reconciliation ever conflicts with direct DOM style writes in `onUpdate` (this can happen when GSAP's ticker catches the tween mid-frame), there can be one-frame flickers. The canonical pattern for scrub-based opacity is a linked tween:

```ts
ScrollTrigger.create({
  trigger: hero,
  start: 'top top',
  end: 'bottom top',
  scrub: true,
  animation: gsap.to(canvas, { opacity: 0, ease: 'none' }),
})
```

This removes the manual `onUpdate`, lets GSAP own the opacity, and the display-none GPU optimisation can be achieved via `onLeave`/`onEnterBack` callbacks instead. The current approach works but carries latent flicker risk and misleads future maintainers.

---

### WR-02: `gsap` Imported but Never Used in `HeroScrollFade`

**File:** `src/components/HeroScrollFade.tsx:25`

**Issue:** Line 25 imports `{ gsap, ScrollTrigger }` from `@/lib/gsap`, but `gsap` is never referenced anywhere in the file. TypeScript's `noUnusedLocals` (if enabled) will flag this as an error at `tsc --noEmit`. Even without that flag, bundlers may or may not tree-shake this; importing from `@/lib/gsap` triggers module-level plugin registration as a side effect (which is desirable), but the `gsap` name binding itself is unused dead code.

**Fix:**

```ts
// Change:
import { gsap, ScrollTrigger } from '@/lib/gsap'

// To:
import { ScrollTrigger } from '@/lib/gsap'
```

---

### WR-03: `HeroScrollFade` DOM IDs Couple Two Components via Global State — Fragile Contract

**File:** `src/components/HeroScrollFade.tsx:31-32`

**Issue:** `HeroScrollFade` reaches across the component tree via `document.getElementById('shader-canvas')` and `document.getElementById('hero')`. These IDs are defined in `ShaderCanvas.tsx:23` and `HeroSection.tsx:43` respectively. If either sibling component is refactored and the ID is renamed or removed, `HeroScrollFade` silently does nothing — no TypeScript error, no runtime error, no warning. The only observable symptom is the scroll fade stops working.

This is a tight implicit coupling disguised as loose DOM coupling. The component comment ("This component renders no visible DOM") acknowledges the side-effect-only design, but the ID-based coupling is still fragile.

**Fix:** Pass refs or element IDs as props to make the dependency explicit and type-checked:

```ts
// Option A — props-based (preferred)
interface HeroScrollFadeProps {
  canvasId?: string
  heroId?: string
}
export function HeroScrollFade({ canvasId = 'shader-canvas', heroId = 'hero' }: HeroScrollFadeProps) { ... }
```

Or export the ID constants from a shared module:

```ts
// src/constants/dom-ids.ts
export const SHADER_CANVAS_ID = 'shader-canvas'
export const HERO_SECTION_ID = 'hero'
```

And import from there in both the producer (`ShaderCanvas`, `HeroSection`) and consumer (`HeroScrollFade`).

---

## Info

### IN-01: Unused `index` Parameter in `CONTACT_LINKS.map`

**File:** `src/components/HeroSection.tsx:53`

**Issue:** The `.map` callback destructures `(link, index)` but `index` is never used inside the callback body — `key={link.href}` is used instead (which is correct). The unused `index` parameter is noise.

**Fix:**

```ts
// Change:
{CONTACT_LINKS.map((link, index) => (

// To:
{CONTACT_LINKS.map((link) => (
```

---

### IN-02: `'use client'` on `src/lib/gsap.ts` Is Incorrect Directive Usage

**File:** `src/lib/gsap.ts:1`

**Issue:** `'use client'` at the top of a non-component utility module is a misuse of the directive. `'use client'` marks a module as a Client Component boundary in the React Server Components model — it is meaningful on component files that render JSX, not on plain utility/re-export modules. On a plain `.ts` file with no JSX, Next.js ignores it at the RSC boundary level (the module is already client-only because GSAP touches `window`). The directive causes no runtime harm, but it is semantically wrong, creates confusion for anyone learning the codebase, and clutters the module graph signal that Next.js uses to determine SSR eligibility.

The correct pattern for a utility module that only runs on the client is to let consumers (which are already `'use client'` components) import it — no directive needed on the utility itself.

**Fix:** Remove the `'use client'` directive from `src/lib/gsap.ts`. The module will only ever be imported by client components; the client boundary is correctly declared at the component level.

---

_Reviewed: 2026-05-22T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
