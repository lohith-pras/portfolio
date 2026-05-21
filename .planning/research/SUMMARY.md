# Research Summary — LTP Portfolio v2

**Synthesized:** 2026-05-22
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md, PROJECT.md
**Consumer:** gsd-roadmapper agent

---

## TL;DR

- **i18n-first is a hard constraint** — next-intl's `[locale]` routing segment changes every URL; adding it after pages are built means rewriting everything. It must be Phase 1, not an afterthought.
- **Three stack items need npm verification before coding starts:** the exact shader-gradient package name (`shadergradient` vs `@shadergradient/react`), whether `@splinetool/react-spline/next` subpath exists in the current release, and the Tailwind v4 vs v3.4 choice (decide based on whether `@tailwindcss/typography` has shipped v4 support).
- **The Framer Motion `layoutId` cross-route transition does not work natively** in App Router — the architectural choice (intercepting routes vs manual FLIP vs View Transitions API) must be made before building the Work section card component, because the component tree differs per approach.
- **Resume/CV download is the most-missed table stake on design-style portfolios** and is not in PROJECT.md scope — add a PDF link to nav or contact before v1 ships or explicitly decide to omit it.

---

## Recommended Stack

### Locked (no ambiguity)

| Technology | Version | Decision |
|---|---|---|
| Next.js | `^15.x` App Router | Locked by PROJECT.md; required for `[locale]` routing + RSC + `generateMetadata` per-locale |
| React | `^19.x` | Ships with Next 15; use `useGSAP` (not raw `useEffect`) because of React 19 Strict Mode double-mount |
| TypeScript | `^5.6+` | Strict mode on; `moduleResolution: "bundler"` |
| GSAP | `^3.13.x` + `@gsap/react ^2.1.x` | All plugins now free/MIT since May 2024; `useGSAP` is mandatory for React 19 |
| Framer Motion | `^11.x` (package: `framer-motion`) | Component-level animations only; GSAP owns scroll/macro — enforce this split from day one |
| next-intl | `^4.x` | Sub-path routing (`/en`, `/de`); `localePrefix: 'always'` required per PROJECT.md |
| `@next/mdx` | `^15.x` | Build-time MDX; `mdx-components.tsx` at project root required |
| `next/font/google` | bundled with Next 15 | All three fonts via this — no external Google Fonts link |
| DeepL Pro API | build-time script only | Translate `messages/en.json` → `messages/de.json`; never call at runtime |
| Vercel | hosting | Native Next 15, edge middleware for next-intl, ISR |
| `rehype-pretty-code` + Shiki | latest | Build-time syntax highlighting; zero runtime cost |
| `remark-gfm` | latest | GFM tables/strikethrough in MDX |

### Needs Verification Before Phase 1 Coding

| Item | Issue | Action |
|---|---|---|
| **shader-gradient package name** | Two packages exist: `shadergradient` (old) and `@shadergradient/react` (new). PROJECT.md says "shader-gradient npm package" but doesn't pin exact name. Wrong package = different component API. | Run `npm view shadergradient` and `npm view @shadergradient/react`, check shadergradient.com export panel |
| **Tailwind version** | v4 recommended for fresh project (CSS-first config, faster). But `@tailwindcss/typography` for MDX prose styling and `prettier-plugin-tailwindcss` both need v4-compatible releases. | Check `npm view @tailwindcss/typography` and `npm view prettier-plugin-tailwindcss` for v4 support before deciding |
| **`@splinetool/react-spline/next` subpath** | STACK.md documents this import path but confidence is MEDIUM. If the subpath doesn't exist, the fallback is `dynamic(() => import('@splinetool/react-spline'), { ssr: false })` from a `'use client'` wrapper. | `npm view @splinetool/react-spline exports` or check package README |
| **Framer Motion cross-route strategy** | `layoutId` card-to-deep-dive transition requires either intercepting routes (`@modal` slot), manual FLIP, or View Transitions API. Architectural choice affects component structure before Work section is built. | Decide strategy in Phase 1 design; intercepting routes is recommended for v1 |
| **All version pins** | Both STACK.md and PITFALLS.md note that version numbers were not verified against npm during research. | Run `npm view <pkg> version` for every package in the version pinning table before `npm install` |

