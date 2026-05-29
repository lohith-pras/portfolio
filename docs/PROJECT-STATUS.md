# Project Status

Living status doc for the portfolio. Captures what is built, what is open, and what was
deliberately discarded so we do not re-litigate settled decisions.

Last updated: 2026-05-29 (branch `v3_updates`).

Related docs: [PRODUCT.md](../PRODUCT.md) (register, audience, principles),
[portfolio-vision.md](ideas/portfolio-vision.md) (vision), per-feature specs in
[superpowers/specs/](superpowers/specs/).

---

## Current state

The site is a Next.js (App Router) + next-intl (en/de) personal portfolio. Dark,
racing-inspired palette (electric-orange/crimson on near-black). Motion and 3D are treated
as proof-of-craft, not decoration.

### Home (`/`)
- **Shader hero** — full-bleed WebGL gradient background (`ShaderCanvas`), grain overlay.
- **Hero** — name with GSAP scramble entrance. Below the name: the **grain toggle**
  (`too noisy` / `filtered`). The grain toggle lives **only here** (see Discarded).
- **About** — bio text + **Chibi character** R3F scene, blur/scale reveal on scroll.
- **Projects** — `ProjectsSection` + `ProjectCard`: sticky scroll-stacking cards that scale
  and fade as you scroll through them. Replaced the old `WorkSection` (see Discarded).

### Life (`/life`)
- `LifeClient` — intro, Hobbies / Current Obsessions lists (staggered), waving team flags.
- **Places lived** — `PlacesSection` + `PlaceCard`: pinned horizontal scroll on desktop,
  vertical stack on mobile, R3F `PlaceScene` per place, progress dots (active dot expands
  to a pill).

### Navigation
- **Desktop** (`NavbarDesktop`) — logo links home, Life link with sliding active indicator,
  email / GitHub / LinkedIn icons.
- **Mobile** (`NavbarMobile`) — bottom glass pill: Home / Life / email / GitHub / LinkedIn.

### Motion system
- Ease tokens in `globals.css` (`--ease-out-quart/quint/expo`), `.link-wipe` underline
  utility, "View Project" CTA arrow slide, list staggers, progress-dot pill.
- All animations honor `prefers-reduced-motion` (global CSS block + Framer auto-respect).

### Social links (canonical — keep consistent across Hero/navbars)
- GitHub: `https://github.com/lohith-pras`
- Email: `lnlohith3@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/loh-pras`

---

## Open / left to do

- **Scroll caret** (`HeroSection`) still uses generic `animate-bounce`. Candidate: drive
  fade/translate from actual scroll position instead of an infinite loop.
- **Nav active-section indicator** on the home page (scroll-spy between hero/about/projects).
  Desktop nav only has the Life-route indicator today.
- **Tooling note:** the `framer-motion` skill is broken (404). Use the
  `design-motion-principles` skill for motion work to avoid AI-slop patterns.

---

## Discarded — do NOT revisit

These were considered and rejected on purpose. Resurrecting them is a regression.

- **`WorkSection.tsx`** — deleted. Superseded by `ProjectsSection` + sticky `ProjectCard`
  stack. Do not bring back the old section.
- **Hero contact row** (`email · GitHub · LinkedIn` text links under the name) — removed.
  Socials live in the navbars on both pages; the hero row was redundant.
- **Grain toggle in the navbars** — removed. Grain only affects the home-page shader, so a
  toggle visible on `/life` (which has no shader) was misleading. Toggle is hero-only.
- **Magnetic-pull on links** — skipped. Slop risk, low payoff.
- **Custom cursor / cursor follower** — skipped. Off-brand, slop risk.
- **Per-word/char stagger reveals on section headings** — skipped. The GSAP hero scramble is
  the signature entrance; adding char reveals to every heading dilutes it and is the
  fade-on-scroll AI tell the brand register warns against.
- **Number-watermark parallax** on project cards — skipped. Scroll-reflex decoration.
