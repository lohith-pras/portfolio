# Liquid Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Apple WWDC 2025-style liquid glass treatment (multi-layer blur, specular highlights, depth shadows) to all card and surface components across the portfolio.

**Architecture:** Add four CSS utility classes to `globals.css` that encode the full glass recipe (backdrop-filter, fill, box-shadow, specular `::before`). Apply classes surgically to 6 component files with no new files created.

**Tech Stack:** Next.js 15, Tailwind CSS v3, Framer Motion v12, CSS `backdrop-filter`

---

## File Map

| File | Change type | What changes |
|---|---|---|
| `src/app/globals.css` | Modify | Add `.glass`, `.glass-bar`, `.glass-pill`, `.glass-card` utility classes |
| `src/components/NavbarDesktop.tsx` | Modify | Swap `bg-transparent backdrop-blur-sm border-b border-white/5` → `glass-bar` on `<nav>` |
| `src/components/NavbarMobile.tsx` | Modify | Swap `bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-md shadow-2xl` → `glass-pill` on `<nav>` |
| `src/components/ProjectCard.tsx` | Modify | Swap `border-b border-white/20 hover:border-white/60 transition-colors` → `glass-card rounded-xl` on `motion.article`; add `p-6` |
| `src/components/AboutSection.tsx` | Modify | Swap `bg-white/5 border border-white/10 relative overflow-hidden` → `glass` on image `motion.div` |
| `src/components/LifeClient.tsx` | Modify | Swap `bg-white/5 border border-white/10 overflow-hidden relative` → `glass-card` on photo grid items; add `glass-card rounded-xl p-6` to Hobbies and Obsessions `<div>`s |
| `src/components/ModalClient.tsx` | Modify | Swap `bg-background border border-white/10 relative shadow-2xl` → `glass` on modal `motion.div`; swap `bg-background/50 backdrop-blur-sm` → `glass-pill` on close button |

---

## Task 1: Add CSS utility classes

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the four glass utility classes**

Append to the end of `src/app/globals.css`:

```css
/* ─── Liquid Glass Utilities ─── */
.glass-bar {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2);
}
.glass-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  pointer-events: none;
}

.glass-pill {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 4px 24px rgba(0, 0, 0, 0.5),
    0 1px 4px rgba(0, 0, 0, 0.3);
}
.glass-pill::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  pointer-events: none;
}

.glass-card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 1px 4px rgba(0, 0, 0, 0.2);
}
.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  pointer-events: none;
}

.glass {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2);
}
.glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  pointer-events: none;
}
```

- [ ] **Step 2: Type-check**

