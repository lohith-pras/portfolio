# Projects Section — Design Spec
Date: 2026-05-29

## Goal

Replace the current `WorkSection` (GSAP grid, glass cards, no images) with a sticky-stacking scroll animation that uses the existing `.glass-card` liquid glass style and a rich card layout with image grids.

## Approach

**C — Replace in place.** `WorkSection.tsx` → `ProjectsSection.tsx`. `ProjectCard.tsx` fully rewritten. Both files have no external consumers beyond `src/app/[locale]/page.tsx`, so replacement is safe.

Drop GSAP from this section entirely. Framer Motion only.

---

## Section Wrapper (`ProjectsSection.tsx`)

```
<section id="projects">
  bg-[#0C0C0C]
  rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]
  -mt-10 sm:-mt-12 md:-mt-14
  z-10 relative
  px-6 md:px-16 pb-32
```

**Heading:** "Project" (singular). Uses new `.hero-heading` CSS utility.

**Card containers:** 3 × `h-[85vh]` wrapper divs, one per project. Cards are sticky inside these.

---

## CSS Addition (`globals.css`)

New utility class `.hero-heading`:

```css
.hero-heading {
  background: linear-gradient(180deg, #F0F0F0 0%, #666666 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

Applied to the "Project" heading alongside existing `font-display`, `text-heading` sizing.

---

## Animation

Each `h-[85vh]` container gets a `containerRef`. Inside, the card is `position: sticky`.

```
sticky top-[calc(96px_+_{index}*28px)] md:top-[calc(128px_+_{index}*28px)]
```

`useScroll({ target: containerRef })` tracks scroll progress per card.

`useTransform(scrollYProgress, [0, 1], [1, targetScale])` drives `scale`.

```ts
targetScale = 1 - (totalCards - 1 - index) * 0.03
// index 0 → 0.94, index 1 → 0.97, index 2 → 1.0
```

`useReducedMotion()` guard: if true, skip all transforms (static render).

---

## Card Layout (`ProjectCard.tsx`)

### Props

```ts
interface ProjectCardProps {
  index: number
  number: string        // "01", "02", "03"
  category: string      // "AI / ML", "Hardware", "Security"
  name: string
  githubUrl: string
  images: [string, string, string]  // [leftTop, leftBottom, rightTall]
}
```

### Card shell

```
.glass-card
rounded-[40px] sm:rounded-[50px] md:rounded-[60px]
p-4 sm:p-6 md:p-8
w-full
```

### Top row (`flex items-end gap-4 flex-wrap`)

| Element | Style |
|---|---|
| Number | `font-display text-[clamp(4rem,10vw,8rem)] leading-none text-foreground/20` |
| Category | `font-mono text-xs uppercase tracking-widest text-foreground/50` |
| Project name | `font-display font-bold text-[clamp(1.2rem,3vw,2rem)] text-foreground flex-1` |
| GitHub button | `rounded-full border-2 border-[#D7E2EA] px-4 py-2 text-xs uppercase tracking-widest text-foreground bg-transparent hover:bg-white/5 transition-colors ml-auto` |

### Bottom row (`flex gap-3 mt-4`)

**Left column (`w-[40%] flex flex-col gap-3`):**
- Image 1: `height: clamp(130px, 16vw, 230px)` · `rounded-[40px] object-cover w-full`
- Image 2: `height: clamp(160px, 22vw, 340px)` · `rounded-[40px] object-cover w-full`

**Right column (`w-[60%]`):**
- Image 3: height = left img1 + left img2 + gap (achieved via `h-full`) · `rounded-[40px] object-cover w-full`

**Placeholder (until real images):** `bg-gradient-to-br from-white/10 to-white/5` div at same dimensions.

---

## Data / Translations

Add to `messages/en.json` (and `de.json`) under `projects.*`:

```json
{
  "number": "01",
  "category": "AI / ML",
  "githubUrl": "https://github.com/lohith-pras/..."
}
```

Project → category mapping:
- `mimo` → AI / ML
- `vlc` → Hardware
- `iot` → Security

---

## Page Wiring (`src/app/[locale]/page.tsx`)

Replace `<WorkSection />` import+usage with `<ProjectsSection />`.

---

## Out of Scope

- Real project images (placeholders ship first)
- Internal project slug pages (unchanged)
- German translations for new fields (can be added post-ship)
- `ProjectProgressBar.tsx` (unused after this change — delete or keep, noted separately)
