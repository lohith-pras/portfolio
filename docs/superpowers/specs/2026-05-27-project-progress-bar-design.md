# Project Progress Bar — Design Spec

**Date:** 2026-05-27  
**Status:** Approved

## Summary

Add an animated progress bar to portfolio project cards and project detail sidebar, showing phase completion (phases completed / total phases) using framer-motion.

## Data

Add `phasesCompleted` and `totalPhases` to `messages/en.json` and `messages/de.json` under each project key:

```json
"projects": {
  "mimo": { "phasesCompleted": 1, "totalPhases": 3 },
  "vlc":  { "phasesCompleted": 3, "totalPhases": 3 },
  "iot":  { "phasesCompleted": 3, "totalPhases": 3 }
}
```

## Component: `ProjectProgressBar`

**File:** `src/components/ProjectProgressBar.tsx`  
**Type:** `'use client'`

**Props:**
```ts
interface ProjectProgressBarProps {
  phasesCompleted: number
  totalPhases: number
}
```

**Visual spec:**
- Label: `"{phasesCompleted} / {totalPhases} Phases"` — `font-mono text-xs text-white/50`, above the track
- Track: full-width, `h-[2px]`, `bg-white/10`, rounded
- Fill: `motion.div`, animates `width` from `"0%"` → `"{percentage}%"` on mount
  - Duration: `1s`
  - Ease: `[0.25, 0.46, 0.45, 0.94]`
  - Fill color: `#FF1E00` (accent, matches existing palette)
- Respects `prefers-reduced-motion`: skip animation, render fill at final width immediately

## Placement 1: Project Cards (`ProjectCard.tsx`)

Replace the status dot row in `<footer>` with:
1. `ProjectProgressBar` (full card width)
2. Status text (`font-mono text-sm text-foreground/80 uppercase tracking-wider`) — dot removed

`ProjectCard` gets two new props: `phasesCompleted: number`, `totalPhases: number`.

`WorkSection.tsx` reads the new translation keys and passes them down.

## Placement 2: Project Detail Sidebar (`PhaseTimeline.tsx`)

Add `ProjectProgressBar` above the existing GSAP scroll-driven timeline:
- Summary bar shows overall completion statically
- GSAP line + nodes below it animate phase-by-phase on scroll as before
- Both coexist: bar = "where are we overall", nodes = "what happened at each phase"

`PhaseTimeline` gets two new props: `phasesCompleted: number`, `totalPhases: number`.

Project page (`[slug]/page.tsx`) reads phase data from translations (server component) and passes to `PhaseTimeline`.

## Files Changed

| File | Change |
|------|--------|
| `messages/en.json` | Add `phasesCompleted`, `totalPhases` per project |
| `messages/de.json` | Same |
| `src/components/ProjectProgressBar.tsx` | New component |
| `src/components/ProjectCard.tsx` | Add props, replace status dot, render bar |
| `src/components/WorkSection.tsx` | Pass new props to `ProjectCard` |
| `src/components/PhaseTimeline.tsx` | Add props, render bar above timeline |
| `src/app/[locale]/projects/[slug]/page.tsx` | Read phase data, pass to `PhaseTimeline` |

## Out of Scope

- Editable/dynamic phase completion — all values are static in translations
- Phase-level labels on the sidebar bar — detail is handled by the GSAP nodes
- Mobile sidebar — `PhaseTimeline` is already `hidden md:block`
