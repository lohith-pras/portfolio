# Feature Landscape

**Domain:** Developer/engineer portfolio website (AI, wireless, mobility)
**Audience:** Recruiters AND technical collaborators (dual-mode)
**Researched:** 2026-05-22
**Confidence:** MEDIUM (web search unavailable; based on training data spanning portfolio trends through 2025, project context, and durable UX principles. Findings reflect patterns from Awwwards-tier engineering portfolios, Vercel/Linear/Rauno-style developer sites, and recruiter-facing portfolio guidance.)

---

## Table Stakes

Features users expect. Missing = visitor leaves confused or bounces.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Hero with name + role hook** | First 3 seconds — who, what, why care | Low | Already in spec: shader gradient + name. Role/discipline tag (AI / wireless / mobility) belongs near the name so recruiters scanning understand domain before scrolling. |
| **Contact links accessible everywhere** | Recruiters skim, decide in seconds, want to act fast | Low | Email + LinkedIn + GitHub in hero AND in nav AND in contact section. Friction kills conversions. |
| **Project showcase with case studies** | The single most important section for recruiters and collaborators | High | Already planned: work cards → MDX deep-dives. This IS the portfolio. |
| **Clear navigation** | Users orient in <2s or leave | Low | Already in spec: top bar desktop, bottom bar mobile. Standard pattern. |
| **Mobile responsive** | >50% of traffic from mobile/recruiter forwards from phones | Med | Already in spec. Spline lazy-loaded desktop only is the right call. |
| **Fast initial load (<3s)** | SEO + bounce rate. Recruiters won't wait. | Med | Lighthouse ≥85 target is right. Below 70 = visible problem. |
| **About / who-you-are section** | Recruiters need context: years, focus areas, location, language | Med | About w/ Spline + descriptor is in spec. Add years-in-field, location, openness signal (open to roles / collaborations / consulting). |
| **Project metadata visible at glance** | Stack, role, dates, outcome — before reading | Low | Show on cards AND inside deep-dive header. Stack tags = recruiter filter. |
| **Visible tech stack per project** | "Does this person use what we use?" — fastest recruiter filter | Low | Tag chips on cards (e.g. `Python` `MATLAB` `5G`). Required for recruiter scanning. |
| **Working external links (GitHub, LinkedIn, scholar)** | Verification — recruiters check 2nd-degree proof | Low | Open in new tab. GitHub link especially — recruiters check commit history. |
| **Resume / CV download or link** | Recruiters need it for ATS/sharing internally | Low | Even if site IS the portfolio, recruiters still ask "do you have a PDF?" Single PDF link in nav or contact section suffices. **This is the most-missed table stake on designer-style portfolios.** |
| **Page titles + meta + OG image** | Shared in Slack/email by recruiters — link preview matters | Low | Per-page OG images for project deep-dives. Recruiters share URLs internally. |
| **Accessible (keyboard, contrast, alt text)** | Subset of recruiters/teams filter on this; also SEO | Med | `#FF1E00` on `#0A0A0A` needs contrast check for body text (likely fails AA at small sizes — use only for accents). |
| **404 page that recovers** | Old links from blog comments, social posts | Low | Custom 404 with back-to-home + maybe a quip. |

---

## Differentiators