### What NOT to Use (firm exclusions)

`react-spring`, `lottie-react`, raw `useEffect`+`gsap.context()`, `import * from 'gsap/all'`, `next-i18next`, `contentlayer` (archived), `next-mdx-remote` for local files (use `@next/mdx`), `prism-react-renderer`/`highlight.js`, CSS-in-JS runtimes, `localePrefix: 'as-needed'`, mounting Spline on mobile and hiding via CSS (bundle still ships).

---

## Build Order

Research agents agreed on this sequence. Each layer is a hard blocker for the layers below it.

```
1. Foundation
   └─ Next.js + TS + Tailwind init, next/font, design tokens, repo/CI setup
      UNBLOCKS: everything

2. i18n Routing (MUST be before any page work)
   └─ next-intl install, middleware.ts, [locale] routing skeleton,
      messages/en.json + de.json stubs, LocaleSwitcher
      WHY FIRST: Adding [locale] segment later rewrites every URL and every page.
      UNBLOCKS: all page routes, static params generation

3. Chrome + Providers
   └─ Root layout, GSAP plugin registration (lib/gsap.ts), NextIntlClientProvider,
      TopNav/BottomNav skeleton, PageTransition (AnimatePresence) wrapper
      UNBLOCKS: all section animation work, client-side routing

4. Homepage Static Shell
   └─ Hero/About/Work/Contact sections — static HTML + i18n strings, NO animations yet
      WHY: Review composition and copy without animation noise. Establishes visual identity.
      UNBLOCKS: content authoring, visual sign-off

5. MDX Pipeline
   └─ @next/mdx config (with next-intl plugin nesting), mdx-components.tsx,
      /content/projects/ structure, [slug]/page.tsx, one sample MDX renders end-to-end
      WHY: Content authoring is the long-pole — unblock it early so MDX files can be
      written in parallel with animation work.
      UNBLOCKS: project deep-dive content authoring

6. Work Section + Card-to-Deep-Dive Transition
   └─ Project cards, Framer layoutId (via chosen routing strategy — decide before building),
      GSAP stagger reveal, intercepting routes if using modal pattern
      DEPENDS ON: MDX pipeline (destination route must exist for layoutId to work)

7. About Section + Spline + Shader Gradient
   └─ Spline 3D scene (desktop, dynamic + ssr:false), static illustration fallback (mobile),
      shader-gradient hero (dynamic + ssr:false)
      WHY LATE: Isolated, risky for Lighthouse — easier to scope-cut if timeline slips.
      WebGL context management must be resolved here.

8. /life Page
   └─ Courier Prime scoped to this route, travel photos (Next.js Image), seeded rotation,
      hobbies/obsessions content
      NOTE: Random rotation MUST be seeded (index or filename hash) — Math.random()
      causes hydration mismatch between server and client.

9. MDX Deep-Dive Features
   └─ PhaseTimeline GSAP component, reading time (build-time), scroll progress indicator,
      all three project MDX files (MIMO AI, VLC V2V, IoT Security)

10. DE i18n Pass
    └─ DeepL translation script (build-time, not runtime), XML tag protection for ICU
       placeholders, manual review of DE catalog before deploy
       SCOPE: UI chrome (messages/de.json) only in v1. MDX body translation → v1.1.

11. Performance Hardening
    └─ Lighthouse CI gate (fail below 85 mobile), bundle analyzer, Spline/shader-gradient
       lazy-load audit, GSAP modular import audit, image optimization audit
```

**Dependency callout: Spline character is a creative asset, not a code task.** The Spline 3D character must be designed and built in spline.design before the About section UI can land. Stub the About section with a placeholder rectangle; wire the real Spline component once the scene is ready.

