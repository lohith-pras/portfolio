---
phase: "03"
plan: "hero"
subsystem: "hero"
tags: ["gsap", "shadergradient", "webgl", "scroll-animation", "typescript"]
dependency_graph:
  requires: ["02-static-shell"]
  provides: ["hero-section", "shader-gradient-bg", "scramble-animation", "scroll-fade"]
  affects: ["app/[locale]/page.tsx", "src/components/"]
tech_stack:
  added:
    - "@shadergradient/react@2.4.20"
  patterns:
    - "GSAP ScrambleTextPlugin for character-scramble entry animation"
    - "dynamic() with ssr:false for WebGL client-only components"
    - "GSAP ScrollTrigger scrub for scroll-linked opacity fade"
    - "Separate client HeroScrollFade component preserving Server Component page"
key_files:
  created:
    - "src/components/ShaderCanvas.tsx"
    - "src/components/HeroTitle.tsx"
    - "src/components/HeroSection.tsx"
    - "src/components/HeroScrollFade.tsx"
  modified:
    - "src/app/[locale]/page.tsx"
    - "package.json"
    - "package-lock.json"
decisions:
  - "Used @shadergradient/react@2.4.20 (not shadergradient@1.x — that targets Framer Canvas only)"
  - "HeroScrollFade kept as separate client component so page.tsx stays a Server Component"
  - "useEffect (not useGSAP) for HeroScrollFade — no DOM refs needed, plain ScrollTrigger.create"
  - "ScrambleTextPlugin re-registered client-side guard in HeroTitle (typeof window check) for safety"
  - "ShaderCanvas: waterPlane type with rotationX:50 gives pleasing horizon-perspective gradient"
metrics:
  duration: "2m"
  completed: "2026-05-22T01:04:14Z"
  tasks_completed: 6
  files_changed: 7
---

# Phase 3 Plan: Hero Summary

**One-liner:** WebGL shader gradient with GSAP ScrambleText name reveal and scroll-scrub opacity fade using @shadergradient/react + ScrollTrigger.

## What Was Built

### ShaderCanvas (`src/components/ShaderCanvas.tsx`)
Self-contained WebGL gradient background using `@shadergradient/react`. `ShaderGradientCanvas` + `ShaderGradient` with the locked warm palette (`#FF4500` → `#C0001A` → `#0A0A0A`), `uSpeed: 0.15` for deliberate movement and GPU protection, `powerPreference: "low-power"`, `pixelDensity: 1`. Fixed inset-0 z-0 with pointer-events-none.

### HeroTitle (`src/components/HeroTitle.tsx`)
GSAP `ScrambleTextPlugin` resolves `LOHITH TARIKERE PRASANNA` character-by-character from uppercase scramble in 750ms. Uses `useGSAP` from `@gsap/react` (mandatory with React 19). Accessible: `sr-only h1` renders real name for screen readers; visual `.hero-name` div is `aria-hidden`.

### HeroSection (`src/components/HeroSection.tsx`)
Full-screen section (`#hero`) composing `HeroTitle` + contact row (`lnlohith3@gmail.com`, GitHub, LinkedIn) in Space Mono small text. Animated scroll-down indicator (bounce, desktop-only). Content at z-10 above ShaderCanvas at z-0.

### HeroScrollFade (`src/components/HeroScrollFade.tsx`)
Client-only component that mounts a GSAP `ScrollTrigger` (start: "top top", end: "bottom top", scrub: true). Updates `#shader-canvas` opacity 1→0 in lockstep with scroll progress. Sets `display: none` when opacity reaches 0 to release GPU rendering cycles.

### page.tsx update (`src/app/[locale]/page.tsx`)
`ShaderCanvas` loaded via `dynamic(..., { ssr: false })` — prevents `window is not defined` server error. Renders: `ShaderCanvas` → `HeroScrollFade` → Navbars → `HeroSection` → `AboutSection`.

## Requirements Addressed

- HERO-01: Shader gradient with warm palette and slow movement — DONE
- HERO-02: Full name + contact row in Space Mono — DONE
- HERO-03: GSAP ScrambleText resolves in 600-800ms window (750ms) — DONE
- HERO-04: ScrollTrigger scrubs shader opacity 1→0 as About comes into view — DONE

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Critical functionality] ShaderCanvas wrapped in dynamic() rather than page-level dynamic import**
- **Found during:** Task 6
- **Issue:** `@shadergradient/react` uses WebGL canvas and would crash on SSR. The plan mentioned dynamic import but referenced it as a pattern in ShaderCanvas itself. The correct Next.js App Router pattern is `dynamic()` at the import site in page.tsx, not inside the component.
- **Fix:** `ShaderCanvas` component itself does not use `dynamic()` — it's a plain 'use client' component. `page.tsx` wraps the import with `dynamic(..., { ssr: false })`. This correctly defers WebGL initialization to client hydration.
- **Files modified:** `src/app/[locale]/page.tsx`

**2. [Rule 2 - Missing critical functionality] HeroScrollFade as separate client component**
- **Found during:** Task 6
- **Issue:** Plan suggested wiring ScrollTrigger inside `app/[locale]/page.tsx` or `HeroSection.tsx`. But `page.tsx` is a Server Component (required for `setRequestLocale`) and cannot contain `useEffect`/`useGSAP`. `HeroSection.tsx` is 'use client' but keeping ScrollTrigger there would couple the fade logic to the section component.
- **Fix:** Created `HeroScrollFade.tsx` as a dedicated side-effect-only client component (returns null). Mounted in `page.tsx` beside `ShaderCanvas`. This preserves Server Component semantics on `page.tsx` while cleanly separating the scroll wiring.
- **Files modified:** `src/components/HeroScrollFade.tsx` (new), `src/app/[locale]/page.tsx`

## Self-Check

**Created files exist:**
- src/components/ShaderCanvas.tsx: FOUND
- src/components/HeroTitle.tsx: FOUND
- src/components/HeroSection.tsx: FOUND
- src/components/HeroScrollFade.tsx: FOUND

**Commits exist:**
- 7de036a: chore(03-hero): install @shadergradient/react — FOUND
- 2f87b22: feat(03-hero): add ShaderCanvas WebGL gradient background component — FOUND
- 2e47389: feat(03-hero): add HeroTitle with GSAP ScrambleText entry animation — FOUND
- d673caf: feat(03-hero): add HeroSection layout with contact row and scroll indicator — FOUND
- 6e33787: feat(03-hero): wire ShaderCanvas + ScrollTrigger opacity fade in page layout — FOUND

**TypeScript:** No errors (tsc --noEmit clean)
**Build:** Next.js build 0 errors, 0 warnings

## Self-Check: PASSED

## Known Stubs

None — all components are wired to real data. Contact links point to actual email/GitHub/LinkedIn. Gradient colors are locked per spec.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced. ShaderCanvas loads from npm bundle (no external CDN requests at runtime). Contact links are static anchor tags.
