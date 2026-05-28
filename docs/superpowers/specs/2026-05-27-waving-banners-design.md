# Waving Banners — Design Spec

**Date:** 2026-05-27
**Status:** Approved, ready for implementation
**Feature:** "In the Stands" section on Life page — vertical waving banners for RBR and RCB fandoms

---

## Scope

Two files modified/created:

| File | Change |
|------|--------|
| `src/components/WavingFlag.tsx` | New — `'use client'`, renders single animated banner |
| `src/components/LifeClient.tsx` | Add "In the Stands" section at top; move photos section to bottom |

---

## Layout Order (LifeClient.tsx)

Updated section order:

1. Title/intro ("Life.")
2. **"In the Stands"** ← new, immediately after intro
3. Hobbies + Current Obsessions
4. Photos ← moved from position 2 to bottom

---

## WavingFlag Component

### Props

```ts
interface WavingFlagProps {
  bgColor: string      // banner background color
  accentColor: string  // text and number color
  label: string        // abbreviated name e.g. "RBR"
  number: string       // player/driver number e.g. "3"
  logoUrl: string      // external URL to official logo image
  logoAlt: string      // alt text for logo img
  phaseOffset?: number // base wave phase offset in radians (default 0)
}
```

### Two Instances

| Banner | `bgColor` | `accentColor` | `label` | `number` | `phaseOffset` |
|--------|-----------|---------------|---------|----------|---------------|
| Red Bull Racing | `#001489` | `#FF0000` | `RBR` | `3` | `0` |
| Royal Challengers | `#D40024` | `#FFC906` | `RCB` | `18` | `0.8` |

`logoUrl` values sourced at implementation time from official team/league websites.

---

## Banner Structure

Dimensions: `70px wide × 180px tall`.

Layout (top to bottom):
- Horizontal rod: `2px` line, `white/30` opacity, full width, above banner body
- Logo: `<img src={logoUrl} alt={logoAlt}>`, `w-full object-contain`, top ~40% of banner height
- Number: large bold text (`text-4xl font-black`), `accentColor`, bottom portion

Two banners side-by-side, `24px` gap, centered in section.

```
  ══════════════════════  ← rod
  ┌────┐   ┌────┐
  │logo│   │logo│
  │    │   │    │
  │  3 │   │ 18 │
  └────┘   └────┘
```

---

## Wave Animation

Vertical travelling wave. Top anchored (zero amplitude), bottom free (max amplitude).

Implementation: 10 horizontal strips stacked per banner, each `overflow: hidden`. Framer Motion `useAnimationFrame(t)` drives `translateX` per strip:

```ts
const SPEED = 1.5           // rad/s
const MAX_AMPLITUDE = 7     // px at bottom strip

strips.forEach((el, i) => {
  const tNorm = i / 9
  const amplitude = tNorm * MAX_AMPLITUDE
  const phase = tNorm * Math.PI * 2
  const tSec = t * 0.001
  el.style.transform = `translateX(${amplitude * Math.sin(SPEED * tSec + phase + phaseOffset)}px)`
})
```

Each banner receives a different `phaseOffset` (~0.8 rad apart) so they don't wave in sync.

---

## Accessibility

`prefers-reduced-motion`: detect via Framer Motion `useReducedMotion()`. When true, skip `useAnimationFrame` — strips render flat, banners remain visible as static decorative elements. Controls remain unchanged.

---

## Logo Sourcing

Logos fetched via external URL (official team/league sites). If URL breaks, `<img>` degrades to `alt` text. No local copies committed — use `alt` as fallback text.

---

## Dependencies

No new npm packages. All deps already installed:
- `framer-motion` — `useAnimationFrame`, `useReducedMotion`

---

## Open Questions

None — all decisions resolved.