Features that set this portfolio apart from the template-y crowd. Not expected, but compound trust + memorability.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **MDX project deep-dives with phase timeline** | Most portfolios show a tile + GitHub link. Deep-dives = "this person thinks." Phase timeline = "this person ships." | High | Already in spec. GSAP-drawn timeline = signature visual. Crucial: each MDX must answer Problem → Approach → Decisions → Outcome → What I'd do differently. The "what I'd do differently" is the credibility multiplier. |
| **Shader gradient hero (warm orange-crimson)** | Visual identity. Most engineer portfolios use blue/monochrome. Warm = builder-energy, distinctive. | Med | Already in spec. Stand-out signal. Color choice is on-brand and rare in engineer space. |
| **Spline 3D character (greeting on scroll)** | Personality injection. Engineers showing personality = rare and memorable. | High | Already in spec. Risk: feels gimmicky if character looks stock. Custom design matters. Static illustration fallback on mobile is correct. |
| **/life page with different typography (Courier Prime)** | Signals dimensionality. "I am a person, not a CV." Travel + obsessions humanize. | Med | Already in spec. Typography shift as semantic signal = sophisticated move. Random photo rotation = playful detail that says "polished." |
| **Smooth scroll-driven storytelling (GSAP ScrollTrigger)** | Pace = perceived quality. Stagger reveals + pinned sections feel "made," not "assembled." | High | Already in spec. Use sparingly — every section animating = noise. Pick 2-3 hero moments. |
| **Layout-id transition from card → deep-dive (Framer Motion)** | Magic moment. Cinematic feel rare in engineer portfolios. | High | Already in spec. Hard to get right (image dimensions, scroll position restore on back). Worth it. |
| **EN/DE i18n with proper sub-path routing** | Signals: serious about German market / EU collab. Most engineer portfolios are EN-only. | Med | Already in spec. Differentiator specifically because target includes German-speaking AI/mobility orgs. |
| **Domain-specific case studies (wireless, AI, mobility)** | Targeted projects > generic CRUD apps. Each project signals depth in a niche. | Med | The three MDX projects (MIMO AI, VLC V2V, IoT Security) are themselves the differentiator. Lean into the depth. |
| **Visible decision-making (Key Decisions tables in MDX)** | Recruiters and collaborators both value reasoning > output. Showing tradeoffs = senior signal. | Low | Match the format used in PROJECT.md (Decision / Rationale / Outcome). Re-use is itself a meta-signal of disciplined thinking. |
| **Phase notes inside project pages (not separate log)** | Already decided in spec. Phase logs = process transparency. | Med | Aligns with "what I'd do differently" — show the messy middle, not just the polished outcome. |
| **Subtle micro-interactions on links/buttons** | Polish signal. Hover states, focus rings, link underline animations. | Low | Framer Motion hover variants. Subtle = good. Bouncy = juvenile. |
| **Cursor-aware animations (without custom cursor)** | E.g. project cards tilt slightly to mouse position. Personality without the overused custom cursor. | Med | Honors the "no custom cursor" decision while still feeling alive. Use Framer Motion `useMotionValue` + `useTransform`. |
| **Scroll progress indicator on long MDX pages** | UX cue for "how much is left" on deep-dives. | Low | Thin top bar tied to scroll. 2 hours of work, big perceived polish gain. |
| **Reading time on MDX deep-dives** | Recruiter time budget — "5 min read" sets expectation, raises read-through. | Low | Compute at build time from MDX content. |
| **Subtle audio/haptic cues — OFF by default** | If you want it: ambient hover tone on hero. Optional, mute-able. | Med | Only do this if you commit to taste — bad audio is worse than no audio. Probably skip. |

---

## Anti-Features

