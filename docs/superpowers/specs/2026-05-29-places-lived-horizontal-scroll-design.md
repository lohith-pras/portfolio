# Places I've Lived — Horizontal Scroll Section

**Date:** 2026-05-29  
**Page:** `/life`  
**Status:** Approved for implementation

---

## Context

Add a horizontal-scroll "Places I've Lived" section to the life page. Three cities (Bengaluru → Nürnberg → Dresden), each with a 2D illustrated sprite scene and experience write-up. Section pins vertically while the user scrolls horizontally through cards.

---

## Architecture

```
src/
  lib/
    places.ts                     # PLACES static data array
  components/
    PlacesSection.tsx             # outer wrapper + scroll orchestration
    PlaceCard.tsx                 # portrait card (sprite + text)
    chibi/
      PlaceScene.tsx              # R3F Canvas per card (mirrors ChibiCanvas)
public/
  places/
    bengaluru.png
    nurnberg.png
    dresden.png
messages/
  en.json                         # places.* keys
  de.json                         # places.* keys (DE translations)
```

**Placement:** Inserted as new section in the life page (`src/app/[locale]/life/page.tsx`), after existing hobbies/obsessions content.

---

## Data Model

**`src/lib/places.ts`:**
```ts
export const PLACES = [
  { key: 'bengaluru', city: 'Bengaluru', country: 'India',   years: '2000–2018', sprite: '/places/bengaluru.png' },
  { key: 'nurnberg',  city: 'Nürnberg',  country: 'Germany', years: '2022–2024', sprite: '/places/nurnberg.png'  },
  { key: 'dresden',   city: 'Dresden',   country: 'Germany', years: '2024–now',  sprite: '/places/dresden.png'   },
]
```

**`messages/en.json` additions:**
```json
"places": {
  "heading": "Places I've Lived",
  "scroll_hint": "Scroll to explore",
  "bengaluru": {
    "tagline": "Where it all began",
    "story": "..."
  },
  "nurnberg": {
    "tagline": "...",
    "story": "..."
  },
  "dresden": {
    "tagline": "...",
    "story": "..."
  }
}
```

Same structure in `de.json` with German translations.

---

## Scroll Mechanics

**Approach:** Framer-motion `useScroll` + `useSpring` + CSS sticky. No new dependencies.

```
outerRef div           h-[300vh]         ← scroll distance = 3 × viewport
  sticky section       h-screen          ← pins at top-0, overflow-hidden
    motion strip       w-[300vw] flex    ← translateX driven by scroll
      PlaceCard ×3     w-screen h-screen flex-shrink-0
```

**Transform:**
```ts
const { scrollYProgress } = useScroll({ target: outerRef })
const rawX = useTransform(scrollYProgress, [0, 1], ['0vw', '-200vw'])
const x = useSpring(rawX, { stiffness: 100, damping: 30 })
```

**Mobile (< md breakpoint):** Pin + translateX disabled. Cards render as vertical `flex-col` stack, full natural scroll. Detected via `useMediaQuery` or a CSS class toggle.

**Reduced motion:** `useReducedMotion()` → skip `useSpring`, render vertical stack.

---

## Card Layout

Portrait card, `w-screen h-screen`:

```
┌─────────────────────┐
│                     │  55% height — PlaceScene (R3F Canvas, alpha)
│    [SPRITE PNG]     │  plane mesh, useTexture(), glass-card bg
│                     │
├─────────────────────┤
│  Bengaluru          │  font-display, hero-heading gradient
│  India · 2000–2018  │  muted body text
│                     │
│  "Tagline here"     │  accent color (#FF1E00)
│                     │
│  Story paragraph... │  font-body, max readable width
└─────────────────────┘
```

---

## PlaceScene (R3F)

Mirrors `ChibiCanvas` exactly:

- Dynamic import with `ssr: false`
- Error boundary returns `null` on failure
- `Suspense fallback={null}`
- Canvas config: `alpha: true`, `antialias: true`, `camera: { position: [0,0,3], fov: 50 }`
- Sprite on `planeGeometry` via `useTexture(sprite)`, `meshBasicMaterial`
- `SRGBColorSpace` correction on texture

No animation states — static sprite render only.

---

## Animations & Polish

| Element | Animation |
|---------|-----------|
| Card text | `whileInView` fade + slide-up, `variants` pattern from AboutSection |
| Scroll hint arrow | Pulses `x: [0, 8, 0]` on first card; fades out via `useTransform(scrollYProgress, [0, 0.1], [1, 0])` |
| Progress dots | 3 dots, active = accent color; threshold at `[0, 0.5, 1]` mapped from `scrollYProgress` |
| Spring strip | `useSpring(rawX, { stiffness: 100, damping: 30 })` for inertia feel |

---

## i18n

- `useTranslations('places')` in PlacesSection
- `t('heading')` for section title
- `t(\`${place.key}.tagline\`)` and `t(\`${place.key}.story\`)` per card
- Same pattern as `useTranslations('projects')` in ProjectsSection

---

## Verification

1. Life page renders section below existing content
2. Desktop: scrolling through section pans cards horizontally, spring inertia visible
3. Mobile (< 768px): cards stack vertically, no pin behavior
4. `prefers-reduced-motion`: vertical stack, no translateX
5. Each PlaceScene loads texture without error; error boundary catches failures silently
6. i18n: switching locale updates all text in section
7. Progress dots update as user scrolls between cards
8. Scroll hint arrow visible on load, fades after first card scrolled past

---

## Assets Needed (from user)

- `/public/places/bengaluru.png` — illustrated 2D scene
- `/public/places/nurnberg.png`
- `/public/places/dresden.png`
- Story text + taglines for all 3 cities in both EN and DE
