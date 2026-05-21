# Technology Stack

**Project:** LTP Portfolio v2
**Researched:** 2026-05-22
**Overall confidence:** MEDIUM (see Confidence Notes — external verification tools were unavailable during this research pass; all version pins must be re-validated against `npm view <pkg> version` before lock-in)

---

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

---

## Integration Patterns

### 1. GSAP + ScrollTrigger in Next.js App Router (React 19)

**The double-mount problem:** React 19 + Strict Mode mounts effects twice in dev. Without cleanup, ScrollTriggers duplicate, animations replay, and `from()` tweens leave elements in pre-state.

**Solution: `useGSAP` from `@gsap/react`.** It wraps `gsap.context()` + handles revert on unmount and re-run on dependency change. Do not use raw `useEffect`/`useLayoutEffect`.

```tsx
// app/(site)/_components/HeroAnimation.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HeroAnimation() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".reveal", {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    },
    { scope: root }
  );

  return <div ref={root}>{/* ... */}</div>;
}
```

**Rules:**
- Every GSAP component is `"use client"`. GSAP touches `window`; no SSR.
- Register plugins **once per module**, at module top-level — registering inside the hook re-registers every render.
- Use `scope: root` so class selectors (`.reveal`) are scoped to this component.
- For responsive variants use `gsap.matchMedia()` inside `useGSAP` — required for the mobile/desktop split in PROJECT.md.

**ScrollTrigger refresh after route change:** Next App Router keeps the DOM warm across navigations. Call `ScrollTrigger.refresh()` after layout-shifting transitions (e.g. after Framer Motion `layoutId` expansion). Add a global listener in your root client component if you see triggers fire at wrong positions.

**Import surface:** Modular imports keep the bundle lean.
```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText"; // now free
```
Never `import * from "gsap/all"` — that pulls every plugin.

---

### 2. Framer Motion in App Router

**Rule:** every file using `motion.*` or hooks (`useScroll`, `useMotionValue`, `AnimatePresence`) must be `"use client"`. Framer Motion has no RSC path.

**Domain split (locked in PROJECT.md):**
- Use Framer for: `layoutId` shared-element transitions (work card → /projects/[slug] header), `AnimatePresence` exit animations, hover micro-interactions, nav state.
- Use GSAP for: scroll-driven reveals, stagger sequences, timeline drawing on /projects, hero gradient parallax.
- Don't use both on the same element — pick one owner. Conflicts manifest as fighting transforms.

**layoutId across route boundaries:** Works *within* a layout, not across full route transitions in App Router by default. For the work-card-to-deep-dive expansion, you have two options:
1. **Modal pattern (recommended for v1):** Use a parallel route or intercepting route (`@modal` slot) so the deep-dive renders over the homepage, preserving the source card in the DOM tree. `layoutId` then works natively.
2. **View Transitions API + Framer:** Wire `unstable_ViewTransition` (Next.js experimental) with Framer's `MotionConfig`. More moving parts; defer to a later phase.

**Reduced motion:** Wrap your app in `<MotionConfig reducedMotion="user">` to respect `prefers-reduced-motion`. Mirror with `gsap.matchMedia()`.

---

### 3. Spline via `@splinetool/react-spline`

**Use the Next.js subpath:**
```tsx
// app/(site)/_components/SplineScene.tsx
"use client";
import Spline from "@splinetool/react-spline/next";

export function SplineScene() {
  return (
    <Spline scene="https://prod.spline.design/your-scene-id/scene.splinecode" />
  );
}
```

**SSR-disabled dynamic load (for performance + mobile gating):**
```tsx
// app/(site)/about/SplineLoader.tsx
"use client";
import dynamic from "next/dynamic";

const Spline = dynamic(() => import("./SplineScene"), {
  ssr: false,
  loading: () => <div className="aspect-square animate-pulse bg-neutral-900" />,
});

export default Spline;
```

**Mobile fallback (PROJECT.md requirement):** Gate at render, not via CSS. Use a media-query hook or `useSyncExternalStore` reading `matchMedia("(min-width: 768px)")`. If mobile, render the static illustration instead of mounting Spline at all — mounting and then hiding still ships the WebGL bundle and runs the scene.