Features to explicitly NOT build. Each one distracts from "Lohith is a builder with intent."

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Custom cursor** | Already excluded in spec. Distraction, accessibility hit, overused trend that now reads "template." | Browser default. Use cursor-aware motion on elements (cards) instead. |
| **Dark/light mode toggle** | Already excluded in spec. Dark-only IS the brand. Toggle = "I couldn't decide." | Commit to dark. Make it look intentional, not default-dark. |
| **Contact form** | Already excluded in spec. Forms = recruiter friction (they want to forward an email). | Email link with `mailto:` and copy-to-clipboard fallback. |
| **Blog with date-stamped posts on the homepage** | Stale-blog problem — last post "3 years ago" actively hurts. Engineer portfolios with dead blogs read as abandoned. | If you want long-form, put it inside project deep-dives or on /life. No date stamps you have to maintain. |
| **Skills bar chart / percentage proficiency** | Universally read as cringe by senior engineers and most recruiters. "Python 87%" means nothing. | Show skills via project tags. Demonstrate, don't rate. |
| **Testimonials / quote carousels** | Read as marketing-template. Not credible without recognizable names. Engineer portfolios don't need them. | Let the work speak. If you have a strong reference, mention in `/life` casually or in CV. |
| **Animated typewriter "I am a [Developer][Designer][Hacker]" loops** | Aggressively dated (2018-era). Reads as junior. | Static role line. Confidence > novelty. |
| **Particle.js / network-of-dots backgrounds** | Universally dated. The shader gradient replaces this. | Already handled by shader gradient. |
| **Floating social icons that follow scroll** | Visual noise. Modern pattern: in nav + in contact section. | Already in spec — nav + contact section. |
| **Loading screens / preloaders with logo animation** | Adds perceived latency. Hurts Lighthouse. | Stream content, animate-in as it arrives. Acceptable: subtle fade-up on first paint. |
| **Visitor counter / "since 20XX" footer text** | Outdated trope. Reads amateur. | Just a year and copyright if needed. Even that is optional. |
| **Auto-playing video/audio of any kind** | Trust-killer, especially on mobile. | Click-to-play. Probably skip entirely per spec (no videos in v1). |
| **"Made with [framework]" badges in footer** | Either irrelevant (recruiters don't care) or amateur (engineers don't brag about stack choice in footer). | If you want to signal stack, put it in /life under "currently obsessed with." |
| **Newsletter signup** | Wrong product. Portfolio is a brochure, not a content business. | Don't. |
| **Cookie banner unless legally required** | Friction. Don't track if you don't need to. If you use Vercel Analytics (cookie-less), no banner needed. | Use Vercel Analytics or Plausible (cookie-less). |
| **Easter eggs that block content** | E.g. konami codes that take over the screen. Cute for friends, friction for recruiters. | Optional: tiny console.log Easter egg for engineers viewing source. That's the right audience for it. |
| **Generic "Hello, I'm a passionate developer" copy** | Template-language flag. Instant signal of low-effort portfolio. | Specific, concrete, in your voice. Already implied by /life direction. |
| **Project filters by tech** | Only useful at >10 projects. With 3 deep-dives, filters add UI cost without payoff. | Just list all three. Reconsider at 10+. |
| **Light box image galleries on project pages** | MDX deep-dives don't need photo gallery UX. Inline images with proper captions read more authoritative. | Use Next.js Image with captions inline in MDX. |
| **Achievement badges / "5-star rated on Upwork"** | Off-brand for senior engineer audience. | Skip. |

---

## Feature Dependencies

Build-order constraints. Read top-to-bottom.

```
Design system (fonts, colors, type scale)
  └─ All visual components depend on this — establish first

Layout shell (App Router root layout, nav, footer)
  └─ Required before any page can be styled
  ├─ Navigation (transparent top + fixed bottom)
  └─ i18n routing (next-intl middleware sets locale before layout renders)
        └─ EN/DE toggle UI lives in nav

Homepage sections (Hero → About → Work → Contact)
  ├─ Hero
  │   └─ Shader gradient component (lazy-loaded, client-only)
  ├─ About
  │   ├─ Spline 3D character (desktop) — depends on character being built in spline.design FIRST
  │   ├─ Static illustration fallback (mobile) — depends on illustration asset existing
  │   └─ Greeting animation on scroll — depends on GSAP ScrollTrigger registered
  ├─ Work
  │   ├─ Project card component
  │   ├─ GSAP stagger reveal — depends on ScrollTrigger
  │   └─ Framer Motion layoutId — REQUIRES matching layoutId on /projects/[slug] hero
  │       └─ Therefore: project deep-dive page route must exist before card→page transition can work
  └─ Contact
      └─ Email + socials (lowest dependency, can be built anytime)

MDX infrastructure (@next/mdx config, MDX components map, syntax highlighting)
  └─ Required before any /projects/[slug] page renders
  ├─ MDX layout component (per-project frame)
  ├─ Frontmatter parsing (title, stack, dates, OG image)
  ├─ Reading time computation (build-time)
  ├─ Phase timeline component (GSAP-drawn)
  └─ Three project MDX files (MIMO AI, VLC V2V, IoT Security)

/life page
  ├─ Courier Prime font scope (font-family override at route level)
  ├─ Travel photos asset pipeline (Next.js Image, optimized)
  └─ Random rotation logic (CSS transform with seeded randomness — must be stable per-image to avoid hydration mismatch)

i18n content layer
  ├─ next-intl message catalogs (en.json, de.json)
  ├─ DeepL Pro API translation pipeline (likely build-time script, not runtime)
  └─ Hero name override (English-locked even in DE)
  └─ MDX translation strategy — decide: translate MDX bodies or keep English + UI-chrome translated?

Performance pass (last)
  ├─ Spline lazy-load + desktop-only gate
  ├─ GSAP modular imports (no full bundle)
  ├─ Image optimization audit
  ├─ Font subsetting
  └─ Lighthouse mobile ≥ 85 gate
```