```bash
rtk tsc
```
Expected: no errors (CSS change, tsc won't flag it — just confirms no prior errors exist).

- [ ] **Step 3: Commit**

```bash
rtk git add src/app/globals.css && rtk git commit -m "feat: add liquid glass CSS utility classes"
```

---

## Task 2: NavbarDesktop

**Files:**
- Modify: `src/components/NavbarDesktop.tsx`

- [ ] **Step 1: Swap class on `<nav>`**

In `src/components/NavbarDesktop.tsx`, find the `<nav>` element and replace its className:

**Before:**
```tsx
<nav className="fixed top-0 left-0 w-full h-16 hidden md:flex items-center justify-between px-8 md:px-16 z-50 bg-transparent backdrop-blur-sm border-b border-white/5">
```

**After:**
```tsx
<nav className="fixed top-0 left-0 w-full h-16 hidden md:flex items-center justify-between px-8 md:px-16 z-50 glass-bar">
```

- [ ] **Step 2: Verify visually**

Run: `npm run dev`, open `http://localhost:3000`

Expected: Desktop navbar shows subtle frosted glass bar at top. Blur visible when scrolling text behind it. Faint specular line at very top edge. No layout shift vs. before.

- [ ] **Step 3: Commit**

```bash
rtk git add src/components/NavbarDesktop.tsx && rtk git commit -m "feat: apply glass-bar to desktop navbar"
```

---

## Task 3: NavbarMobile

**Files:**
- Modify: `src/components/NavbarMobile.tsx`

- [ ] **Step 1: Swap class on `<nav>`**

In `src/components/NavbarMobile.tsx`, find the `<nav>` element and replace its className:

**Before:**
```tsx
<nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md h-14 flex md:hidden items-center justify-around px-6 z-50 bg-[#0A0A0A]/90 border border-white/10 rounded-full backdrop-blur-md shadow-2xl">
```

**After:**
```tsx
<nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md h-14 flex md:hidden items-center justify-around px-6 z-50 glass-pill rounded-full">
```

- [ ] **Step 2: Verify visually**

Resize browser to mobile viewport (`< 768px`). 

Expected: Pill nav at bottom shows glass treatment. More translucent than before (was near-opaque `#0A0A0A/90`). Rounded pill shape retained. Specular highlight arc visible at top of pill.

- [ ] **Step 3: Commit**

```bash
rtk git add src/components/NavbarMobile.tsx && rtk git commit -m "feat: apply glass-pill to mobile navbar"
```

---

## Task 4: ProjectCard

**Files:**
- Modify: `src/components/ProjectCard.tsx`

- [ ] **Step 1: Swap class on `motion.article`**

In `src/components/ProjectCard.tsx`, find `motion.article` and replace its className:

**Before:**
```tsx
<motion.article
  className="project-card flex flex-col gap-4 pb-6 border-b border-white/20 hover:border-white/60 transition-colors group"
```

**After:**
```tsx
<motion.article
  className="project-card flex flex-col gap-4 p-6 glass-card rounded-xl group"
```

Note: `pb-6` → `p-6` (adds padding on all sides now that the card has a background). `border-b border-white/20 hover:border-white/60 transition-colors` removed (glass border replaces it).

- [ ] **Step 2: Verify visually**

Open `http://localhost:3000`, scroll to Work section.

Expected: Each project entry now has a frosted glass card with rounded corners and subtle border. Framer `whileHover` y-lift still works. Text legibility unchanged (4% fill is very subtle on `#0A0A0A` background).

- [ ] **Step 3: Commit**

```bash
rtk git add src/components/ProjectCard.tsx && rtk git commit -m "feat: apply glass-card to project cards"
```

---

## Task 5: AboutSection image

**Files:**
- Modify: `src/components/AboutSection.tsx`

- [ ] **Step 1: Swap class on image `motion.div`**

In `src/components/AboutSection.tsx`, find the image `motion.div` (the one with `aspect-square`) and replace its className:

**Before:**
```tsx
className="order-1 md:order-2 aspect-square w-full max-w-[400px] mx-auto bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden"
```

**After:**
```tsx
className="order-1 md:order-2 aspect-square w-full max-w-[400px] mx-auto glass rounded-2xl flex items-center justify-center"
```

Note: `relative overflow-hidden` removed — provided by `.glass`. `bg-white/5 border border-white/10` removed — replaced by `.glass`.

- [ ] **Step 2: Verify visually**

Open `http://localhost:3000`, scroll to About section.

Expected: Image placeholder square shows glass treatment. Gradient overlay inside still renders (it's a child element, not affected). Framer scale-in animation still works.

- [ ] **Step 3: Commit**

```bash
rtk git add src/components/AboutSection.tsx && rtk git commit -m "feat: apply glass to about section image"
```

---

## Task 6: LifeClient

**Files:**
- Modify: `src/components/LifeClient.tsx`

- [ ] **Step 1: Swap class on photo grid items**

In `src/components/LifeClient.tsx`, find the photo grid `motion.div` (inside the `photos.map`) and replace its className:

**Before:**
```tsx
className="aspect-square bg-white/5 rounded-lg border border-white/10 overflow-hidden relative flex items-center justify-center"
```

**After:**
```tsx
className="aspect-square glass-card rounded-lg flex items-center justify-center"
```

Note: `overflow-hidden relative` removed — provided by `.glass-card`. `bg-white/5 border border-white/10` removed — replaced.

- [ ] **Step 2: Add glass to Hobbies and Obsessions divs**

Find the two plain `<div>` elements inside `className="grid md:grid-cols-2 gap-12"`:

**Before:**
```tsx
<div>
  <h2 className="text-2xl font-bold mb-6">Hobbies</h2>
```
```tsx
<div>
  <h2 className="text-2xl font-bold mb-6">Current Obsessions</h2>
```

**After:**
```tsx
<div className="glass-card rounded-xl p-6">
  <h2 className="text-2xl font-bold mb-6">Hobbies</h2>
```
```tsx
<div className="glass-card rounded-xl p-6">
  <h2 className="text-2xl font-bold mb-6">Current Obsessions</h2>
```

- [ ] **Step 3: Verify visually**

Open `http://localhost:3000/life`.

Expected: Photo grid items show glass treatment (blur shows through if images are loaded). Hobbies and Obsessions sections now have glass card containers. Stagger animation still plays on mount.

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/LifeClient.tsx && rtk git commit -m "feat: apply glass-card to life page photo grid and content sections"
```

---

## Task 7: ModalClient

**Files:**
- Modify: `src/components/ModalClient.tsx`

- [ ] **Step 1: Swap class on modal container**

In `src/components/ModalClient.tsx`, find the inner `motion.div` (the scrollable modal content container) and replace its className:

**Before:**
```tsx
className="relative w-full h-full max-w-7xl max-h-full bg-background border border-white/10 rounded-xl overflow-y-auto shadow-2xl z-10"
```

**After:**
```tsx
className="w-full h-full max-w-7xl max-h-full glass rounded-xl overflow-y-auto z-10"
```

Note: `relative` removed — provided by `.glass`. `bg-background border border-white/10 shadow-2xl` removed — replaced by `.glass`.
`overflow-y-auto` is kept and overrides `.glass`'s `overflow: hidden` on the Y axis — modal content remains scrollable.

- [ ] **Step 2: Swap class on close button**

Find the `<button>` element and replace its className:

**Before:**
```tsx
className="absolute top-6 right-6 p-2 z-50 bg-background/50 backdrop-blur-sm rounded-full hover:bg-white/10 transition-colors"
```

**After:**
```tsx
className="absolute top-6 right-6 p-2 z-50 glass-pill rounded-full hover:bg-white/10 transition-colors"
```

- [ ] **Step 3: Verify visually**

Open `http://localhost:3000`, click any project card to open the modal.

Expected: Modal container shows glass treatment (partially translucent, backdrop blur). Scrollable content inside works (can scroll project detail). Close button has glass pill appearance. Escape key and background click dismiss still work.

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/ModalClient.tsx && rtk git commit -m "feat: apply glass to modal container and close button"
```

---

## Task 8: Final type-check and build

- [ ] **Step 1: Type-check**

```bash
rtk tsc
```
Expected: 0 errors.

- [ ] **Step 2: Build**

```bash
rtk next build
```
Expected: Build completes successfully. No CSS purging issues (class names are applied as string literals in TSX, not dynamically constructed).

- [ ] **Step 3: Final visual pass**

Open `http://localhost:3000` and check:
- Desktop navbar: glass bar visible when text scrolls behind it
- Scroll to About: glass image panel
- Scroll to Work: glass project cards, hover lift still works
- Navigate to `/life`: glass photo grid + glass content sections
- Click a project: glass modal, glass close button, scrollable content
- Resize to mobile: glass pill nav at bottom

- [ ] **Step 4: Commit**

```bash
rtk git add -A && rtk git commit -m "chore: verify build passes after liquid glass implementation"
```