```tsx
const isDesktop = useIsDesktop(); // custom matchMedia hook
return isDesktop ? <Spline /> : <Image src="/about-static.png" ... />;
```

**Gotchas:**
- `@splinetool/runtime` is heavy (~hundreds of KB). Lazy-load is mandatory for Lighthouse ≥ 85.
- Spline scenes auto-play on load. To trigger on scroll (PROJECT.md: "greeting animation on scroll"), use Spline's `onLoad` to capture the app instance, then play a named state via `spline.emitEvent('mouseDown', 'objectName')` or `spline.setVariable(...)` driven by a ScrollTrigger.
- CORS: scenes are served from `prod.spline.design`. Should Just Work, but if you self-host the `.splinecode` file, set `Access-Control-Allow-Origin`.

---

### 4. `shader-gradient` for Hero

**Always client + dynamic, never SSR.** Same pattern as Spline — depends on WebGL/`three`, will crash in RSC.

```tsx
// app/(site)/_components/HeroGradient.tsx
"use client";
import dynamic from "next/dynamic";

const ShaderGradient = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradient),
  { ssr: false }
);
const ShaderGradientCanvas = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradientCanvas),
  { ssr: false }
);

export function HeroGradient() {
  return (
    <ShaderGradientCanvas className="absolute inset-0">
      <ShaderGradient
        type="waterPlane"
        color1="#FF4500"
        color2="#C0001A"
        color3="#0A0A0A"
        animate="on"
        uSpeed={0.2}
      />
    </ShaderGradientCanvas>
  );
}
```

**Version-pin warning:** Faraz Shaikh maintains two related packages — `shadergradient` (older, the studio playground export) and `@shadergradient/react` (the newer React-focused package). **Verify which one shadergradient.com currently recommends from its "Export Code" panel before installing.** PROJECT.md says "shader-gradient npm package" — confirm exact package name with `npm view`. If the wrong one is pinned in v1, swap is non-trivial (different props API).

**Performance:**
- Set `uSpeed` low (0.1–0.3) — high speeds spike GPU usage on integrated graphics.
- On mobile, consider serving a static gradient PNG behind a `useIsDesktop` check, same as Spline. WebGL on cheap phones tanks Lighthouse.
- The canvas is full-bleed behind the hero text — make sure the text container has its own stacking context (`relative z-10`) and the canvas is `position: absolute; inset: 0; z-0`.

---

### 5. `next-intl` v4 — Sub-path Routing (`/en`, `/de`)

**File layout (App Router):**
```
app/
  [locale]/
    layout.tsx           ← wraps children in NextIntlClientProvider
    page.tsx             ← / → redirects to /en
    about/page.tsx
    projects/[slug]/page.tsx
    life/page.tsx
i18n/
  routing.ts             ← defineRouting({ locales: ['en','de'], defaultLocale: 'en' })
  request.ts             ← getRequestConfig — loads messages per locale
  navigation.ts          ← createNavigation(routing) — typed Link, useRouter
messages/
  en.json
  de.json
middleware.ts            ← createMiddleware(routing)
next.config.mjs          ← withNextIntl plugin
```

**`next.config.mjs`:**
```js
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
export default withNextIntl({ /* your next config */ });
```

**`middleware.ts`:**
```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
export default createMiddleware(routing);
export const config = {
  // Skip _next, static files, api, and known assets
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

**Server component usage:**
```tsx
import { getTranslations } from "next-intl/server";
export default async function Page() {
  const t = await getTranslations("Hero");
  return <h1>{t("greeting")}</h1>;
}
```

**Client component usage:**
```tsx
"use client";
import { useTranslations } from "next-intl";
export function Nav() {
  const t = useTranslations("Nav");
  return <a>{t("about")}</a>;
}
```

**Hero name stays English (PROJECT.md):** Don't put the name in `messages/de.json` at all — render it as a hard-coded string in the Hero component, not as `t("name")`. Or store it once in a non-translated `brand.ts` constant and import in both locales.

**localePrefix:** Default is `"always"` → all URLs are `/en/...` and `/de/...`. PROJECT.md asks for this exact behavior. Do NOT set `localePrefix: "as-needed"` — it makes the default locale path-less (`/about` for EN, `/de/about` for DE), which breaks the "shareable URL" goal.

---

### 6. `@next/mdx` for /projects/[slug]

**`next.config.mjs`:**
```js
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
  },
});