**Critical dependency callouts:**

1. **Spline character must be designed before About section UI lands.** Blocking dependency on a creative asset, not code. Stub with placeholder rectangle until character ready.
2. **Framer Motion `layoutId` requires the destination route to exist.** Build `/projects/[slug]` skeleton before wiring the card-to-page transition, or the animation will fail silently.
3. **i18n decision on MDX bodies blocks scope.** Translating three deep-dives via DeepL is non-trivial (formatting, code blocks, captions). Recommend: ship EN-only MDX in v1, translate UI chrome only. Defer MDX translation as a v1.1 follow-up. (Confidence: MEDIUM — this is a judgement call but the timeline constraint in PROJECT.md supports it.)
4. **GSAP + Framer Motion domain split (per Key Decisions) must be enforced from the first component.** If they start fighting (both animating the same property), debugging is painful. Code-review rule from day one: GSAP = scroll/macro; Framer = component/transition.
5. **Random rotation on /life photos is a hydration-mismatch trap.** Use deterministic seeded rotation (e.g. index-based or filename-hashed) — not `Math.random()` at render time.

---

## MVP Recommendation (for roadmap input)

Prioritize in this order:

1. **Design system + layout shell + nav + i18n routing** (foundation — nothing renders right without it)
2. **Homepage Hero + Contact** (shippable single-page portfolio in case of timeline slip; covers the recruiter-skim case)
3. **Work section with project cards (no deep-dives yet, no expand transition)** (proves the visual identity)
4. **MDX infrastructure + ONE deep-dive (MIMO AI — most current/relevant)** (proves the depth dimension)
5. **About section with Spline (or static fallback if character not ready)** (personality)
6. **Card → deep-dive Framer layoutId transition** (the magic moment — only valuable once 1 deep-dive exists)
7. **Two remaining MDX deep-dives** (VLC V2V, IoT Security)
8. **/life page** (humanize)
9. **DE translation pass (UI chrome only, defer MDX bodies)** (market signal)
10. **Performance hardening to hit Lighthouse ≥85 mobile** (gate)

**Defer to v1.1 (or out-of-scope):**

- MDX body translation to DE (complexity vs payoff unclear until v1 ships)
- Scroll progress indicator on MDX pages (nice-to-have, 2hr task post-launch)
- Cursor-aware tilt on cards (polish — add if Lighthouse budget allows)
- Custom 404 page (do a basic one in v1; iterate in v1.1)
- OG image generation per project (Vercel `@vercel/og` — high ROI but defer if timeline tight)

---

## Confidence Notes

- **HIGH confidence:** Table stakes (Resume link, contact accessibility, project metadata, mobile responsive, page meta/OG) — these are durable UX principles validated across the portfolio category for years. Anti-features (custom cursor, skills bars, typewriter loops, particle backgrounds, testimonial carousels) — these are widely-discussed anti-patterns in the engineer-portfolio space.
- **MEDIUM confidence:** Specific differentiator rankings (shader gradient, Spline character, /life page typography shift) — these are aligned with 2024-2025 high-end portfolio trends (Awwwards-tier, Rauno.me / Linear / Vercel-team-member sites) but I could not verify against live 2026 examples due to web search being unavailable.
- **LOWER confidence:** Reading time, scroll progress, cursor-aware tilt — these are common polish features but their specific recruiter-conversion impact is anecdotal.
- **Gap:** Could not run competitive analysis on current top engineer portfolios (Awwwards SOTD picks 2025-2026, Brittany Chiang, Lee Robinson, Cassidy Williams, Rauno Freiberg, etc.). Recommend manual scan of 5-10 reference sites before finalizing visual choices.

## Sources

- Project context: `/Users/lohith/Projects/Personal/portfolio_v2/.planning/PROJECT.md`
- Training data: portfolio design discussion through 2025 (Awwwards, CSS Design Awards, Hacker News portfolio threads, dev.to portfolio retrospectives, recruiter-perspective writeups on r/cscareerquestions and similar)
- Durable UX principles (Nielsen Norman Group, web.dev, MDN accessibility guidance)
- No live web sources verified in this pass (WebSearch + Brave both unavailable in this environment)
