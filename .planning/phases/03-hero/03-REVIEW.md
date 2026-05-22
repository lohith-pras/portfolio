---
status: "issues_found"
files_reviewed: 5
critical: 1
warning: 1
info: 2
total: 4
---
# Code Review Report

## Summary
A code review of Phase 03 Hero components identified 4 issues. The most critical issue is a race condition in `HeroScrollFade.tsx` where the scroll animation fails to initialize because the target element (`#shader-canvas`) is loaded asynchronously via `next/dynamic` and is not available in the DOM when the component hydrates. Additionally, there is a visual Flash of Unscrambled Content (FOUC) issue in `HeroTitle.tsx` and a couple of minor code cleanliness improvements.

## Findings

### [CR-01] Missing DOM Element in ScrollTrigger Initialization due to Dynamic Import
**File**: `src/components/HeroScrollFade.tsx`
**Description**: `HeroScrollFade` attempts to find `#shader-canvas` synchronously during its `useGSAP` hook (which maps to `useLayoutEffect`). Because `ShaderCanvasWrapper` imports `ShaderCanvas` dynamically with `ssr: false`, the `#shader-canvas` element is not immediately present in the DOM upon hydration. This causes the early return `if (!canvas || !hero) return` to silently abort, meaning the WebGL scroll fade effect never initializes.
**Recommendation**: Move the `ScrollTrigger` logic directly into `ShaderCanvas.tsx` (which is already a client component and only executes when the canvas actually mounts), or implement a `MutationObserver` in `HeroScrollFade` to wait for `#shader-canvas` to appear in the DOM. Moving it to `ShaderCanvas.tsx` is the most reliable approach.

### [WR-01] Visual FOUC and Pointless `fromTo` Animation
**File**: `src/components/HeroTitle.tsx`
**Description**: The `.hero-name` element has no CSS classes to hide it initially, so it renders the full text on the server. The GSAP animation then runs `gsap.fromTo(..., { opacity: 0 }, { opacity: 1, duration: 0 })`, which is effectively an instant state change to visible (which it already is). Then, `scrambleText` scrambles the already-visible `FULL_NAME` and resolves it back to `FULL_NAME`. This creates a jarring visual jump (Flash of Unscrambled Content) where the full text is shown, turns into random characters, and resolves back to the full text.
**Recommendation**: Add an `opacity-0` class to the `.hero-name` element to hide it initially on render. Remove the redundant `fromTo` wrapper and simply animate the element with `gsap.to('.hero-name', { opacity: 1, duration: 0.2, scrambleText: ... })` (or keep the `onComplete` sequence but give the initial fade-in a small duration so it transitions smoothly).

### [IN-01] Unused `index` Parameter in `map` Function
**File**: `src/components/HeroSection.tsx`
**Description**: The `index` parameter is declared in the `CONTACT_LINKS.map` callback but is never used.
**Recommendation**: Remove the `index` parameter from the callback to keep the code clean and prevent potential linting warnings.

### [IN-02] Redundant DOM Query When Using GSAP Scope
**File**: `src/components/HeroTitle.tsx`
**Description**: The component uses `@gsap/react`'s `useGSAP` hook with a defined `scope: containerRef`, but then manually resolves the target via `const target = containerRef.current?.querySelector('.hero-name')`.
**Recommendation**: GSAP's scoped context allows you to pass string selectors directly to animations and they will be safely scoped. The manual `querySelector` is redundant; you can simply use `gsap.to('.hero-name', ...)` instead and remove the explicit target resolution.
