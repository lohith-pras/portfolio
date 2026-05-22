# Roadmap: LTP Portfolio v2

## Overview

Build a Next.js App Router personal portfolio from scratch — from project scaffold and i18n routing through hero animations, work section, MDX project deep-dives, the /life page, page transitions, and a final German translation pass. Each phase delivers a coherent, verifiable capability. i18n routing and design tokens land in Phase 1 because retrofitting either is painful. Animations layer on top of verified static shells. MDX pipeline unlocks project content before the card-to-deep-dive transition is wired.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Next.js scaffold, design tokens, i18n routing, GSAP providers, mobile-first base
- [x] **Phase 2: Static Shell** - Navigation + About section as verified static HTML with i18n strings, no animations
- [x] **Phase 3: Hero** - Shader gradient, name display, GSAP scramble entry, ScrollTrigger fade (completed 2026-05-22)
- [x] **Phase 4: Work Section** - Project cards, SVG waveform divider, GSAP stagger reveal
- [x] **Phase 5: MDX Pipeline** - @next/mdx config, project pages, GSAP phase timeline component, all 3 project files
- [ ] **Phase 6: Card Expansion** - Framer Motion layoutId card-to-project expansion via intercepting routes
- [ ] **Phase 7: Life Page** - /life with Courier Prime, seeded photo rotation, hobbies, stagger animation
- [ ] **Phase 8: Page Transitions** - AnimatePresence panel slides between routes
- [ ] **Phase 9: DE i18n Pass** - DeepL UI chrome translation, messages/de.json, locale switcher completion

## Phase Details

### Phase 1: Foundation
**Goal**: The project scaffold is running with design system tokens, i18n sub-path routing, GSAP plugin registration, and mobile-first Tailwind — every subsequent page and animation has a correct base to build on
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):
  1. Visiting `/en` and `/de` routes returns a valid page — sub-path routing is live and middleware redirects bare `/` to `/en`
  2. Design tokens are applied globally — background is `#0A0A0A`, accent color `#FF1E00`, Space Mono and Plus Jakarta Sans are loaded via `next/font/google` and visible in the shell
  3. Fluid type (`clamp()`) is applied — hero-scale text and body text resize smoothly across viewport widths without breakpoint jumps
  4. GSAP plugins (ScrollTrigger, DrawSVG) are registered once in `lib/gsap.ts` — no plugin-not-found errors in console
  5. `next build` reports `/en` and `/de` as static (`○`) not dynamic (`ƒ`)
**Plans**: TBD

### Phase 2: Static Shell
**Goal**: Navigation and About section render correctly as static HTML with English i18n strings — visual composition and copy can be reviewed before any animation noise is added
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, ABOUT-01, ABOUT-02
**Success Criteria** (what must be TRUE):
  1. Desktop shows a transparent top nav bar with site name left, links right (About / Work / Life / Contact), and an EN/DE locale toggle
  2. Mobile shows a fixed bottom navigation bar with the same links as short labels or icons plus the EN/DE toggle
  3. A resume/CV PDF is downloadable from the nav or contact area
  4. About section displays a static illustration (SVG or PNG) at the model position and a short Space Mono descriptor line plus 3–4 sentences in Plus Jakarta Sans
**Plans**: TBD
**UI hint**: yes

### Phase 3: Hero
**Goal**: The hero section is fully animated — shader gradient pulses in the background, the full name resolves from a scramble on load, and the gradient fades as the user scrolls toward About
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04
**Success Criteria** (what must be TRUE):
  1. Hero renders the animated shader gradient (warm `#FF4500` → `#C0001A` → `#0A0A0A`) with slow deliberate movement — no static fallback visible
  2. On page load, `Lohith Tarikere Prasanna` in Space Mono resolves from a character scramble within 600–800ms
  3. Contact row (email · GitHub · LinkedIn) is visible below the name
  4. Scrolling toward the About section causes the shader gradient to fade out via GSAP ScrollTrigger — gradient is fully gone by the time About is in view
**Plans**: TBD
**UI hint**: yes

### Phase 4: Work Section
**Goal**: The Work section is fully visible with waveform divider, project cards in the correct grid, and GSAP stagger reveal on scroll — cards are static links (expansion wired in Phase 6)
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: WORK-01, WORK-02, WORK-03
**Success Criteria** (what must be TRUE):
  1. A full-width SVG waveform divider is drawn by GSAP DrawSVG as the user scrolls into the Work section
  2. Three project cards render in a 2-column desktop / 1-column mobile grid — each shows project name (Space Mono bold), one-line problem statement, status tag with `#FF1E00` dot, phase count, and a `1px solid #FFFFFF` border-bottom only
  3. Cards enter from below with a 0.08s GSAP stagger reveal as the section scrolls into view