---

## Critical Pitfalls by Phase

### Phase 1–2: Foundation + i18n

| Pitfall | What breaks | Prevention |
|---|---|---|
| **GSAP plugins not registered in a single module** | ScrollTrigger / DrawSVG silently absent in prod; works in dev due to module order | Create `lib/gsap.ts` as the only GSAP import surface: `'use client'`, registers all plugins, re-exports `gsap`. No component imports directly from `'gsap'`. |
| **next-intl middleware forces all routes dynamic** | Every page becomes SSR; Lighthouse tanks; Vercel invocations spike | Follow next-intl App Router setup exactly: `[locale]` segment + `setRequestLocale(locale)` in every layout/page + `generateStaticParams` returning all locales. Verify `next build` shows `○ (Static)` not `ƒ (Dynamic)` for `/en` and `/de`. |
| **Courier Prime loaded on every route** | 200+ kB font payload on non-/life pages | Load Courier Prime ONLY in `app/[locale]/life/layout.tsx`. Space Mono + Plus Jakarta Sans go in root layout only. |
| **Lighthouse CI not wired from day 1** | Perf debt compounds silently; 85 mobile is a firefight at the end | Wire Lighthouse CI on every PR from Phase 1. Fail builds below 85 mobile. JS budget: hero route < 250 kB, project page < 200 kB. |

### Phase 3–4: Chrome + Static Shell

| Pitfall | What breaks | Prevention |
|---|---|---|
| **GSAP Strict Mode double-mount** | Duplicate ScrollTriggers; pin offsets stack; animations replay on every dev hot reload | Always `useGSAP` from `@gsap/react` with `scope: containerRef`. Never raw `useEffect` + `gsap.to`. |
| **GSAP and Framer Motion domain overlap** | Both libraries write to `transform` on same element; stutter/cancel | Write animation split doc before any animation code. Enforce: GSAP = scroll/macro, Framer = component/transition. ESLint rule: flag `whileInView` if `gsap` is imported in the same file. |

### Phase 5: MDX Pipeline

| Pitfall | What breaks | Prevention |
|---|---|---|
| **@next/mdx auto-routes only files inside `app/`** | `/content/projects/*.mdx` requires dynamic import in `page.tsx` — not automatic routing | Use dynamic import pattern: `const { default: Post } = await import('@/content/projects/${slug}.mdx')` in `[slug]/page.tsx`. `generateStaticParams` enumerates all slug+locale pairs. |
| **Missing `mdx-components.tsx` at project root** | Build error: "useMDXComponents is not exported" | `mdx-components.tsx` MUST be at project root. Non-negotiable per `@next/mdx` App Router convention. |
| **`next-intl` and `@next/mdx` plugin nesting wrong** | One or the other silently breaks | Correct order: `withNextIntl(withMDX(config))` — MDX is inner, next-intl is outer. |

### Phase 6: Work Section / Card Transition

| Pitfall | What breaks | Prevention |
|---|---|---|
| **Framer `layoutId` across route change** | Hard navigation flash instead of morph | Intercepting routes (`@modal` slot): `app/[locale]/@modal/(.)projects/[slug]/page.tsx`. `(.)` is correct depth. Test both: click-from-grid (modal) AND direct URL hit (full page). |
| **ScrollTrigger fires before fonts load** | Triggers fire 100–300 px off on first visit | `document.fonts.ready.then(() => ScrollTrigger.refresh())` in root Providers. Also refresh after Framer `onAnimationComplete` and after Spline ready. |

### Phase 7: Shader Gradient + Spline

