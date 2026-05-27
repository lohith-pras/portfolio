# Grain Noise Toggle Design

**Date:** 2026-05-28  
**Status:** Approved

## Overview

Add a toggle to the desktop navbar that lets visitors filter out the grain texture on the shader gradient background. Starts noisy on every visit. The metaphor: signal noise in communications, cleared by applying a filter.

---

## State & Architecture

### GrainContext

New file: `src/components/GrainContext.tsx`

- Client component (`'use client'`)
- `grainEnabled: boolean` — default `true`
- Exports `GrainProvider` and `useGrain()` hook returning `{ grainEnabled, toggleGrain }`
- No localStorage — resets to `true` on every page load

### Layout wiring

`src/app/[locale]/layout.tsx` — wrap content inside `NextIntlClientProvider` with `<GrainProvider>`:

```tsx
<NextIntlClientProvider locale={locale} messages={messages}>
  <GrainProvider>
    <NavbarDesktop />
    <NavbarMobile />
    <PageTransition>{children}</PageTransition>
  </GrainProvider>
</NextIntlClientProvider>
```

---

## Toggle Button (NavbarDesktop)

### Placement

Between the `Life` link and the `|` divider:

```
[L.T. Prasanna]    [too noisy]  [Life]  |  [mail]  [github]  [linkedin]
```

### Copy

| Grain state | Label |
|-------------|-------|
| `true` (on) | `too noisy` |
| `false` (off) | `filtered` |

### Styling

`font-mono text-xs text-foreground/40 hover:text-foreground/70 cursor-pointer transition-colors`

Intentionally smaller and dimmer than nav links — reads as a meta-control, not a destination.

### Mobile

Skip — mobile navbar is icon-only and too cramped. Desktop only.

---

## Burst Overlay & ShaderCanvas

### Overlay element

Inside `ShaderCanvas`'s outer wrapper div. A second `fixed inset-0` div layered at `z-1` (just above the canvas at `z-0`). References an SVG `feTurbulence` filter for noise texture.

SVG filter definition: hidden `<svg>` embedded in the DOM with `<feTurbulence>` producing a fine grain texture.

### Animation sequence (grain off)

| Time | Action |
|------|--------|
| `t=0` | Click. `burstActive = true`. |
| `t=0–80ms` | Overlay fades in: opacity `0 → 0.6` |
| `t=80–280ms` | Hold — static visible over canvas |
| `t=280ms` | `grain` prop flips to `"off"`. Overlay starts fading out. |
| `t=280–480ms` | Overlay fades out: opacity `0.6 → 0`. Clean gradient emerges. |
| `t=480ms` | `burstActive = false` |

### Animation sequence (grain on, reverse)

No burst. `grain` prop flips immediately to `"on"`. Noise returns without ceremony.

### Implementation

- `framer-motion` `useAnimate` hook drives overlay opacity
- SVG `<defs>` with `feTurbulence` in a hidden element; overlay div references it via `style={{ filter: 'url(#grain-noise)' }}`
- `grain` prop on `<ShaderGradient>` driven by `grainEnabled` from context: `grain={grainEnabled ? "on" : "off"}`

---

## Fallback (smooth fade)

If the static burst reads as jarring in practice: replace the `t=0–80ms` flare-in with a direct opacity-0 skip, and animate grain disappearance via a CSS opacity fade on the canvas itself. This is the smooth-fade fallback — no code architecture changes required, just tweak the animation keyframes.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/GrainContext.tsx` | New — context + provider + hook |
| `src/app/[locale]/layout.tsx` | Wrap with `<GrainProvider>` |
| `src/components/NavbarDesktop.tsx` | Add toggle button |
| `src/components/ShaderCanvas.tsx` | Read context, render burst overlay |