**Plans**: TBD
**UI hint**: yes

### Phase 5: MDX Pipeline
**Goal**: `/projects/[slug]` pages are live and driven by MDX files — all three project deep-dives render with content, and the GSAP-drawn phase timeline animates as the user scrolls
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: PROJ-01, PROJ-02
**Success Criteria** (what must be TRUE):
  1. Navigating to `/en/projects/mimo-ai-channel-quality-tool`, `/en/projects/vlc-v2v-communication`, and `/en/projects/iot-security-project` each renders a full project page sourced from the corresponding `.mdx` file
  2. The vertical phase timeline on each project page draws its connecting line downward as the user scrolls, and each phase node circle scales in as the line reaches it
  3. `next build` generates static paths for all three slugs in both locales (`/en/projects/[slug]` and `/de/projects/[slug]`)
**Plans**: TBD
**UI hint**: yes

### Phase 6: Card Expansion
**Goal**: Clicking a project card triggers a Framer Motion `layoutId` shared layout animation — the card expands to fill the screen and transitions into the project page with no hard navigation flash
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: WORK-04
**Success Criteria** (what must be TRUE):
  1. Clicking any project card in the Work section triggers a smooth Framer Motion expand animation — the card morphs to fill the viewport and reveals the project page
  2. Navigating directly to `/en/projects/[slug]` by URL (without clicking from the grid) renders the full project page correctly without the modal overlay
  3. The browser back button dismisses the expanded view and returns to the homepage scroll position
**Plans**: TBD
**UI hint**: yes

### Phase 7: Life Page
**Goal**: `/life` is a fully working page — Courier Prime signals a mood shift, travel photos render with seeded rotation, and hobbies and obsessions sections are present with a stagger drop-in animation
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: LIFE-01, LIFE-02, LIFE-03, LIFE-04
**Success Criteria** (what must be TRUE):
  1. Every element on `/life` renders in Courier Prime — no Space Mono or Plus Jakarta Sans visible on this route
  2. Travel photos appear in a grid with slight random rotation (−3° to +3°) — rotation is deterministic (same on every load, no hydration mismatch errors in console)
  3. Hobbies and current obsessions sections are present on the page with brief, non-exhaustive content
  4. On page load, photo cards animate in via a Framer Motion stagger drop-in
**Plans**: TBD
**UI hint**: yes

### Phase 8: Page Transitions
**Goal**: Navigating between `/`, `/life`, and `/projects/[slug]` triggers a Framer Motion `AnimatePresence` dark panel slide — route changes feel intentional, not instant
**Mode:** mvp
**Depends on**: Phase 7
**Requirements**: TRANS-01
**Success Criteria** (what must be TRUE):
  1. Navigating from any main route to any other triggers a dark panel that slides in from the right and retracts to reveal the destination page
  2. Direct URL navigation (browser refresh) lands on the destination with no transition panel flash
  3. Browser back/forward navigation through history produces the same transition animation as click navigation
**Plans**: TBD
**UI hint**: yes

### Phase 9: DE i18n Pass
**Goal**: The German locale delivers actual German UI chrome — locale switcher reads "DE", all nav labels, section headings, and contact text appear in German, and the DeepL build-time script is wired
**Mode:** mvp
**Depends on**: Phase 8
**Requirements**: FOUND-03
**Success Criteria** (what must be TRUE):
  1. Switching to `/de` shows all UI chrome (nav labels, section headings, contact text, About descriptor) in German — no English strings visible except `Lohith Tarikere Prasanna` (name stays English per design decision)
  2. The DeepL translation runs as a build-time script (not at runtime) — no DeepL API calls happen during page requests
  3. ICU placeholders in `messages/de.json` are intact and functional — no broken substitution patterns from DeepL mangling
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-05-22 |
| 2. Static Shell | 1/1 | Complete | 2026-05-22 |
| 3. Hero | 1/1 | Complete   | 2026-05-22 |
| 4. Work Section | 1/1 | Complete | 2026-05-22 |
| 5. MDX Pipeline | 1/1 | Complete | 2026-05-22 |
| 6. Card Expansion | 0/TBD | Not started | - |
| 7. Life Page | 0/TBD | Not started | - |
| 8. Page Transitions | 0/TBD | Not started | - |
| 9. DE i18n Pass | 0/TBD | Not started | - |
