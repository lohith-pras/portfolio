# LTP Portfolio v2

## What This Is

Personal portfolio website for Lohith Tarikere Prasanna — a complete rehaul of the old resume-style site. Built to show what he builds, how he thinks, and who he is — not where he worked and studied. Audience: both recruiters/hiring teams and potential collaborators in AI, wireless, and mobility. Deployed at a new Vercel project pointing to this repo.

## Core Value

Visitors leave knowing Lohith is a builder with intent and a distinct perspective — not just a candidate with a CV.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Hero section with shader gradient (warm orange-to-crimson), full name, contact links — no bio
- [ ] About section with Spline 3D character (greeting animation on scroll) + mobile static illustration fallback + short descriptor text
- [ ] Work section with project cards (GSAP stagger reveal), expandable via Framer Motion layoutId into project deep-dive pages
- [ ] Contact section — email + socials, minimal
- [ ] /life page — full Courier Prime, travel photos with random rotation, hobbies, current obsessions
- [ ] /projects/[slug] — MDX-driven deep-dives with GSAP-drawn phase timeline
- [ ] Navigation — transparent top bar desktop, fixed bottom bar mobile, EN/DE toggle
- [ ] Internationalisation — next-intl, EN + DE via DeepL API, sub-path routing (/en, /de)
- [ ] Design system — Space Mono + Plus Jakarta Sans + Courier Prime, #0A0A0A bg, #FF1E00 accent, fluid type via clamp()
- [ ] Responsive — mobile-first Tailwind, GSAP matchMedia, Spline lazy-loaded desktop only
- [ ] Performance — Lighthouse mobile ≥ 85

### Out of Scope

- Custom cursor — decided against, browser default only
- Log page — removed, phase notes live inside project pages
- OAuth / any auth — public portfolio, no login
- Contact form — email link only, no form
- Video posts — not in v1
- Dark/light mode toggle — dark-only, that's the brand

## Context

- **Old site:** https://ltp-portfolio.vercel.app/ — React 19 + Vite, resume layout, being replaced entirely
- **Starting fresh** — old repo structure too coupled to resume layout, new repo from scratch
- **Stack decision:** Next.js App Router (not pages), TypeScript, Tailwind, GSAP + ScrollTrigger for scroll/macro animations, Framer Motion for component/transition animations, Spline for About 3D scene
- **Spline character:** Not yet built — needs to be designed and built in spline.design as part of this project
- **Three projects to document in MDX:** MIMO AI Channel Quality Tool (active), VLC-based V2V Communication Prototype, IoT Security Project
- **i18n:** next-intl + DeepL Pro API, English first then DE translation pass, hero name stays English in DE locale
- **Fonts:** Space Mono (display), Plus Jakarta Sans (body), Courier Prime (/life only) — all via next/font/google

## Constraints

- **Timeline:** ASAP — target weeks, not months. Ship polished v1, iterate after.
- **Tech stack:** Next.js App Router + TypeScript locked. GSAP + Framer Motion (not either/or, both have defined domains). Spline via @splinetool/react-spline.
- **Performance:** Lighthouse mobile ≥ 85 — drives lazy loading decisions (Spline, GSAP modular imports, Next.js Image everywhere)
- **Shader gradient:** `shader-gradient` npm package (by Faraz Shaikh), warm color palette locked — electric orange `#FF4500` → deep crimson `#C0001A` → `#0A0A0A`
- **MDX:** @next/mdx for project deep-dives, files at /content/projects/[slug].mdx
- **i18n routing:** Sub-path (/en, /de) not domain-based — shareable, SEO-friendly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start fresh repo (not refactor old) | Old structure too coupled to resume layout | — Pending |
| GSAP owns scroll/macro, Framer Motion owns component/transition | Clear domain split prevents conflicts | — Pending |
| Shader gradient warm palette (orange-crimson) | "Blues say researcher. Orange-crimson on black says builder with intent." | — Pending |
| Spline 3D on desktop, static illustration on mobile | Performance — Spline costly on mobile, illustration matches model style | — Pending |
| No custom cursor | Decided against — distraction from content | — Pending |
| next-intl sub-path routing (/en, /de) | SEO-friendly, shareable URLs | — Pending |
| Hero name stays English on DE locale | It's a name, not a translatable string | — Pending |
| /life page full Courier Prime | Font signals mood shift — you've left the technical section | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-22 after initialization*
