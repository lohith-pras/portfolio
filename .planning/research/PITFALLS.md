# Domain Pitfalls — Next.js App Router Portfolio (GSAP + Framer Motion + Spline + shader-gradient + next-intl + MDX)

**Project:** LTP Portfolio v2
**Researched:** 2026-05-22
**Stack scope:** Next.js 15 App Router, React 19, TypeScript, Tailwind, GSAP 3.x + ScrollTrigger, Framer Motion / Motion 11.x, @splinetool/react-spline, shader-gradient, next-intl 3.x, @next/mdx, next/font

> **Research conditions:** WebSearch, WebFetch, Context7 MCP, and ctx7 CLI were all unavailable / denied in this environment. Findings below are drawn from documented library behavior in training data. Each pitfall is labeled with a confidence level — **HIGH** items are well-documented official patterns, **MEDIUM** items reflect commonly reported behavior across multiple sources in training, **LOW** items are reasonable inferences that should be re-verified against current docs during the phase that addresses them. Treat this document as a checklist to validate, not as authoritative truth.

---

## Critical Pitfalls (ship-blockers)

### Pitfall 1: GSAP plugins (ScrollTrigger, MotionPathPlugin, etc.) not registered → runtime "plugin not loaded" error in production only

**Confidence:** HIGH

**What goes wrong:** Code works in dev because of module evaluation order, then breaks in production after tree-shaking / minification with "Invalid property scrollTrigger" or "plugin not registered" errors. On the App Router this is amplified because server-side bundling can drop the side-effect import.

**Why it happens:** `gsap.registerPlugin(ScrollTrigger)` must be called once on the client, but in App Router code can run on the server (RSC) where `window` does not exist, or the side-effect import gets shaken out.

**Consequences:** Hero / Work / project deep-dive timelines all fail silently or throw.

**Prevention:**
- Create a single `lib/gsap.ts` client module that does `"use client"`, imports `gsap` + plugins, calls `gsap.registerPlugin(ScrollTrigger, useGSAP)` at top level, and re-exports `gsap`.
- Any component that touches GSAP imports from `lib/gsap` (never directly from `"gsap"`).
- Mark every GSAP-using component with `"use client"`.
- Add a build-time grep in CI: `! grep -r "from 'gsap'" app/ components/` (force routing through `lib/gsap`).

**Detection:** Production build → open Work section → no stagger animation. Check console for "plugin not loaded".

**Phase:** Foundation / Animation Setup phase.

---

### Pitfall 2: GSAP timelines duplicated on React 19 Strict Mode double-mount → ScrollTrigger pin glitches, duplicate animations, leaked listeners

**Confidence:** HIGH

**What goes wrong:** React 19 (and React 18) Strict Mode mounts → unmounts → remounts every effect in dev. Without `useGSAP` or proper cleanup, you get two ScrollTriggers per element, pin offsets stack, and the layout shifts by ~viewport-height the first scroll.

**Why it happens:** Raw `useEffect(() => { gsap.to(...) }, [])` does not return a cleanup that kills the tween / ScrollTrigger, so the second mount stacks on top of the first.

**Prevention:**
- Always use `useGSAP` from `@gsap/react` — it wraps `gsap.context()` and handles cleanup automatically.
- Pattern: `const container = useRef(null); useGSAP(() => { /* animations */ }, { scope: container });` with `<div ref={container}>`.
- Never call `gsap.to(".class")` without a scope — selectors will leak across components and re-fire on every mount.
- For ScrollTrigger specifically, ensure `ScrollTrigger.refresh()` is only called after fonts load and images settle (see Pitfall 11).

**Detection:** In dev, scroll once → notice double trigger fires, pinned elements jumping by 2× distance. Add `gsap.ticker.lagSmoothing(0)` temporarily and watch for duplicate timeline IDs.

**Phase:** Animation Setup phase, before building any scroll-driven sections.

---

### Pitfall 3: Spline scene SSR'd → hydration mismatch + bundle bloat on initial paint

**Confidence:** HIGH

