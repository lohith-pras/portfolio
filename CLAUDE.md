<!-- GSD:project-start source:PROJECT.md -->
## Project

**LTP Portfolio v2**

Personal portfolio website for Lohith Tarikere Prasanna — a complete rehaul of the old resume-style site. Built to show what he builds, how he thinks, and who he is — not where he worked and studied. Audience: both recruiters/hiring teams and potential collaborators in AI, wireless, and mobility. Deployed at a new Vercel project pointing to this repo.

**Core Value:** Visitors leave knowing Lohith is a builder with intent and a distinct perspective — not just a candidate with a CV.

### Constraints

- **Timeline:** ASAP — target weeks, not months. Ship polished v1, iterate after.
- **Tech stack:** Next.js App Router + TypeScript locked. GSAP + Framer Motion (not either/or, both have defined domains). Spline via @splinetool/react-spline.
- **Performance:** Lighthouse mobile ≥ 85 — drives lazy loading decisions (Spline, GSAP modular imports, Next.js Image everywhere)
- **Shader gradient:** `shader-gradient` npm package (by Faraz Shaikh), warm color palette locked — electric orange `#FF4500` → deep crimson `#C0001A` → `#0A0A0A`
- **MDX:** @next/mdx for project deep-dives, files at /content/projects/[slug].mdx
- **i18n routing:** Sub-path (/en, /de) not domain-based — shareable, SEO-friendly
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | `^15.x` (App Router) | Framework, routing, RSC, image opt, MDX | Locked by PROJECT.md. App Router required for `[locale]` segment + `generateMetadata` per-locale + RSC streaming. Avoid 14.x — `next-intl` 4 and `@next/mdx` 15 patterns assume 15. |
| React | `^19.x` | UI runtime | Ships with Next 15.x. Required for current `useActionState`, ref-as-prop, and improved Suspense semantics — but introduces the GSAP double-mount issue in dev (see Integration Patterns → GSAP). |
| TypeScript | `^5.6+` (use latest stable) | Type safety | Locked by PROJECT.md. Strict mode on. `moduleResolution: "bundler"`. |
| Tailwind CSS | `^4.x` (preferred) or `^3.4.x` (safe fallback) | Styling | Tailwind v4 is the current major (CSS-first config, `@theme` directive, no `tailwind.config.js` required, much faster). **Recommend v4** for a fresh project. If any plugin you need (e.g. typography for MDX) lags, fall back to 3.4.x. |
| `@tailwindcss/typography` | latest matching Tailwind major | MDX prose styling | Needed for /projects/[slug] readability. |
| `clsx` + `tailwind-merge` (or `tailwind-variants`) | latest | Conditional classes | Standard combo. Pick `tailwind-variants` if you want CVA-style component variants. |
### Animation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GSAP | `^3.13.x` (latest 3.x) | Scroll-driven + macro animation: hero, work card stagger, /projects timeline draw | **GSAP went fully free in May 2024** — all plugins (ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVG, ScrollSmoother) are now MIT-equivalent and available on the public npm registry. No more Club GreenSock paywall. Single import from `gsap` + `gsap/ScrollTrigger`. |
| `@gsap/react` | `^2.1.x` | `useGSAP` hook | **Mandatory** with React 19. Handles cleanup, scope, and double-invocation in dev/strict mode. Do NOT hand-roll `useLayoutEffect` + `gsap.context()` — use `useGSAP`. |
| Framer Motion (`motion`) | `^11.x` (npm: `framer-motion`) or `^12.x` if migrated to `motion` | Component-level: layoutId expansion, page transitions, hover, exit | Domain split locked in PROJECT.md: Framer owns components, GSAP owns scroll. `layoutId` is the killer feature here (work card → deep-dive expansion). NOTE: Framer Motion is mid-rebrand to the `motion` package (same maintainer, Matt Perry). For a fresh repo, you can pick either; `framer-motion` is still the safer/more-documented name today. |
### 3D + Visual
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@splinetool/react-spline` | `^4.x` (latest) | About-section 3D character | Official React wrapper. Has a **Next.js-specific subpath**: `@splinetool/react-spline/next` — import from this when using App Router (works with RSC, handles the Suspense boundary). |
| `@splinetool/runtime` | matches react-spline major | Peer dep, the actual runtime | Auto-installed but pin explicitly to avoid surprise majors. |
| `shader-gradient` (Faraz Shaikh) | latest published (verify on npm) | Hero gradient | Locked by PROJECT.md. WebGL-based, animated. Requires client component + dynamic import (SSR off). Be aware the package depends on `@react-three/fiber` + `three` under the hood — those will land in your bundle. |
| `three` | match shader-gradient's peer range | WebGL runtime | Only if needed by shader-gradient or future R3F work. Pin to avoid duplicate-three warnings. |
### Content + i18n
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `next-intl` | `^4.x` | i18n routing + translations | v4 is current. Native App Router support via `[locale]` segment + `createNavigation` + `getRequestConfig`. Sub-path routing (`/en`, `/de`) is the default and best-supported mode. |
| `@next/mdx` | `^15.x` (match Next.js major) | MDX support for /projects/[slug] | Official. Configures via `next.config.mjs` with `withMDX`. Use `mdx-components.tsx` at app root for custom components. |
| `@mdx-js/loader` + `@mdx-js/react` | latest matching `@next/mdx` peer | MDX runtime | Auto-required by `@next/mdx`. |
| `remark-gfm` | latest | GFM tables, strikethrough, autolinks in MDX | Standard. |
| `rehype-pretty-code` or `shiki` | latest | Syntax highlighting for code blocks in project deep-dives | `rehype-pretty-code` (built on Shiki) gives VS Code-quality highlighting at build time — zero runtime cost. Preferred over `prism-react-renderer` (runtime) and `highlight.js` (uglier). |
| `gray-matter` | latest | Frontmatter parsing (if needed for project metadata) | Standard for MDX with frontmatter. |
### Typography
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `next/font/google` | bundled with Next 15 | Self-hosted Google Fonts (Space Mono, Plus Jakarta Sans, Courier Prime) | Zero layout shift, no external network request, automatic preload + subsetting. **Always** prefer over `<link rel="stylesheet">` from fonts.google.com. |
### Tooling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| ESLint | `^9.x` (flat config) | Linting | Next 15 ships flat-config-compatible preset. |
| Prettier | `^3.x` + `prettier-plugin-tailwindcss` | Formatting + class sorting | Required for sane Tailwind utility ordering. |
| `lefthook` or `husky` + `lint-staged` | latest | Pre-commit hooks | Pick lefthook (faster, no Node hook script). |
| `vitest` (optional) | `^2.x` | Tests if you want them | Not in PROJECT.md requirements — defer until needed. |
### Deployment
| Technology | Purpose | Why |
|------------|---------|-----|
| Vercel | Hosting | Locked — new Vercel project per PROJECT.md. Native Next.js 15 support, ISR, image optimization, edge middleware (needed for next-intl). |
### Translation Pipeline
| Technology | Purpose | Why |
|------------|---------|-----|
| DeepL Pro API | EN → DE translation of message JSON | Locked by PROJECT.md. Author a small script at `/scripts/translate.ts` that reads `messages/en.json`, posts to DeepL, writes `messages/de.json`. Run manually pre-deploy, commit output. Do NOT call DeepL at runtime. |
## Integration Patterns
### 1. GSAP + ScrollTrigger in Next.js App Router (React 19)
- Every GSAP component is `"use client"`. GSAP touches `window`; no SSR.
- Register plugins **once per module**, at module top-level — registering inside the hook re-registers every render.
- Use `scope: root` so class selectors (`.reveal`) are scoped to this component.
- For responsive variants use `gsap.matchMedia()` inside `useGSAP` — required for the mobile/desktop split in PROJECT.md.
### 2. Framer Motion in App Router
- Use Framer for: `layoutId` shared-element transitions (work card → /projects/[slug] header), `AnimatePresence` exit animations, hover micro-interactions, nav state.
- Use GSAP for: scroll-driven reveals, stagger sequences, timeline drawing on /projects, hero gradient parallax.
- Don't use both on the same element — pick one owner. Conflicts manifest as fighting transforms.
### 3. Spline via `@splinetool/react-spline`
- `@splinetool/runtime` is heavy (~hundreds of KB). Lazy-load is mandatory for Lighthouse ≥ 85.
- Spline scenes auto-play on load. To trigger on scroll (PROJECT.md: "greeting animation on scroll"), use Spline's `onLoad` to capture the app instance, then play a named state via `spline.emitEvent('mouseDown', 'objectName')` or `spline.setVariable(...)` driven by a ScrollTrigger.
- CORS: scenes are served from `prod.spline.design`. Should Just Work, but if you self-host the `.splinecode` file, set `Access-Control-Allow-Origin`.
### 4. `shader-gradient` for Hero
- Set `uSpeed` low (0.1–0.3) — high speeds spike GPU usage on integrated graphics.
- On mobile, consider serving a static gradient PNG behind a `useIsDesktop` check, same as Spline. WebGL on cheap phones tanks Lighthouse.
- The canvas is full-bleed behind the hero text — make sure the text container has its own stacking context (`relative z-10`) and the canvas is `position: absolute; inset: 0; z-0`.
### 5. `next-intl` v4 — Sub-path Routing (`/en`, `/de`)
### 6. `@next/mdx` for /projects/[slug]
- **Option A — File-based routes (simplest):** Put MDX in `app/[locale]/projects/[slug]/page.mdx`. `@next/mdx` makes them pages directly. But this couples content to route tree and complicates i18n (you'd need `page.en.mdx` / `page.de.mdx` — not great).
- **Option B — Content directory + dynamic import (recommended):** Keep `/content/projects/<slug>.mdx` (and `<slug>.de.mdx`). In `app/[locale]/projects/[slug]/page.tsx`, do:
### 7. `next/font/google` — Space Mono + Plus Jakarta Sans + Courier Prime
- German umlauts: `subsets: ["latin"]` covers `ä ö ü ß` (they're in basic Latin-1 supplement, included in the `latin` subset for these fonts). Verify visually in DE locale.
- `next/font/google` **must** be called at module top-level — not inside a component, never with a dynamic argument. The Next.js build inlines the font fetch at compile time.
- `/life` page: just add `className="font-life"` to its layout — it'll cascade via the CSS var.
## Version Pinning
## What NOT To Use
| Don't use | Why | Use instead |
|-----------|-----|-------------|
| **Next.js Pages Router** | Locked out by PROJECT.md and by next-intl 4 patterns. | App Router. |
| **`react-spring`** | Overlaps with Framer Motion's role; second physics engine in the bundle. | Framer Motion. |
| **`lottie-react` / `lottie-web`** | Not in scope, and Spline covers the 3D need. | Spline + GSAP. |
| **Raw `useEffect` + `gsap.context()`** | Breaks subtly in React 19 strict mode / dev double-mount; you'll chase ghosts. | `useGSAP` from `@gsap/react`. |
| **`import gsap from "gsap/all"`** | Imports every plugin including ones you don't use; balloons the bundle. | Modular: `import { ScrollTrigger } from "gsap/ScrollTrigger"`. |
| **`@splinetool/react-spline` (root import) in RSC** | Crashes — uses `window`. | `@splinetool/react-spline/next` + `dynamic(..., { ssr: false })`. |
| **Mounting Spline on mobile and hiding via CSS** | The bundle still ships and the scene still runs. | Conditional render gated by `matchMedia`. |
| **`next-i18next`** | Pages Router-era library, deprecated path for App Router. | `next-intl` v4. |
| **`localePrefix: "as-needed"` in next-intl** | Default locale becomes path-less; breaks "shareable per-locale URL" goal. | `"always"` (the default for sub-path mode). |
| **`react-markdown` for project deep-dives** | Runtime parsing; no MDX component support; no syntax-highlight pipeline integration. | `@next/mdx` (build-time, supports React components inline). |
| **`contentlayer`** | Project archived/unmaintained as of 2024; broken on Next 14+. | `@next/mdx` with content dir + dynamic import. |
| **`prism-react-renderer` / `highlight.js`** | Runtime syntax highlighting → bigger JS bundle, slower paint. | `rehype-pretty-code` (Shiki at build time, zero runtime cost). |
| **`<link>` to fonts.google.com** | Extra network request, layout shift, no auto-subsetting. | `next/font/google`. |
| **Custom cursor libs (`react-custom-cursor`, etc.)** | Out of scope (PROJECT.md). | Browser default. |
| **CSS-in-JS runtimes (`styled-components`, `emotion`)** | RSC-hostile; adds runtime cost; redundant with Tailwind. | Tailwind v4 + CSS variables. |
| **Calling DeepL API at runtime** | Latency, cost, key exposure risk on edge. | Build-time translation script, commit `messages/de.json`. |
| **`next-mdx-remote`** | Designed for remote/CMS MDX; overkill for local files; needs more setup for components. | `@next/mdx` for local files. |
| **GSAP `ScrollSmoother` on mobile** | Janky on cheap phones; fights with native iOS momentum scroll. | Native scroll on mobile; ScrollSmoother desktop-only via `gsap.matchMedia()` — and honestly, skip it for v1. |
| **`framer-motion` `<motion.div layoutId>` across hard route transitions** | App Router unmounts the source; layoutId loses its anchor. | Parallel/intercepting routes (`@modal` slot) so source stays mounted. |
| **Tailwind JIT `safelist` for dynamic classes** | Easy to forget; bloats output. | Build class strings from a known palette using `clsx`/`tailwind-variants`. |
## Known Conflicts / Gotchas Between Packages
## Confidence Notes
| Area | Confidence | Reason |
|------|------------|--------|
| Next.js 15 + App Router as base | HIGH | Locked by PROJECT.md, established framework. |
| React 19 ships with Next 15 | HIGH | Well-documented. |
| GSAP gone fully free (May 2024) incl. plugins | HIGH | Widely reported industry change; verify by checking `npm view gsap` for ScrollTrigger inclusion. |
| `useGSAP` from `@gsap/react` is the right pattern | HIGH | Official GSAP-recommended approach for React. |
| `@splinetool/react-spline/next` subpath exists | MEDIUM | Documented in Spline's official Next.js guide; verify exact import path in current README before coding. |
| Spline + `dynamic({ ssr: false })` pattern | HIGH | Standard pattern for any WebGL lib in Next App Router. |
| next-intl v4 sub-path routing setup | MEDIUM-HIGH | API has been stable since v3.x; v4 added some renames (`createNavigation` replaced earlier APIs). Verify against current next-intl.dev docs before scaffolding. |
| Tailwind v4 recommendation | MEDIUM | v4 is current as of late 2024/2025 but plugin ecosystem (typography, prettier plugin) may still be catching up — fall back to 3.4.x if any blocker hits. |
| `shader-gradient` exact package name (`shadergradient` vs `@shadergradient/react`) | LOW | Two related packages exist; PROJECT.md says "shader-gradient by Faraz Shaikh" but doesn't pin the exact npm name. **Verify via `npm view` and the shadergradient.com export panel before installing.** |
| Framer Motion vs `motion` package rename | MEDIUM | Rebrand was announced; both names work. `framer-motion` is safer for v1 due to more docs/examples; can migrate later. |
| `@next/mdx` content-dir + dynamic-import pattern for i18n MDX | MEDIUM | Pattern is sound but adds slight complexity vs file-routed MDX. Trade-off explained above. |
| `rehype-pretty-code` over runtime highlighters | HIGH | Build-time Shiki is unambiguously better for Lighthouse. |
| Avoid `contentlayer` | HIGH | Project archived; well-known in the ecosystem. |
| Exact version pins | LOW | Could not verify against npm during this research pass (no web/CLI tool access). Re-verify all versions with `npm view` before committing `package.json`. |
| DeepL build-time-only translation pattern | HIGH | Best-practice for static i18n content. |
## Sources
- https://nextjs.org/docs (Next 15 App Router, `@next/mdx`, `next/font`, `dynamic`)
- https://gsap.com/resources/React/ (`useGSAP`, current pricing/licensing)
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (current API)
- https://docs.spline.design/doc/getting-started-react/ + npm page for `@splinetool/react-spline`
- https://next-intl.dev/docs/getting-started/app-router (v4 setup, `routing`, `navigation`, middleware)
- https://www.shadergradient.com/ (current export package name and props)
- https://motion.dev/ and https://www.framer.com/motion/ (current package name)
- `npm view <pkg> version` for every entry in Version Pinning above.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
