# Phase 14: Spline Scene Integration — Context

**Gathered:** 2026-05-22
**Status:** Ready for planning (blocked on published Spline scene URL — see blocker below)

<domain>
## Phase Boundary

Wire the user's published Spline scene URL into `SplineAbout.tsx` (replacing the Phase 13 placeholder), implement the GSAP ScrollTrigger greeting animation that fires exactly once on section scroll-in (`once: true`), ensure the character returns to its idle loop after the greeting, and verify Lighthouse mobile score remains ≥ 85.
</domain>

<decisions>
## Implementation Decisions

### Scene URL
- **D-01**: The real published Spline scene URL replaces the Phase 13 placeholder URL (`https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode`). The exact URL is provided by the user when the scene is published.

### ScrollTrigger
- **D-02**: Use `ScrollTrigger.create({ once: true, onEnter: ... })` to fire the greeting exactly once. The `once: true` kills the trigger after the first `onEnter`. A `hasGreeted` ref guards against the race condition where the scene loads after the user has already scrolled past.
- **D-03**: Register `ScrollTrigger` inside `useGSAP` (from `@gsap/react`) with `scope: containerRef` — per CLAUDE.md mandatory pattern for React 19 compatibility. Do NOT use raw `useEffect` + `gsap.context()`.

### Spline Animation Trigger
- **D-04**: The exact Spline event call (`emitEvent` vs `setVariable`) depends on how the scene was authored. The executor MUST ask the user for the object name and event type before writing the trigger code. This is a `checkpoint:human-action` in the plan — not blockable at planning time.

### Idle Loop
- **D-05**: The idle loop is handled inside the Spline scene itself (the animation returns to idle after the greeting clip finishes). No additional GSAP code is needed for idle — only the one-time trigger.

### Race Condition Guard
- **D-06**: Inside the `onLoad` callback, check if the About section is already in view (`rect.top < window.innerHeight * 0.8`). If so, fire the greeting immediately without waiting for a future scroll event.

### Lighthouse Constraint
- **D-07**: The Lighthouse mobile ≥ 85 constraint is a hard gate. If the real Spline scene causes a regression (e.g. because it is much larger than the sample scene), the executor must report this and pause for user decision before marking the phase complete.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Requirements
- `.planning/REQUIREMENTS.md` §ABOUT-V2-01 — Spline 3D character, greeting animation once on scroll-in, returns to idle

### Phase 13 Artifacts (must be complete first)
- `src/components/SplineAbout.tsx` — will be modified to add ScrollTrigger greeting
- `src/components/AboutIllustration.tsx` — wires SplineAbout with the real scene URL
- `.planning/phases/13-spline-about-shell/13-01-SUMMARY.md` — Phase 13 completion evidence

### Animation Patterns
- `CLAUDE.md` Integration Patterns §1 — useGSAP from @gsap/react is mandatory, not raw useEffect + gsap.context()
- `CLAUDE.md` Integration Patterns §3 — Spline `onLoad` → capture app instance → emitEvent or setVariable for named animation trigger
</canonical_refs>

<blocker>
## ⚠ Critical Blocker

**Phase 14 execution requires a user-published Spline scene.**

Before executing, the user must:
1. Design the character in spline.design
2. Add a named greeting animation clip and an idle loop
3. Export/publish the scene and obtain the `scene.splinecode` URL
4. Know the exact object name and event type that triggers the greeting

The plan includes a `checkpoint:human-action` task that gates execution on the user providing these details.
</blocker>

<deferred>
## Deferred Ideas

- Spline scene re-skinning after the portfolio launches (color palette adjustments post-launch) → future iteration
- Lazy-loading the Spline scene on a scroll proximity trigger (instead of page load) → could improve LCP further, but adds complexity; defer to v3 if needed
</deferred>

---

*Phase: 14-spline-scene-integration*
*Context gathered: 2026-05-22*