// Combine with next-intl plugin
export default withNextIntl(withMDX({
  pageExtensions: ["ts", "tsx", "md", "mdx"],
}));
```

**`mdx-components.tsx` at project root** (required by `@next/mdx`):
```tsx
import type { MDXComponents } from "mdx/types";
import { ProjectTimeline } from "@/components/ProjectTimeline";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: ({ children }) => <h1 className="font-display text-4xl">{children}</h1>,
    ProjectTimeline,
  };
}
```

**Content directory pattern:** PROJECT.md specifies `/content/projects/[slug].mdx`. Two routing options:

- **Option A — File-based routes (simplest):** Put MDX in `app/[locale]/projects/[slug]/page.mdx`. `@next/mdx` makes them pages directly. But this couples content to route tree and complicates i18n (you'd need `page.en.mdx` / `page.de.mdx` — not great).
- **Option B — Content directory + dynamic import (recommended):** Keep `/content/projects/<slug>.mdx` (and `<slug>.de.mdx`). In `app/[locale]/projects/[slug]/page.tsx`, do:
  ```ts
  const { default: Post, frontmatter } = await import(
    `@/content/projects/${slug}${locale === 'de' ? '.de' : ''}.mdx`
  );
  ```
  Use `generateStaticParams` to pre-render all slug+locale pairs. Use `gray-matter` only if you need to extract frontmatter outside MDX import (e.g. for project card metadata on home).

**GSAP timeline inside MDX:** Make the `ProjectTimeline` component a client component with `useGSAP`. It'll be embedded as `<ProjectTimeline phases={...} />` inside `.mdx` files.

---

### 7. `next/font/google` — Space Mono + Plus Jakarta Sans + Courier Prime

**Define once in `app/[locale]/layout.tsx`:**
```tsx
import { Space_Mono, Plus_Jakarta_Sans, Courier_Prime } from "next/font/google";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-life",
  display: "swap",
});

export default function RootLayout({ children, params: { locale } }) {
  return (
    <html lang={locale} className={`${spaceMono.variable} ${jakarta.variable} ${courier.variable}`}>
      <body className="font-body bg-[#0A0A0A] text-white">{children}</body>
    </html>
  );
}
```

**Tailwind v4 — wire variables in CSS:**
```css
/* app/globals.css */
@import "tailwindcss";
@theme {
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --font-life: var(--font-life);
}
```

For Tailwind v3, do the same via `tailwind.config.ts` `theme.extend.fontFamily`.

**Gotchas:**
- German umlauts: `subsets: ["latin"]` covers `ä ö ü ß` (they're in basic Latin-1 supplement, included in the `latin` subset for these fonts). Verify visually in DE locale.
- `next/font/google` **must** be called at module top-level — not inside a component, never with a dynamic argument. The Next.js build inlines the font fetch at compile time.
- `/life` page: just add `className="font-life"` to its layout — it'll cascade via the CSS var.

---

## Version Pinning

Use caret ranges in `package.json`, then commit the lockfile. **Re-verify every version with `npm view <pkg> version` before installing** — the values below are best-current-knowledge but unverified against npm at research time.

```jsonc
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",

    "gsap": "^3.13.0",
    "@gsap/react": "^2.1.0",
    "framer-motion": "^11.0.0",

    "@splinetool/react-spline": "^4.0.0",
    "@splinetool/runtime": "^1.9.0",
    "@shadergradient/react": "latest",   // verify exact package name first
    "three": "^0.160.0",                  // match shader-gradient peer range

    "next-intl": "^4.0.0",

    "@next/mdx": "^15.0.0",
    "@mdx-js/loader": "^3.0.0",
    "@mdx-js/react": "^3.0.0",
    "@types/mdx": "^2.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-pretty-code": "^0.14.0",
    "shiki": "^1.0.0",
    "gray-matter": "^4.0.0",

    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^22.0.0",

    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@tailwindcss/typography": "latest",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "latest",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

