# Liquid Glass Design — portfolio_v2

**Date:** 2026-05-27  
**Branch:** v2-updates  
**Status:** Approved

---

## Goal

Apply Apple WWDC 2025-style liquid glass treatment to all card and interactive surface components across the portfolio. Neutral white-tinted glass (no accent color bleed). Specular highlights included.

---

## CSS Foundation

Add four utility classes to `src/app/globals.css`. Each class provides:
- `position: relative; overflow: hidden` — required for specular pseudo-element
- `backdrop-filter: blur(Xpx) saturate(180%)` + `-webkit-` prefix
- Semi-transparent white fill (`rgba(255,255,255, 0.04–0.06)`)
- Multi-layer `box-shadow` for depth
- `border: 1px solid rgba(255,255,255, 0.10–0.12)`
- `::before` specular highlight: `position: absolute; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); pointer-events: none`

### Class Definitions

| Class | Blur | Fill | Border opacity | Specular width | Used by |
|---|---|---|---|---|---|
| `.glass-bar` | `blur(40px) saturate(180%)` | 5% | 10% | 10%–90% | NavbarDesktop |
| `.glass-pill` | `blur(32px) saturate(180%)` | 6% | 12% | 20%–80% | NavbarMobile, ModalClient close button |
| `.glass-card` | `blur(20px) saturate(160%)` | 4% | 8% | 15%–85% | ProjectCard, LifeClient photo grid, LifeClient content divs |
| `.glass` | `blur(40px) saturate(180%)` | 5% | 10% | 10%–90% | AboutSection image, ModalClient modal |

**Shared box-shadow pattern:**
```
inset 0 1px 0 rgba(255,255,255,0.12),
0 8px 32px rgba(0,0,0,0.4),
0 2px 8px rgba(0,0,0,0.2)
```
Intensity varies by class (pill/bar use stronger values; card uses lighter values).

---

## Component Transformations

### `src/components/NavbarDesktop.tsx`
- **Element:** `<nav>` root
- **Remove:** `bg-transparent backdrop-blur-sm border-b border-white/5`
- **Add:** `glass-bar`
- **Unchanged:** all layout, position, padding, z-index classes

### `src/components/NavbarMobile.tsx`
- **Element:** `<nav>` root
- **Remove:** `bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-md shadow-2xl`
- **Add:** `glass-pill`
- **Unchanged:** `rounded-full` and all layout classes

### `src/components/ProjectCard.tsx`
- **Element:** `motion.article`
- **Remove:** `border-b border-white/20 hover:border-white/60 transition-colors`
- **Add:** `glass-card rounded-xl p-6`
- **Note:** Glass border replaces bottom-only border. Hover effect from Framer `whileHover` (`y: -4`) remains.

### `src/components/AboutSection.tsx`
- **Element:** image `motion.div`
- **Remove:** `bg-white/5 border border-white/10`
- **Add:** `glass`
- **Unchanged:** `rounded-2xl`, overflow, aspect-ratio, animation classes

### `src/components/LifeClient.tsx`
- **Photo grid items (`motion.div`):**
  - Remove: `bg-white/5 border border-white/10 overflow-hidden relative`
  - Add: `glass-card` (provides `overflow: hidden` + `position: relative`)
  - Unchanged: `rounded-lg`, `aspect-square`, Framer animation props
- **Hobbies `<div>` and Obsessions `<div>`:**
  - Add: `glass-card rounded-xl p-6`
  - These are currently unstyled plain divs

### `src/components/ModalClient.tsx`
- **Modal container (`motion.div`):**
  - Remove: `bg-background border border-white/10`
  - Add: `glass`
  - Unchanged: `rounded-xl overflow-y-auto shadow-2xl z-10 w-full h-full max-w-7xl max-h-full`
  - Note: 4–5% fill keeps scrollable content readable
- **Close button (`<button>`):**
  - Remove: `bg-background/50 backdrop-blur-sm`
  - Add: `glass-pill`
  - Unchanged: `rounded-full p-2 hover:bg-white/10 transition-colors`

---

## Constraints

- **`overflow: hidden`** — provided by `.glass*` classes. Do not duplicate in component classNames where already removed.
- **`position: relative`** — provided by `.glass*` classes. Same.
- **`-webkit-backdrop-filter`** — required for Safari support. Must accompany every `backdrop-filter`.
- **Reduced motion** — `backdrop-filter` is not an animation; no change needed for `prefers-reduced-motion`.
- **Performance** — `backdrop-filter` triggers compositing. All affected elements are already composited (Framer Motion uses `will-change: transform` on animated elements). No additional cost.

---

## Out of Scope

- `HeroSection` — no card/panel surface, just text + links
- `HeroTitle` — text only
- `WavingFlag` — canvas-based, glass CSS not applicable
- `ShaderCanvas` — WebGL, background layer
- `PageTransition` — transition wrapper only
- `PhaseTimeline` — not surfaced in main pages (project detail)
- `WaveformDivider` — decorative SVG

---

## Files Changed

1. `src/app/globals.css` — add 4 utility classes
2. `src/components/NavbarDesktop.tsx` — class swap on `<nav>`
3. `src/components/NavbarMobile.tsx` — class swap on `<nav>`
4. `src/components/ProjectCard.tsx` — class swap on `motion.article`
5. `src/components/AboutSection.tsx` — class swap on image `motion.div`
6. `src/components/LifeClient.tsx` — class swap on photo grid items + add glass to content divs
7. `src/components/ModalClient.tsx` — class swap on modal container + close button
