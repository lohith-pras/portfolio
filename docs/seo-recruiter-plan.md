# SEO + Recruiter Visibility — Plan (next PR)

Status of foundation: **~80% done** (robots, sitemap, OG/Twitter, og-image, metadataBase,
static render, favicon, skip-link, localized 404, resume PDF, pruned fast bundle).
Remaining work is additive metadata + traffic/conversion — no architectural change.

## Layer 1 — Findable when someone Googles your name (SEO gaps)

- [ ] **JSON-LD `Person` schema** (highest ROI, ~30 min). Inject `<script type="application/ld+json">`
      with `name`, `jobTitle`, `url`, `sameAs` (GitHub / LinkedIn / Instagram), `alumniOf`,
      `knowsAbout`. Surfaces site #1 for "Lohith Tarikere Prasanna" with rich data.
- [ ] **hreflang / canonical alternates** (~20 min). Add `alternates.languages` (en/de) so the
      two locales don't compete as duplicate content. next-intl supports this.
- [ ] **Per-page metadata** (~15 min). `/life` currently inherits home metadata — add
      `generateMetadata` for a distinct title/description.
- [ ] **Title template** (trivial). `title: { default, template: '%s — Lohith' }`.
- [ ] **Locale-aware `<html lang>`** (~15 min). Root layout hardcodes `lang="en"` even on `/de`.
- [ ] **Google Search Console**: verify `lohithprasanna.dev`, submit `sitemap.xml`.
- [ ] Optional: dynamic `opengraph-image.tsx` per route.

## Layer 2 — Converts when a recruiter lands

- [ ] Hero: one-line role + availability tag under the name
      (e.g. "MIMO / Edge-AI engineer · open to roles"). 5-second decision.
- [ ] **Surface the resume link in the UI** — `public/Lohith_Prasanna_Resume.pdf` exists but is
      not linked anywhere (dead asset). Add to nav or hero.
- [ ] Projects: lead with outcome/impact, not just tech tags.
- [ ] Contact links already solid (email + GitHub + LinkedIn). ✅

## Layer 3 — Drive the traffic (recruiters don't pull, you push)

- [ ] LinkedIn Featured + headline link.
- [ ] GitHub profile README + pinned repos → link site.
- [ ] Resume PDF footer URL + email signature.
- [ ] Custom domain already pro (`lohithprasanna.dev`). ✅

## Layer 4 — Measure

- [ ] Add `@vercel/analytics` (1 native dep, free) or Plausible. Track visits + which projects
      recruiters open.

## Suggested first cut (~1 hr, biggest impact)

JSON-LD Person + resume-link-in-UI + Vercel Analytics.