**What goes wrong:** Importing `@splinetool/react-spline` directly into a server component (or even a client component without `dynamic({ ssr: false })`) causes Next.js to either (a) attempt SSR of a WebGL-dependent module and crash with `window is not defined` / `document is not defined`, or (b) bundle the entire Spline runtime (~300–500 kB) into the initial JS payload, tanking Lighthouse.

**Prevention:**
- Wrap the Spline component with `next/dynamic`:
  ```tsx
  const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false, loading: () => <SplineFallback /> })
  ```
- Use `@splinetool/react-spline/next` if you want App Router's built-in suspense (verify package supports this — **MEDIUM confidence**).
- Combine with a viewport-based mount: only mount Spline when the About section enters viewport (IntersectionObserver) — defers WebGL context creation until needed.
- Mobile branch: `useMediaQuery('(min-width: 1024px)')` gate so Spline never even attempts to load on phones (matches PROJECT.md constraint).

**Detection:** Run `next build` and check `First Load JS` for the About route — should be < 200 kB without Spline. Open Lighthouse on the homepage in mobile mode — TBT should not include a Spline chunk.

**Phase:** About Section phase.

---

### Pitfall 4: next-intl middleware conflicts with App Router static optimization → every route forced dynamic, RSC cache busted

**Confidence:** HIGH

**What goes wrong:** Configuring next-intl with the middleware-based routing approach (the most common one) marks all pages as dynamic by default because the middleware runs per request. Without explicit static rendering setup, you lose SSG, deploy times balloon, and Vercel function invocations spike.

**Why it happens:** next-intl 3.x requires either (a) middleware that detects locale per request, or (b) the `setRequestLocale` call inside each layout/page for static rendering opt-in. Skipping (b) silently disables SSG.

