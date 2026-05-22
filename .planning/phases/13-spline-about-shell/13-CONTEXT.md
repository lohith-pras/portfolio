# Phase 13: SplineAbout Component Shell — Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Spline About component shell: install packages, create `SplineAbout.tsx` (desktop, lazy-loaded, `ssr: false`) and `StaticIllustrationFallback.tsx` (mobile SVG), wire a `useIsDesktop` hook to conditionally render the correct component inside an `AboutIllustration.tsx` client wrapper, and verify that no Spline JavaScript executes on mobile viewports. The actual published Spline scene URL is NOT required in this phase — a placeholder sample scene URL is used to validate layout and rendering.
</domain>

<decisions>
## Implementation Decisions

### Package Installation
- **D-01**: Install `@splinetool/react-spline@^4.1.0` and `@splinetool/runtime@^1.12.95` (versions verified via `npm view`).
- **D-02**: Import from `@splinetool/react-spline/next` subpath (confirmed to exist in v4.1.0 exports). This export is SSR-compatible and designed for Next.js App Router.

### Conditional Render Architecture
- **D-03**: Use a `useIsDesktop` hook (in `src/hooks/useIsDesktop.ts`) with `window.matchMedia('(min-width: 768px)')` — NOT CSS `hidden` — to gate the Spline load. CLAUDE.md explicitly prohibits CSS hiding for Spline-class components.
- **D-04**: Extract the illustration column into `AboutIllustration.tsx` (a `'use client'` component) — `AboutSection.tsx` stays as a server component to preserve `useTranslations` server call. `AboutIllustration.tsx` owns the `useIsDesktop` conditional and renders either `SplineAbout` or `StaticIllustrationFallback`.

### SplineAbout.tsx
- **D-05**: The component accepts an optional `sceneUrl` prop and an optional `onLoad` callback. In Phase 13, a placeholder sample scene URL is used. The `onLoad` captures the spline app instance into a ref — actual ScrollTrigger wiring is Phase 14's responsibility.
- **D-06**: The component wraps in a `Suspense` boundary with a skeleton fallback so the page does not flash unstyled while the heavy Spline runtime loads.

### StaticIllustrationFallback.tsx
- **D-07**: Implement as an inline SVG React component (no external image file). Palette: electric orange (`#FF4500`) → crimson (`#C0001A`) radial gradient aura, geometric human-like silhouette on dark `#101010`. Must be side-by-side visually consistent with a warm 3D Spline character.
- **D-08**: The fallback is always rendered on mobile. It must not trigger any Spline-related imports.

### No GSAP Wiring in Phase 13
- **D-09**: The ScrollTrigger greeting animation (`once: true`) is Phase 14. In Phase 13 the SplineAbout shell only loads the scene (with placeholder URL) and stores the spline ref. No animation code is written yet.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Requirements
- `.planning/REQUIREMENTS.md` §ABOUT-V2-02 — SplineAbout lazy-loaded, desktop-only (≥768px), conditional render not CSS hidden
- `.planning/REQUIREMENTS.md` §ABOUT-V2-03 — StaticIllustrationFallback matches Spline character visual style, serves as mobile fallback

### Existing Code (must not break)
- `src/components/AboutSection.tsx` — current server component, will be modified to include `<AboutIllustration />`
- `src/app/[locale]/page.tsx` — home page that renders `<AboutSection />`
- `CLAUDE.md` "What NOT To Use" → **Mounting Spline on mobile and hiding via CSS** — prohibits `hidden md:block` pattern

### Spline Reference
- `@splinetool/react-spline/next` subpath — verified via `npm view @splinetool/react-spline exports`
</canonical_refs>

<specifics>
## Specific Ideas

- SSR safety: `useState(false)` initial value in `useIsDesktop` ensures server render produces fallback (no Spline). Desktop flip happens client-side after hydration.
- Placeholder scene: `https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode` — official Spline sample, publicly accessible, good for layout validation.
- The `StaticIllustrationFallback` SVG should include a radial gradient aura in the orange/crimson palette and a stylized geometric figure — not a simple placeholder square.
- `AboutIllustration.tsx` uses `useIsDesktop` and returns `null` for neither until after first client render (avoids hydration flash by never rendering Spline server-side).
</specifics>

<deferred>
## Deferred Ideas

- ScrollTrigger greeting animation (`once: true`, spline.play, idle loop) — deferred to Phase 14.
- Final published Spline scene URL — deferred to Phase 14.
- Lighthouse mobile audit — verified in Phase 14 after the real scene is wired.
</deferred>

---

*Phase: 13-spline-about-shell*
*Context gathered: 2026-05-22*