| Pitfall | What breaks | Prevention |
|---|---|---|
| **Spline not dynamically imported with `ssr: false`** | `window is not defined` crash in production build | `dynamic(() => import('@splinetool/react-spline'), { ssr: false })` inside a `'use client'` wrapper. Gate render on `useIsDesktop()` — don't mount-then-hide. |
| **WebGL context leak across navigations** | Hero gradient turns black after 6–8 route changes | Mount shader-gradient ONCE in root layout at `position: fixed; z-index: 0`. Never have shader-gradient AND Spline rendering simultaneously. |
| **CLS from canvas resize** | Lighthouse CLS > 0.1; canvas mounting shifts content | Reserve hero height with `min-height: 100svh` in CSS before JS executes. Render same-dimensions placeholder div for Spline that swaps on load. |
| **ScrollTrigger pin jank on mobile** | iOS Safari address bar collapse shifts pinned sections | `gsap.matchMedia({ '(min-width: 1024px)': () => { /* pins */ } })`. Use `100svh` not `100vh`. Never pin on mobile. |

### Phase 8: /life Page

| Pitfall | What breaks | Prevention |
|---|---|---|
| **`Math.random()` for photo rotation** | Hydration mismatch: server and client render different rotations; React error | Derive rotation from index: `(index * 13.7 + 45) % 30 - 15`. Same input → same output. Document the pattern in a comment. |

### Phase 10: DE Translation

| Pitfall | What breaks | Prevention |
|---|---|---|
| **DeepL mangling ICU placeholders** | `{name}` → `{Name}` → next-intl substitution fails | Use `tag_handling=xml` + `ignore_tags`. Wrap ICU vars in `<x>{name}</x>` before sending, strip after. Snapshot test all translation keys in both locales. |
| **Full message catalog shipped to client** | Both EN and DE bundles in browser JS | Pass only needed namespaces to `NextIntlClientProvider`. Prefer server-side `getTranslations` over client-side `useTranslations` wherever possible. |

---

## Scope Gaps and Recommendations

### Gap 1: Resume/CV download link not in PROJECT.md

FEATURES.md flags this as "the most-missed table stake on design-style portfolios." A single PDF link in nav or contact section is a 30-minute addition with high recruiter-conversion ROI.

**Recommendation:** Add `resume.pdf` to `/public/` and a download link in the Contact section and nav. Include in Phase 4 (Homepage Static Shell). If the decision is to omit, log it explicitly in PROJECT.md Key Decisions with rationale.

### Gap 2: MDX body translation deferred to v1.1

Translating three MDX deep-dives via DeepL is non-trivial: code blocks, captions, and frontmatter all need special handling. The "ASAP — target weeks, not months" timeline makes full MDX body translation a v1.1 follow-up.

**Recommendation:** v1 ships EN-only MDX with DE UI chrome only. Log this in PROJECT.md. The parallel `.de.mdx` file strategy (already in the folder structure from ARCHITECTURE.md) is the right approach when v1.1 is planned.

### Gap 3: `/life` random rotation must be seeded

`Math.random()` at render time causes a hydration mismatch between server and client HTML. Easy to get wrong, impossible to debug without knowing the cause.

**Recommendation:** In Phase 8, derive rotation angle deterministically from index or filename hash. Document the pattern in a comment so future contributors don't "fix" it back to `Math.random()`.

### Gap 4: OG images per project deferred

Per-project OG images via `@vercel/og` are high-ROI for URL sharing in recruiter Slack threads, but add complexity. FEATURES.md recommends deferring if timeline is tight.

**Recommendation:** Defer to v1.1. In v1, use a static OG image in root layout. Add a comment in `app/[locale]/projects/[slug]/page.tsx` noting where `generateMetadata` with per-project OG goes in v1.1.

### Gap 5: Competitive reference scan not done

FEATURES.md could not verify against live 2026 portfolio examples. Before finalizing visual choices, do a manual scan of 5–10 reference sites: Brittany Chiang, Lee Robinson, Rauno Freiberg, Cassidy Williams, current Awwwards SOTD picks.

**Recommendation:** Block 2 hours before Phase 4 (Static Shell) to scan references and confirm or adjust visual identity decisions.

---

## Open Questions (resolve before Phase 1 coding)