**Prevention:**
- Follow the [next-intl App Router setup](https://next-intl-docs.vercel.app/docs/getting-started/app-router) exactly — file structure must be `app/[locale]/layout.tsx` + `app/[locale]/page.tsx`.
- Add `export function generateStaticParams() { return routing.locales.map(locale => ({locale})); }` in `app/[locale]/layout.tsx`.
- Call `unstable_setRequestLocale(locale)` (or `setRequestLocale` in newer versions) at the top of every layout/page that should be static.
- Verify after build: `next build` output must show `○ (Static)` not `ƒ (Dynamic)` for `/en` and `/de`.
- Middleware should match only navigable routes: `matcher: ['/((?!api|_next|.*\\..*).*)']` — avoid running middleware on static asset requests.

**Detection:** `next build` → look for `ƒ` next to homepage. If you see it, static opt-in is missing. Also: Vercel function invocations > page views = dynamic rendering misconfiguration.

**Phase:** i18n Setup phase (must happen early — adding next-intl after pages are built means rewriting every page).

---

### Pitfall 5: Framer Motion `layoutId` cross-route shared-element transition does not work natively in App Router

**Confidence:** MEDIUM (well-known limitation, but workarounds evolve)

**What goes wrong:** PROJECT.md says "Work section with project cards … expandable via Framer Motion layoutId into project deep-dive pages." Default behavior: `layoutId` only matches between elements that exist **simultaneously** under the same `AnimatePresence`. Across route changes in the App Router (which unmounts the old route tree before mounting the new one), the source element disappears before the destination mounts — the layout animation never fires. Users see a hard cut instead of a morph.

**Why it happens:** App Router's `<Link>` performs a full segment swap. Framer Motion's `LayoutGroup`/`AnimatePresence` cannot bridge two separate route trees.

**Prevention (pick one):**
1. **Modal/intercepting routes** (recommended for this design): use Next.js [parallel + intercepting routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes) (`@modal` slot + `(.)projects/[slug]` interceptor). The card expands into a modal overlay that shares the DOM tree with the source card, so `layoutId` works. Direct URL hit (`/projects/foo`) renders the full page; click-from-grid renders the modal.
2. **Manual FLIP**: capture source rect with `getBoundingClientRect`, store in router state, animate destination from that rect on mount. More code, more reliable across reloads.
3. **next-view-transitions**: use the View Transitions API via a package like `next-view-transitions` for the cross-route morph; reserve `layoutId` for in-page expansions only.

**Detection:** Click a project card → if you see a hard navigation flash instead of a morph, layout animation is broken.

**Phase:** Work Section phase / project deep-dive routing phase. Choose the routing pattern (intercepting routes vs full page) **before** building the card component, because the component structure differs.

---

### Pitfall 6: shader-gradient + WebGL context leak on route change → "Too many active WebGL contexts" after navigating a few times

**Confidence:** MEDIUM

**What goes wrong:** Browsers cap concurrent WebGL contexts (~8–16 depending on browser). `shader-gradient` and Spline both create a context. If contexts are not explicitly disposed when a component unmounts (Three.js renderer not `.dispose()`d, canvas not removed), navigating Home → /life → /projects/x → Home a few times exhausts the limit. The hero then renders black, or the browser warns in console and refuses new contexts.

**Why it happens:** `shader-gradient` wraps Three.js / R3F; if the package's own cleanup is incomplete, the canvas + renderer + WebGL context linger. Spline has had similar reports.

**Prevention:**
- Mount the shader gradient **once at the root layout** (inside `app/[locale]/layout.tsx`) and let it persist across navigations rather than remounting per route. Use `position: fixed` and z-index it behind content.
- If it must remount, wrap in a component that calls `gl.getExtension('WEBGL_lose_context').loseContext()` on unmount as a safety net.
- Limit total concurrent WebGL surfaces: never have shader-gradient AND Spline rendering simultaneously. On the About section, pause the hero gradient (`visibility: hidden` is enough — browsers may keep the context but stop drawing) or unmount it.
- Test the leak: open DevTools console, run `for (let i=0; i<10; i++) { history.pushState({}, '', '/life'); history.pushState({}, '', '/'); }` — watch context count in `chrome://gpu` or check for "Too many active WebGL contexts" warning.

**Detection:** Console warning "Too many active WebGL contexts. Oldest context will be lost." Visual: gradient turns black after a few navigations.

**Phase:** Hero / shader gradient setup phase.

---

## Common Mistakes

### Pitfall 7: `next/font` loading three families (Space Mono + Plus Jakarta Sans + Courier Prime) all eagerly → 200+ kB of font payload on every page

**Confidence:** HIGH

**What goes wrong:** Naively configuring all three in `app/layout.tsx` loads woff2 for all three on every route, even though Courier Prime is only used on `/life`.

**Prevention:**
- Load **Space Mono + Plus Jakarta Sans** in root layout (used everywhere).
- Load **Courier Prime** only in `app/[locale]/life/layout.tsx` — scoped to that segment.
- For each font: `display: 'swap'`, `preload: true` only for the body font (Plus Jakarta Sans), `preload: false` for Space Mono if it's display-only and used below the fold. Reduces blocking requests on initial paint.
- Subset to `['latin']` (and `['latin-ext']` if DE umlauts cause issues — verify ä/ö/ü/ß render correctly in DE locale).
- Use `variable` CSS variable mode: `const space = Space_Mono({ variable: '--font-space', ... })` and reference via Tailwind theme — avoids FOUT class swaps.

**Detection:** Network tab on `/en` homepage → count woff2 requests. Should be 2, not 3. Lighthouse "Avoid enormous network payloads" flag.

**Phase:** Design System / Foundation phase.

---

### Pitfall 8: @next/mdx setup that "just works" in dev but breaks on Vercel build — missing `mdx-components.tsx`, wrong `pageExtensions`, no remark/rehype plugins

**Confidence:** HIGH

**What goes wrong:** Common @next/mdx footguns:
1. Forgetting `mdx-components.tsx` at the project root (required in App Router) → build error "useMDXComponents is not exported".
2. `pageExtensions` not extended → `.mdx` files ignored.
3. Frontmatter not parsed because `remark-frontmatter` + `remark-mdx-frontmatter` not in config → can't read title/date.
4. Using `import` syntax inside MDX without configuring the bundler → silent failure.
5. Code blocks with syntax highlighting require `rehype-pretty-code` or `shiki` — out-of-box has no highlighting.

**Prevention:**
- Use the canonical setup:
  ```js
  // next.config.mjs
  import createMDX from '@next/mdx';
  const withMDX = createMDX({ options: { remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter], rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark' }]] }});
  export default withMDX({ pageExtensions: ['ts', 'tsx', 'mdx'] });
  ```
- Create `mdx-components.tsx` at root with custom components (especially for `<img>` → `<Image>` swap, headings, code).
- Project deep-dives are at `/content/projects/[slug].mdx` per PROJECT.md — note this is **content**, not routed pages. You need to: read the MDX file at request time using `next-mdx-remote` or `@content-collections/mdx`, then render in `app/[locale]/projects/[slug]/page.tsx`. **`@next/mdx` only auto-routes files inside `app/`**. This is a frequent confusion.
- Decide upfront: `@next/mdx` (file-system routed, MDX must live in `app/`) **vs** `next-mdx-remote` (read MDX files from anywhere at build time). For `/content/projects/*.mdx`, you want `next-mdx-remote` or Contentlayer/Content Collections.

**Detection:** `next build` error mentioning MDX or `useMDXComponents`. Or: page renders MDX raw with `# heading` as literal text.

**Phase:** Project deep-dive content phase.

---

### Pitfall 9: GSAP ScrollTrigger `pin: true` on mobile causes layout shift, scroll jank, iOS Safari address bar bounce

**Confidence:** HIGH

**What goes wrong:** ScrollTrigger pinning works by transform-locking an element and adding spacer divs. On mobile:
- iOS Safari's collapsing address bar changes viewport height mid-scroll → pinned section recalculates `100vh` → visible jump.
- Touch scrolling has momentum; pin release feels rubber-bandy.
- Pin spacer can cause Cumulative Layout Shift (CLS) penalty in Lighthouse.

**Prevention:**
- Use `gsap.matchMedia()` to scope desktop-only pinning:
  ```js
  ScrollTrigger.matchMedia({ '(min-width: 1024px)': () => { /* pin animations */ } });
  ```
- On mobile, replace pin-based reveals with **simple opacity/y-transform fade-ins** (no pin, no scrub).
- Use `100svh` (small viewport height) instead of `100vh` for any pinned section heights to avoid iOS address bar issues.
- Use `pinSpacing: false` only when you understand you'll layout-overlap deliberately.
- Set `anticipatePin: 1` to reduce the visible jump when pin engages.
- For scrub animations, use `scrub: 1` (smoothed) not `scrub: true` (instant) — feels less janky on mobile.

**Detection:** Test on real iOS Safari (not just DevTools). Watch for: pinned section "jumps" by ~60 px when address bar collapses; layout content below pin shifts when scroll engages.

**Phase:** Work Section / scroll-driven content phase.

---

### Pitfall 10: next-intl message catalog imported into client component → entire DE + EN catalog shipped to browser

**Confidence:** MEDIUM

**What goes wrong:** Importing `messages.json` directly into a client component (`'use client'`) inlines it into the JS bundle. With two locales, you ship both, defeating the purpose of locale routing.

**Prevention:**
- Use `useTranslations('Namespace')` from a server component when possible — message lookup happens server-side.
- For client components, use `NextIntlClientProvider` and pass only the **namespace** needed via `messages={pick(messages, ['Hero', 'Work'])}` (use `lodash.pick` or similar).
- Split message files by namespace: `messages/en/hero.json`, `messages/en/work.json` — don't ship a single mega-file.
- Verify: Network tab on `/en` → search response for a DE-only string. Should not appear.

**Detection:** `next build` output → JS bundle size for `/en` includes German strings (use `next-bundle-analyzer`).

**Phase:** i18n Setup phase.

---

### Pitfall 11: GSAP ScrollTrigger calculates positions before fonts load → triggers fire at wrong scroll positions

**Confidence:** HIGH

**What goes wrong:** When `next/font` swaps in (FOUT), text height changes → element positions shift → ScrollTrigger's cached scroll positions are now wrong → animations fire too early or too late.

**Prevention:**
- In a top-level client effect, call `document.fonts.ready.then(() => ScrollTrigger.refresh())`.
- Also call `ScrollTrigger.refresh()` after Spline scene finishes loading (it changes layout).
- Use `display: 'swap'` on fonts intentionally accepting the FOUT, and refresh after.
- Add `ScrollTrigger.config({ ignoreMobileResize: true })` to prevent the iOS address bar from triggering a refresh storm.

**Detection:** First load: scroll triggers fire 100–300 px off. Subsequent loads (fonts cached): correct.

**Phase:** Animation Setup phase.

---

### Pitfall 12: next-intl + intercepting routes for project modal → locale prefix breaks the interceptor pattern

**Confidence:** LOW (specific edge case worth verifying)

**What goes wrong:** Intercepting routes use folder conventions like `(.)projects/[slug]`. With `[locale]` segment, you need `(.)projects/[slug]` placed correctly relative to `[locale]`. Get the depth marker wrong (`(.)` vs `(..)` vs `(..)(..)`) and the interception silently fails — clicking the card does a full navigation.

**Prevention:**
- Structure:
  ```
  app/[locale]/
    layout.tsx
    @modal/
      default.tsx           // returns null
      (.)projects/[slug]/
        page.tsx            // modal version
    projects/[slug]/
      page.tsx              // full page version
  ```
- The `(.)` matches the same level — `app/[locale]/projects/...` is at the same level as the interceptor inside `@modal`.
- Test both flows: (a) click from grid → modal opens with shared-layout morph, (b) refresh on modal URL → full page renders.

**Phase:** Work Section / routing phase. Verify against current Next.js docs before implementing.

---

## Performance Pitfalls

### Pitfall 13: Lighthouse mobile drops below 85 from animation libraries — root causes ranked

**Confidence:** HIGH

PROJECT.md mandates Lighthouse mobile ≥ 85. Expected regressions in order of impact:

| Cause | Lighthouse impact | Mitigation |
|---|---|---|
| Spline runtime loaded on mobile | TBT +1500 ms, TTI +2 s | Desktop-only mount (`useMediaQuery('(min-width: 1024px)')`), `ssr: false` dynamic import, IntersectionObserver gate |
| shader-gradient WebGL on initial paint | LCP +500 ms, TBT +200 ms | `prefers-reduced-motion` static fallback (CSS gradient image); lazy-import the shader after LCP |
| GSAP full bundle imported (`import gsap from 'gsap'` pulls all plugins) | JS +50 kB | Import only what's used: `import { gsap } from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'`. Avoid `gsap/all`. |
| Framer Motion full bundle | JS +40 kB | Use `motion/react` (Motion 11+) which has better tree-shaking; or use the `LazyMotion` + `m` component pattern to ship only needed features. |
| Three font families loaded eagerly | FCP +200 ms | Scope Courier Prime to `/life` only (Pitfall 7) |
| Travel photos on /life unoptimized | LCP catastrophic | Use `next/image` with explicit `width`/`height`, `placeholder="blur"`, AVIF/WebP via Next default |
| MDX project pages with unhighlighted code blocks vs rehype-pretty-code at build | (build-time only — runtime fine) | Use build-time highlighting (`rehype-pretty-code` with `shiki`), not client-side highlight.js |

**Prevention strategy:**
- Run Lighthouse CI on every PR. Fail builds below 85 mobile.
- Use `@next/bundle-analyzer` to inspect every route's JS payload.
- Establish budgets in CI: hero route < 250 kB JS, project page < 200 kB JS.

**Phase:** Performance Audit phase (recurring at end of every milestone).

---

### Pitfall 14: Framer Motion `whileInView` + GSAP ScrollTrigger on same element fight each other

**Confidence:** MEDIUM

**What goes wrong:** PROJECT.md splits domains: "GSAP owns scroll/macro, Framer Motion owns component/transition." If a developer accidentally adds `whileInView` to a card inside a GSAP-staggered grid, both libraries write to `transform` and the animations stutter or cancel each other.

**Prevention:**
- Code review rule: search PRs for `whileInView` — must be justified. Default to GSAP for any scroll-triggered animation.
- Document the split in a `CONTRIBUTING.md` or `docs/animations.md`:
  - GSAP: scroll reveals, ScrollTrigger pins, scrub timelines, staggers, page-load entrances driven by scroll
  - Framer Motion: hover/tap states, `AnimatePresence` exit transitions, `layout`/`layoutId` morphs, modal mount/unmount
- Lint rule: a custom ESLint rule that flags `whileInView` if `gsap` is imported in the same file.

**Detection:** Visual stutter on scroll. Console: no errors, just bad UX.

**Phase:** Animation Setup phase — write the split as a doc before either library is used in anger.

---

### Pitfall 15: CLS from shader-gradient canvas resize / Spline canvas mounting late

**Confidence:** MEDIUM

**What goes wrong:** Canvas elements that resize to `100vw / 100vh` after JS executes shift surrounding content → CLS penalty. The hero shader canvas is a common offender.

**Prevention:**
- Reserve hero height via CSS (`min-height: 100svh` on the hero container) so the canvas mounts into pre-sized space.
- For the About Spline: render a fixed-aspect placeholder div with the same dimensions as the Spline canvas; only swap to the actual canvas after load.
- Use `next/image` `priority` + width/height for any LCP image (hero name as image? — not in this design, but applies to /life photos).

**Detection:** Lighthouse CLS metric > 0.1. PageSpeed Insights "Avoid large layout shifts" diagnostic identifies the offending element.

**Phase:** Hero phase, About phase.

---

### Pitfall 16: ScrollTrigger + smooth scroll library (Lenis, Locomotive) → triggers fire at wrong positions

**Confidence:** HIGH (only relevant if smooth scroll is added later)

**What goes wrong:** Adding Lenis or Locomotive Scroll later for "smoother" feel breaks every existing ScrollTrigger because they need explicit integration (`ScrollTrigger.scrollerProxy`).

**Prevention:**
- **Decision now:** native scroll only. Don't add smooth scroll later — the cost of retrofitting ScrollTrigger integration is high.
- If smooth scroll is requested in v2, plan a dedicated migration phase with `ScrollTrigger.scrollerProxy` setup. Don't bolt it on.

**Phase:** Architecture decision — log in PROJECT.md Key Decisions.

---

### Pitfall 17: DeepL translation pass produces strings with placeholders broken (HTML/ICU)

**Confidence:** MEDIUM

**What goes wrong:** Sending strings with ICU placeholders (`Hello {name}`) or rich text tags (`<b>foo</b>`) through DeepL → translations sometimes mangle the placeholder (`Hallo {Name}`, lowercased / inflected / re-ordered → next-intl can't substitute).

**Prevention:**
- Use DeepL's XML tag handling (`tag_handling=xml` + `ignore_tags`) to protect placeholders.
- Wrap ICU placeholders in non-translatable tags before sending: `Hello <x>{name}</x>` → DeepL leaves `<x>...</x>` alone → strip after.
- Maintain a snapshot test: render every translation key in both locales and assert no `{` or `}` is missing after substitution.
- Manual review the DE catalog before deploy — especially short UI labels where DeepL guesses register wrong.

**Detection:** Runtime: missing words in DE UI ("Hello " with no name), or React error "missing interpolation".

**Phase:** i18n Translation phase.

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|---|---|---|
| **Foundation / Setup** | next-intl middleware misconfig forces dynamic rendering (Pitfall 4) | Set up `[locale]` routing + `setRequestLocale` from day 1; verify static build output |
| **Foundation / Setup** | @next/mdx vs next-mdx-remote confusion (Pitfall 8) | Decide MDX strategy up front; `/content/projects/*.mdx` → use next-mdx-remote or Content Collections |
| **Design System / Fonts** | All 3 fonts loaded everywhere (Pitfall 7) | Scope Courier Prime to /life layout only |
| **Animation Setup** | Plugin registration / Strict Mode duplication (Pitfalls 1, 2) | `lib/gsap.ts` central module + `useGSAP` everywhere |
| **Animation Setup** | GSAP/Framer Motion domain overlap (Pitfall 14) | Write the split doc before any animation code |
| **Hero (shader gradient)** | WebGL context leak across routes (Pitfall 6) | Mount once in root layout, persist across navigations |
| **Hero (shader gradient)** | CLS from canvas mount (Pitfall 15) | Reserve `100svh` height in CSS first |
| **About (Spline)** | SSR crash + bundle bloat (Pitfall 3) | `dynamic({ ssr: false })`, desktop-only, IntersectionObserver gated |
| **About (Spline)** | Concurrent WebGL contexts with hero gradient (Pitfall 6) | Pause one when the other is on screen |
| **Work Section** | Cross-route `layoutId` doesn't work (Pitfall 5) | Use intercepting routes for modal pattern |
| **Work Section** | Intercepting routes + `[locale]` segment depth (Pitfall 12) | Verify folder structure against current Next docs |
| **Work Section** | ScrollTrigger mobile pin jank (Pitfall 9) | `gsap.matchMedia` desktop-only pins, use `100svh` |
| **Work / Scroll content** | Triggers misfire before fonts load (Pitfall 11) | `document.fonts.ready → ScrollTrigger.refresh()` in root |
| **Project deep-dives (MDX)** | MDX raw text rendered (Pitfall 8) | Validate `pageExtensions`, `mdx-components.tsx`, build locally before push |
| **i18n Translation** | DeepL mangling placeholders (Pitfall 17) | XML tag protection + snapshot tests |
| **i18n Translation** | Whole catalog shipped to client (Pitfall 10) | Pick namespaces for `NextIntlClientProvider` |
| **Performance Audit** | Bundle creep from GSAP/Framer Motion (Pitfall 13) | Modular imports, `LazyMotion`, bundle analyzer in CI |
| **Performance Audit** | Lighthouse mobile < 85 (Pitfall 13) | CI gate on every PR |

---

## "Works locally, breaks in production" — top scenarios

1. **GSAP plugin not registered** (Pitfall 1) — dev module order saves you, prod tree-shake kills you.
2. **Spline `window is not defined`** (Pitfall 3) — dev fast-refresh tolerates it, prod build crashes.
3. **next-intl static rendering off** (Pitfall 4) — works in dev (always SSR), Vercel bills you for it.
4. **Font loading race with ScrollTrigger** (Pitfall 11) — local fonts cached, first prod visitor sees broken triggers.
5. **MDX content path mismatch** (Pitfall 8) — relative paths work in dev, `next build` static optimization can't find files.
6. **WebGL context leak** (Pitfall 6) — dev rarely navigates enough to hit it; users will.
7. **DE umlauts missing** (Pitfall 7 subset) — `latin` font subset doesn't cover ä/ö/ü/ß → boxes in prod DE locale.
8. **Intercepting routes folder structure** (Pitfall 12) — dev navigates fine, direct URL hit in prod errors out.

---

## Sources

External research tools (WebSearch, WebFetch, Context7 MCP, ctx7 CLI, Brave Search, Exa, Firecrawl) were unavailable in this run. The pitfalls above are drawn from documented behavior of the named libraries in the assistant's training corpus.

**Recommended verification during implementation:**
- GSAP + React: https://gsap.com/resources/react/ and `@gsap/react` README on npm
- Framer Motion / Motion: https://motion.dev/docs (especially layout animations and `LazyMotion`)
- Spline: https://github.com/splinetool/react-spline README
- shader-gradient: https://github.com/ShaderGradient/shadergradient
- next-intl: https://next-intl-docs.vercel.app/docs/getting-started/app-router (static rendering setup is the critical page)
- @next/mdx: https://nextjs.org/docs/app/building-your-application/configuring/mdx
- Next.js intercepting routes: https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes
- DeepL XML tag handling: https://www.deepl.com/docs-api/xml/

Each pitfall above should be cross-checked against the linked source during the phase that implements it. Flag any discrepancies and update this document.
