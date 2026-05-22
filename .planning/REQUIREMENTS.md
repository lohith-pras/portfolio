# Requirements: LTP Portfolio v2

**Defined:** 2026-05-22
**Core Value:** Visitors leave knowing Lohith is a builder with intent and a distinct perspective — not just a candidate with a CV.

## v1.0 Requirements (Complete)

### Foundation

- [x] **FOUND-01**: Site uses design system tokens — colors (`#0A0A0A`, `#F0F0F0`, `#FF1E00`), Space Mono (display), Plus Jakarta Sans (body), Courier Prime (/life only) — all loaded via `next/font/google`
- [x] **FOUND-02**: All display text uses fluid type via `clamp()` — hero name `clamp(3rem, 10vw, 9rem)`, section headings `clamp(2rem, 6vw, 4.5rem)`, body `clamp(1rem, 2vw, 1.2rem)`
- [x] **FOUND-03**: Site is served under EN/DE sub-path routing (`/en/...` and `/de/...`) via next-intl middleware
- [x] **FOUND-04**: All pages are written mobile-first — Tailwind base classes for mobile, `md:` and `lg:` for larger screens

### Navigation

- [x] **NAV-01**: Desktop shows transparent top nav — site name left, links right (`About / Work / Life / Contact`), EN/DE toggle
- [x] **NAV-02**: Mobile shows fixed bottom bar with same links as icons or short labels + EN/DE toggle
- [x] **NAV-03**: Resume/CV is downloadable from nav or contact section

### Hero

- [x] **HERO-01**: Hero renders animated shader gradient — warm palette (`#FF4500` → `#C0001A` → `#0A0A0A`), slow deliberate movement
- [x] **HERO-02**: Hero displays full name `Lohith Tarikere Prasanna` in Space Mono, oversized with negative letter-spacing, plus contact row (`lnlohith3@gmail.com` · GitHub · LinkedIn)
- [x] **HERO-03**: On page load, hero name plays GSAP character scramble animation that resolves to the real name within 600–800ms
- [x] **HERO-04**: As user scrolls toward About, GSAP ScrollTrigger scrubs shader gradient opacity 1→0 so gradient is fully gone by the time About is in view

### About

- [x] **ABOUT-01**: About section renders a static illustration (SVG or PNG) that occupies the model's position — visible on all screen sizes in v1 (Spline deferred to v2)
- [x] **ABOUT-02**: About section displays a short Space Mono descriptor line (1–2 lines) plus 3–4 sentences in Plus Jakarta Sans — authentic voice, no experience timeline or education list

### Work

- [x] **WORK-01**: Work section opens with a full-width SVG waveform drawn by GSAP DrawSVG as the divider between About and Work
- [x] **WORK-02**: Project cards render in 2-column desktop / 1-column mobile grid — each card shows project name (Space Mono bold), one-line problem statement (Plus Jakarta Sans), status tag with `#FF1E00` dot, phase count, and `1px solid #FFFFFF` border-bottom only
- [x] **WORK-03**: Project cards enter from below via GSAP stagger reveal on scroll (0.08s stagger between cards)
- [x] **WORK-04**: Clicking a project card triggers Framer Motion `layoutId` shared layout animation — card expands to fill the screen and transitions into `/projects/[slug]`

### Projects

- [x] **PROJ-01**: Project deep-dive pages (`/projects/[slug]`) are driven by MDX files at `/content/projects/[slug].mdx` — 3 projects: MIMO AI Channel Quality Tool, VLC-based V2V Communication Prototype, IoT Security Project
- [x] **PROJ-02**: Project page renders a vertical phase timeline — GSAP ScrollTrigger draws the line downward as user scrolls, each phase node (circle) scales in (0.85→1.0) as the line reaches it

### Life Page

- [x] **LIFE-01**: `/life` uses Courier Prime for all typography — scoped to this route's layout, signals departure from technical section
- [x] **LIFE-02**: Travel photos render in a grid with slight random rotation (−3° to +3°) — rotation seeded by index, not `Math.random()` (avoids hydration mismatch)
- [x] **LIFE-03**: `/life` includes hobbies and current obsessions sections — brief, visual, no over-explanation
- [x] **LIFE-04**: On page load, photo cards animate in via Framer Motion stagger drop-in

### Transitions

- [x] **TRANS-01**: Page transitions between `/`, `/life`, and `/projects/[slug]` use Framer Motion `AnimatePresence` — dark panel slides in from right, retracts to reveal destination

## v1.1 Requirements (Active Milestone)

### Internationalisation (Content)

- [x] **I18N-V2-01**: MDX project body content translated to German under `src/content/projects/de/[slug].mdx` (v1 shipped EN-only MDX content, v1.1 translates all project bodies to German)

## v2 Requirements (Deferred)

### About — Spline

- [ ] **ABOUT-V2-01**: Spline 3D character built in spline.design (stylized, greeting animation triggers once on section scroll-in via IntersectionObserver, returns to idle loop)
- [ ] **ABOUT-V2-02**: Spline scene lazy-loaded via `next/dynamic({ssr: false})` inside `'use client'` wrapper, rendered desktop-only (≥768px)
- [ ] **ABOUT-V2-03**: Static illustration matches Spline character style — designed in parallel with Spline scene

### Projects — Content depth

- [ ] **PROJ-V2-01**: Project pages include "What I'd do differently" honest reflection section
- [ ] **PROJ-V2-02**: Project pages include code snippets with syntax highlighting (rehype-pretty-code) and repo link

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom cursor | Decided against — distraction from content |
| Log page | Removed — phase notes live inside project pages |
| Contact form | Email link only — no form needed |
| OAuth / any auth | Public portfolio, no login |
| Dark/light mode toggle | Dark-only is the brand |
| Video posts | Not relevant to this project |
| Glassmorphism / gradients (outside hero shader) / shadows | Design decision — flat, edge-to-edge, no decoration |
| Typewriter loops / particle backgrounds / skills bars | Anti-patterns for serious engineer portfolios |
| Cookie banner / analytics | No tracking tools planned for v1 |
| OG image generation per project | Defer — high-ROI but outside ASAP timeline |

## Traceability

Updated during milestone v1.1 planning — 2026-05-22.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 + Phase 9 | Complete |
| FOUND-04 | Phase 1 | Complete |
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 2 | Complete |
| NAV-03 | Phase 2 | Complete |
| ABOUT-01 | Phase 2 | Complete |
| ABOUT-02 | Phase 2 | Complete |
| HERO-01 | Phase 3 | Complete |
| HERO-02 | Phase 3 | Complete |
| HERO-03 | Phase 3 | Complete |
| HERO-04 | Phase 3 | Complete |
| WORK-01 | Phase 4 | Complete |
| WORK-02 | Phase 4 | Complete |
| WORK-03 | Phase 4 | Complete |
| PROJ-01 | Phase 5 | Complete |
| PROJ-02 | Phase 5 | Complete |
| WORK-04 | Phase 6 | Complete |
| LIFE-01 | Phase 7 | Complete |
| LIFE-02 | Phase 7 | Complete |
| LIFE-03 | Phase 7 | Complete |
| LIFE-04 | Phase 7 | Complete |
| TRANS-01 | Phase 8 | Complete |
| I18N-V2-01 | Phase 10 | Complete |

**Coverage:**
- Active requirements: 1 total
- Mapped to phases: 1
- Unmapped: 0

---
*Requirements defined: 2026-05-22*
*Last updated: 2026-05-22 after milestone v1.1 initialization*