| # | Question | Why it blocks | Resolution |
|---|---|---|---|
| 1 | **Exact shader-gradient package name** (`shadergradient` vs `@shadergradient/react`) | Wrong package = different component API; non-trivial swap mid-build | `npm view shadergradient` + `npm view @shadergradient/react` + shadergradient.com "Export Code" panel |
| 2 | **Tailwind v4 or v3.4?** | v4 has no `tailwind.config.js`; different DX and plugin ecosystem. Plugin compatibility must be confirmed before installing. | Check `npm view @tailwindcss/typography` for v4 support; fall back to v3.4.x if blocked |
| 3 | **Framer Motion cross-route strategy** | Intercepting routes vs manual FLIP vs View Transitions API — each requires different folder structure and component tree. Must decide before Work section card is built. | Recommended: intercepting routes for v1. Confirm against current Next.js docs on parallel + intercepting routes with `[locale]` segment. |
| 4 | **`@splinetool/react-spline/next` subpath** | If subpath doesn't exist, About section component structure differs | `npm view @splinetool/react-spline exports` or check package README on npm |
| 5 | **Framer Motion package name** (`framer-motion` vs `motion`) | Mid-rebrand; both work, different import paths. Pick one now for consistency. | Use `framer-motion` for v1 (more documented examples); migrate to `motion` in v2 if desired |
| 6 | **Resume/CV PDF exists?** | Can't add the download link without a file | Create or locate the current CV PDF before Phase 4 |
| 7 | **Spline character status** | Spline character must be designed in spline.design before About section ships | If not started, stub About with static illustration through Phases 4–6; start character creation in parallel |

---

## Confidence Assessment

| Area | Confidence | Notes |
|---|---|---|
| Core stack (Next.js 15, React 19, GSAP, next-intl, @next/mdx) | HIGH | Locked by PROJECT.md, stable and well-documented APIs |
| Shader-gradient, Spline subpath, Tailwind v4 plugins | LOW-MEDIUM | Unverified against npm; must confirm before install |
| Feature scope — table stakes and anti-features | HIGH | Durable UX principles; low risk |
| Feature scope — differentiators | MEDIUM | Trend-based; competitive scan not done |
| Architecture — Server/Client boundaries, GSAP patterns | MEDIUM-HIGH | Established patterns; exact next-intl v4 API surface needs doc cross-check before Phase 2 |
| Build order — hard blockers | HIGH | i18n-first and MDX-before-content are unambiguous |
| Pitfalls — GSAP registration, Strict Mode, Spline SSR, static rendering | HIGH | Well-documented official patterns with clear prevention paths |
| Pitfalls — WebGL context leak, cross-route layoutId, intercepting routes + locale | MEDIUM | Commonly reported; verify at implementation time |
| Version pins (exact semver) | LOW | Not verified against npm during research; run `npm view` loop before installing |

**Overall: MEDIUM-HIGH.** Architecture, build order, and critical pitfalls are well-grounded. Main uncertainty is 3 package-level details (shader-gradient name, Spline subpath, Tailwind v4 plugin ecosystem) that require 15 minutes of npm verification to resolve.

---

## Sources (aggregated)

Research conducted from training data (early 2026 cutoff). External tools (WebSearch, WebFetch, Context7, Brave) were unavailable during this research pass. Cross-check against current docs at implementation time.

- https://nextjs.org/docs — App Router, `@next/mdx`, `next/font`, `dynamic`, intercepting routes
- https://gsap.com/resources/React/ — `useGSAP`, current licensing
- https://next-intl.dev/docs/getting-started/app-router — v4 setup, `setRequestLocale`, static rendering
- https://www.shadergradient.com/ — current export package name and component API
- https://motion.dev/ and https://www.framer.com/motion/ — current package name, `layoutId`, `LazyMotion`
- https://docs.spline.design/ — Next.js App Router integration, `/next` subpath
- https://www.deepl.com/docs-api/xml/ — ICU placeholder protection with tag handling
- https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes — parallel + intercepting routes with `[locale]`