**Lockfile:** commit `package-lock.json` (or `pnpm-lock.yaml` if you prefer pnpm — recommended for monorepos, fine for this single app).

**Pre-install verification command** (run once before `npm install`):
```bash
for p in next react gsap @gsap/react framer-motion @splinetool/react-spline @shadergradient/react next-intl @next/mdx tailwindcss; do
  echo "$p: $(npm view $p version)"
done
```

---

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

---

## Known Conflicts / Gotchas Between Packages

1. **GSAP + React 19 Strict Mode (dev only):** Double-mount duplicates ScrollTriggers. *Mitigation:* `useGSAP` with `scope` — it handles `ScrollTrigger.getAll().forEach(t => t.kill())` via `gsap.context()` revert.

2. **Framer Motion `layoutId` + Next App Router page transitions:** Source element unmounts before destination mounts. *Mitigation:* parallel/intercepting routes, or wait for stable React View Transitions integration.

3. **Spline + `next-intl` middleware:** The middleware matcher in next-intl docs sometimes catches asset URLs. *Mitigation:* the matcher above (`/((?!api|_next|_vercel|.*\\..*).*)`) excludes anything with a dot — Spline asset URLs are external so they're fine, but local 3D assets in `/public` would be caught without this guard.

4. **`@next/mdx` + `next-intl` plugins in `next.config.mjs`:** Both wrap the config — nest them correctly: `withNextIntl(withMDX(config))`. Order matters; getting it backwards silently breaks one or the other.

5. **`shader-gradient` + Spline = two `three` instances:** If both packages bundle their own `three`, you'll get "Multiple instances of Three.js being imported" warnings and broken renders. *Mitigation:* explicitly install `three` at the version both packages peer-depend on; use `resolutions` (yarn) or `overrides` (npm) to force a single version.

6. **`useGSAP` + `gsap.matchMedia` for responsive:** Put `matchMedia` *inside* `useGSAP` callback, not outside. Otherwise the cleanup doesn't include the matchMedia contexts.

7. **Tailwind v4 + `prettier-plugin-tailwindcss`:** Plugin needs ≥ v0.6 for Tailwind v4 syntax. Pin the latest.

8. **Next.js 15 + `dynamic({ ssr: false })` in Server Components:** **Not allowed.** `ssr: false` requires the calling component to be `"use client"`. Wrap your Spline/ShaderGradient loader file with `"use client"` and import it from server components — the dynamic call lives in the client file.

9. **Hot reload + GSAP timelines:** Edits to a timeline in dev can leave orphaned tweens until full reload. Not a bug — known dev-mode behavior. Hard refresh if animations get weird.

10. **next-intl locale not in route → 404:** Visiting `/` with `localePrefix: "always"` redirects to `/en` only if you set up the redirect (middleware does this by default with the matcher above). Verify by visiting `/` after setup.

---

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

**Recommended next step before coding:** run the `npm view` loop above to pin exact current versions, and check the README of `@shadergradient/react` (or `shadergradient` — whichever the export panel currently emits) to confirm the package name + Canvas/Gradient component API hasn't shifted.

---

## Sources

External verification tools (WebSearch, WebFetch, Brave search, Context7 CLI) were unavailable during this research pass. The recommendations above are based on the agent's training knowledge of the Next.js / React / GSAP / Spline / next-intl ecosystem as of early 2026 and the explicit constraints in `.planning/PROJECT.md`. Before finalizing `package.json`, verify against:

- https://nextjs.org/docs (Next 15 App Router, `@next/mdx`, `next/font`, `dynamic`)
- https://gsap.com/resources/React/ (`useGSAP`, current pricing/licensing)
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (current API)
- https://docs.spline.design/doc/getting-started-react/ + npm page for `@splinetool/react-spline`
- https://next-intl.dev/docs/getting-started/app-router (v4 setup, `routing`, `navigation`, middleware)
- https://www.shadergradient.com/ (current export package name and props)
- https://motion.dev/ and https://www.framer.com/motion/ (current package name)
- `npm view <pkg> version` for every entry in Version Pinning above.
