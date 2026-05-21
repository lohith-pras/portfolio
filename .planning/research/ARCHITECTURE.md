# Architecture Patterns

**Domain:** Next.js App Router portfolio with i18n, MDX, GSAP, Framer Motion, Spline, shader-gradient
**Researched:** 2026-05-22
**Overall confidence:** MEDIUM-HIGH (based on training data — external doc verification was blocked this session; flag for cross-check against current next-intl v3.x docs)

---

## Component Architecture

### High-Level Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ middleware.ts (next-intl)                                        │
│   - detects locale, rewrites / -> /en, /de, etc.                 │
│   - sets request locale context                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ app/[locale]/layout.tsx  (Server Component)                      │
│   - <html lang={locale}>                                         │
│   - next/font setup (Space Mono, Plus Jakarta, Courier Prime)    │
│   - NextIntlClientProvider wraps children                        │
│   - <Providers> wrapper (GSAP context, theme, etc.)              │
└──────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
   │ app/[locale] │  │ app/[locale] │  │ app/[locale]     │
   │ /page.tsx    │  │ /life/page   │  │ /projects/[slug] │
   │ (home,       │  │ (Courier     │  │ /page.tsx (MDX)  │
   │  Server RSC) │  │  Prime page) │  │                  │
   └──────────────┘  └──────────────┘  └──────────────────┘
            │                                  │
            ▼                                  ▼
   ┌─────────────────────────────┐  ┌────────────────────────────┐
   │ Section components          │  │ MDX rendering layer        │
   │  - Hero (client: shader)    │  │  - serialize via @next/mdx │
   │  - About (client: Spline)   │  │  - custom components map   │
   │  - Work (client: GSAP)      │  │  - GSAP phase timeline     │
   │  - Contact (server safe)    │  │    (client component)      │
   └─────────────────────────────┘  └────────────────────────────┘
            │                                  │
            └──────────┬───────────────────────┘
                       ▼
         ┌──────────────────────────────┐
         │ Shared chrome (client)       │
         │  - <TopNav> / <BottomNav>    │
         │  - <LocaleSwitcher>          │
         │  - <PageTransition>          │
         │    (Framer AnimatePresence)  │
         └──────────────────────────────┘
```

### Component Boundaries

| Component | Type | Responsibility | Talks To |
|-----------|------|----------------|----------|
| `middleware.ts` | Edge | Locale detection, rewrite to `/[locale]/...` | next-intl config |
| `i18n/request.ts` | Server | Loads messages JSON per request | Server components, `getTranslations()` |
| `app/[locale]/layout.tsx` | Server | Fonts, locale validation, providers | All routes |
| `Providers` | Client | Wraps `NextIntlClientProvider`, sets up GSAP context once | Client components |
| `app/[locale]/page.tsx` | Server | Composes Hero/About/Work/Contact sections | Section components |
| `Hero` shell | Server | Layout, copy from `getTranslations` | `<ShaderBackground/>` (client) |
| `ShaderBackground` | Client | `shader-gradient` WebGL canvas | Browser WebGL |
| `About` shell | Server | Layout, descriptor text | `<SplineScene/>` (client, dynamic) |
| `SplineScene` | Client | Lazy `@splinetool/react-spline`, scroll trigger | Spline runtime |
| `Work` shell | Server | Project list metadata (from `content/projects/`) | `<WorkGrid/>` (client) |
| `WorkGrid` | Client | GSAP stagger reveal, Framer `layoutId` cards | `<ProjectCard/>` |
| `LifePage` | Server | Loads photo manifest, hobbies, obsessions text | `<RotatedPhoto/>` client wrapper |
| `ProjectPage` | Server | Reads MDX via App Router file convention | MDX components map |
| `MDXComponents` | Mix | Map of overrides (typography, code, `<PhaseTimeline/>`) | GSAP timeline (client) |
| `PhaseTimeline` | Client | GSAP-drawn SVG timeline within MDX | GSAP DrawSVG/ScrollTrigger |
| `TopNav` / `BottomNav` | Client | Active route, locale switcher, scroll-aware visibility | next/navigation, next-intl |
| `LocaleSwitcher` | Client | Switches between `/en` and `/de` preserving path | `usePathname`, `useRouter` from `next-intl/navigation` |
| `PageTransition` | Client | `AnimatePresence mode="wait"` keyed on pathname | Framer Motion |

---

## Server vs Client Split

This is the **most critical decision** for this stack. Get it wrong and you get hydration mismatches, broken animations, or SSR errors from WebGL/Spline.

### Rule of Thumb

**Default to Server Components.** Only push to Client when the component:
1. Uses browser APIs (`window`, `document`, WebGL, IntersectionObserver)
2. Uses React hooks (`useState`, `useEffect`, `useRef`)
3. Imports a library that does (Framer Motion, GSAP, shader-gradient, Spline)
4. Needs interactivity (onClick, form input)

### Boundary Map

| Layer | Server | Client |
|-------|--------|--------|
| Root layout | YES (fonts, locale validation, `<html>`) | NO |
| Providers component | NO | YES — `'use client'`, hosts `NextIntlClientProvider`, GSAP root context |
| Page files (`page.tsx`) | YES (always — call `getTranslations`, fetch MDX metadata) | NO |
| Section *shells* (Hero/About/Work) | YES (layout, copy, headings, semantic HTML) | NO |
| Section *animation/visual layers* | NO | YES (`<ShaderBackground/>`, `<SplineScene/>`, `<WorkGridAnimated/>`) |
| Navigation | NO | YES (needs `usePathname`, scroll listener) |
| LocaleSwitcher | NO | YES (uses `useRouter` from next-intl) |
| Page transition wrapper | NO | YES (Framer `AnimatePresence`) |
| MDX page | YES (file is RSC) | Client islands inside via `<PhaseTimeline/>` etc. |
| MDX components map | Mix — text overrides server-safe, interactive ones (`<Callout>`, `<PhaseTimeline>`) marked `'use client'` | — |

### Critical Patterns

**Pattern: Server shell + Client island**
The Hero needs i18n text (server) and a WebGL background (client). Don't make the whole Hero a client component — you'd lose RSC i18n benefits.

```tsx
// app/[locale]/_sections/hero/index.tsx  (Server)
import {getTranslations} from 'next-intl/server';
import ShaderBackground from './ShaderBackground'; // client

export default async function Hero() {
  const t = await getTranslations('hero');
  return (
    <section className="relative min-h-screen">
      <ShaderBackground /> {/* client island, absolute positioned */}
      <div className="relative z-10">
        <h1>{t('name')}</h1>
        <ContactLinks />
      </div>
    </section>
  );
}
```

**Pattern: Dynamic import for SSR-incompatible libraries (Spline, shader-gradient)**

```tsx
// app/[locale]/_sections/about/SplineScene.tsx
'use client';
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <StaticIllustration />,
});
```

Note: `ssr: false` in `next/dynamic` only works inside a Client Component in App Router. So the dynamic import lives in a `'use client'` wrapper, not directly in a server `page.tsx`.

**Pattern: Single GSAP root context**

Register plugins once at app boot inside `Providers`, not in every component. This avoids double-registration warnings and SSR errors (GSAP plugins reference `window`).

```tsx
// app/providers.tsx
'use client';
import {useEffect} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Providers({children, messages, locale}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

Per-component animations use `useGSAP()` from `@gsap/react` to scope and auto-clean.

---

## Data Flow

### i18n Strings Flow

```
messages/en.json ──┐
messages/de.json ──┤
                   ▼
            i18n/request.ts (server)
            getRequestConfig({locale, messages})
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
  Server components     Client components
  await getTranslations() useTranslations()
  (RSC, async)          (via NextIntlClientProvider in Providers)
```

- Server components: import `getTranslations` from `next-intl/server`, async-await. Preferred — keeps bundle small.
- Client components: `useTranslations` hook. Requires messages to be passed to `NextIntlClientProvider` in the layout.
- Pass only required namespaces to client provider when possible (`messages.pick(['nav','hero'])` pattern) to keep client payload lean.
- The hero **name** is hard-coded English even on `/de` — store as literal, not in messages.

### MDX Content Flow

```
content/projects/<slug>.mdx ──┐
content/projects/<slug>.de.mdx (or front-matter locale)
                              ▼
        app/[locale]/projects/[slug]/page.tsx (Server)
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
         generateStaticParams()      Render MDX
         (build-time: enumerate      via @next/mdx
         all slug+locale combos)     with mdxComponents map
                                            │
                                            ▼
                              Custom components map:
                              - h1/h2/p → typography overrides (server-safe)
                              - <PhaseTimeline> → client island (GSAP)
                              - <Image> → next/image
                              - <Callout> → client (Framer entrance)
```

- MDX files live in `/content/projects/[slug].mdx` (or `/content/projects/[slug]/index.mdx` if assets co-located).
- Front-matter holds: title, summary, hero image, tags, phase data for the timeline, locale.
- For DE translations: either parallel files `slug.de.mdx` or a single file with translated front-matter and body served by locale. Recommend parallel files — simpler, easier for DeepL pass.
- `generateStaticParams` enumerates `{locale, slug}` pairs at build time → fully static, fast.
- Project list on home page reads the same `/content/projects` directory at build via a `getProjects(locale)` helper (Node fs at build only).

### Animation State Flow

```
Page mount ──┐
             ▼
    Providers (client) registers GSAP plugins once
             │
             ▼
    Section client components run useGSAP() in useEffect/useLayoutEffect
             │
             ▼
    ScrollTrigger registers triggers, kills on unmount
             │
             ▼
    Route change ──> AnimatePresence exit ──> ScrollTrigger.refresh() on enter
```

**Critical:** call `ScrollTrigger.refresh()` after route transitions (Framer `AnimatePresence` `onExitComplete`) and after dynamic content loads (Spline ready, images loaded) — otherwise triggers fire at wrong scroll positions.

---

## Build Order

Order things so each layer rests on a stable foundation. Wrong order = constant refactoring of the layout shell.

### Hard Blockers (must exist before dependent work)

1. **next-intl middleware + `[locale]` routing skeleton** blocks everything else page-level. URLs change once you add it; do it first.
2. **Design tokens + fonts in root layout** block any section work. Tailwind config (colors, fluid clamp scale) and `next/font` declarations.
3. **Providers component (client root)** blocks GSAP/Framer work. Without it, no client context.
4. **MDX pipeline (`next.config.mjs` + `mdx-components.tsx`)** blocks project pages. Get a "hello world" `.mdx` rendering before authoring content.
5. **Navigation shell with LocaleSwitcher** blocks user-facing testing of i18n. Build early even if ugly.

### Suggested Phase Order

| # | Layer | What | Unblocks |
|---|-------|------|----------|
| 1 | Foundation | Next.js + TS + Tailwind init, `next/font`, design tokens, repo hygiene | Everything |
| 2 | i18n | next-intl install, `middleware.ts`, `i18n/request.ts`, `[locale]/layout.tsx`, `messages/en.json` + `de.json` stubs, `<LocaleSwitcher>` | All pages |
| 3 | Chrome | Root layout, Providers (NextIntl + GSAP register), TopNav/BottomNav skeleton, PageTransition wrapper | All pages |
| 4 | Static home shell | Hero/About/Work/Contact sections with static HTML + i18n strings, no animations yet | Content authoring, visual review |
| 5 | MDX pipeline | `@next/mdx` config, `mdx-components.tsx`, `/content/projects/` structure, `[slug]/page.tsx`, one sample MDX | Project content authoring |
| 6 | Animation layer 1 (Framer) | PageTransition `AnimatePresence`, project card `layoutId` expansion | UX flow validation |
| 7 | Animation layer 2 (GSAP) | Work grid stagger, scroll-driven reveals, `useGSAP` patterns | Polish |
| 8 | Visual heavy hitters | shader-gradient hero, Spline About scene with desktop-gate + mobile fallback | Performance validation |
| 9 | /life page | Courier Prime route, photo manifest, random rotation, hobbies | Personality layer |
| 10 | MDX deep-dive features | PhaseTimeline GSAP component inside MDX, code highlighting, image components | Project quality |
| 11 | i18n content | DeepL pass on `de.json` + `de.mdx` files | Launch |
| 12 | Perf + a11y pass | Lighthouse ≥ 85 mobile, prefers-reduced-motion gates, image sizing | Launch |

**Why this order:**
- i18n before content because URL structure changes break links retroactively.
- MDX pipeline before animations because authoring content is the long-pole work — start it draining early.
- Static shells before animations so you can review composition without animation noise distracting.
- shader-gradient + Spline late because they're isolated and risky for perf — easier to swap or scope-cut.
- DeepL pass at the end so you translate finished copy, not drafts.

---

## next-intl App Router Specifics

(Confidence: MEDIUM — verify against current next-intl v3.x docs; API has been stable since mid-2024.)

### Required Files

```
middleware.ts                    # locale detection + rewrite
i18n.ts  OR  i18n/request.ts     # message loader (Server)
i18n/routing.ts                  # locales array + defaultLocale + pathnames
i18n/navigation.ts               # wrapped Link, useRouter, redirect, usePathname
messages/en.json
messages/de.json
app/[locale]/layout.tsx          # validates locale, sets <html lang>, provider
app/[locale]/page.tsx            # home
next.config.mjs                  # createNextIntlPlugin() wrapper
```

### Middleware

```ts
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### Routing config

```ts
// i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  localePrefix: 'always',  // /en and /de both prefixed — matches PROJECT.md
});
```

`localePrefix: 'always'` ensures `/en` is real (not just `/`). Cleaner for analytics, shareable, SEO-stable.

### Locale Layout

```tsx
// app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}) {
  const {locale} = await params; // Next 15 async params
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Notes:
- `params` is a Promise in Next.js 15+ — `await` it. (Confidence: HIGH for Next 15.)
- `setRequestLocale(locale)` enables static rendering of pages that use translations. Without it, those pages opt into dynamic rendering.
- Call `setRequestLocale` in every server page/layout that calls `getTranslations` if you want static generation.

### LocaleSwitcher (preserves current path)

```tsx
'use client';
import {usePathname, useRouter} from '@/i18n/navigation';
import {useLocale} from 'next-intl';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname(); // locale-less
  const other = locale === 'en' ? 'de' : 'en';
  return (
    <button onClick={() => router.replace(pathname, {locale: other})}>
      {other.toUpperCase()}
    </button>
  );
}
```

Use the wrapped `usePathname`/`useRouter` from `i18n/navigation.ts`, not the raw `next/navigation` ones — the wrapped versions are locale-aware.

---

## GSAP Initialization Strategy (Avoid Hydration Mismatches)

(Confidence: HIGH — well-established pattern.)

### Rules

1. **Never run GSAP at module top-level** in a component that may render on the server. Wrap in `useGSAP()` or `useLayoutEffect`.
2. **Register plugins once** at the client root (Providers). Guard with `typeof window !== 'undefined'`.
3. **Use `@gsap/react`'s `useGSAP()` hook** — handles SSR safety, scoped selectors, and automatic cleanup of tweens/triggers on unmount.
4. **Don't animate styles GSAP will eventually set** in the server-rendered HTML — set initial state via `gsap.set()` inside the same `useGSAP()` block, or use `autoAlpha: 0` + `visibility:hidden` in CSS to avoid FOUC where elements flash visible pre-animation.
5. **`ScrollTrigger.refresh()`** after: route changes, font loads, image loads, Spline ready. Otherwise triggers fire at stale scroll positions.
6. **Use `gsap.matchMedia()`** for responsive breakpoints (PROJECT.md mentions this explicitly) — cleaner than manual `window.innerWidth` checks and handles cleanup.

### Skeleton

```tsx
'use client';
import {useRef} from 'react';
import {useGSAP} from '@gsap/react';
import {gsap} from 'gsap';

export function WorkGrid({children}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        gsap.from('.card', {
          opacity: 0,
          y: 40,
          stagger: 0.1,
          scrollTrigger: {trigger: root.current, start: 'top 70%'},
        });
      });
      mm.add('(max-width: 767px)', () => {
        gsap.from('.card', {opacity: 0, y: 20, stagger: 0.05});
      });
    },
    {scope: root}
  );

  return <div ref={root} className="grid">{children}</div>;
}
```

### Framer Motion + GSAP Coexistence

PROJECT.md locks the split: **GSAP owns scroll/macro**, **Framer Motion owns component/transition**. Enforce by file location: Framer imports only inside `/components/transitions/` and card-level files; GSAP imports only inside section-level files. A simple ESLint `no-restricted-imports` rule can enforce this.

For the project card `layoutId` morph into the detail page: that's Framer's job (shared layout animation across route). When the detail page mounts, its GSAP timeline starts after Framer's layout animation completes — use Framer's `onAnimationComplete` to call `ScrollTrigger.refresh()` and start GSAP timelines.

---

## Folder Structure

Recommended layout — opinionated, optimized for this specific stack.

```
portfolio_v2/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                 # locale validation, fonts, Providers
│   │   ├── page.tsx                   # home (Hero/About/Work/Contact)
│   │   ├── life/
│   │   │   └── page.tsx               # Courier Prime page
│   │   ├── projects/
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # MDX project deep-dive
│   │   └── _sections/                 # underscore = not a route
│   │       ├── hero/
│   │       │   ├── index.tsx          # server shell
│   │       │   └── ShaderBackground.tsx  # 'use client'
│   │       ├── about/
│   │       │   ├── index.tsx
│   │       │   ├── SplineScene.tsx    # 'use client', dynamic import
│   │       │   └── StaticFallback.tsx # mobile illustration
│   │       ├── work/
│   │       │   ├── index.tsx
│   │       │   ├── WorkGrid.tsx       # 'use client', GSAP
│   │       │   └── ProjectCard.tsx    # 'use client', Framer layoutId
│   │       └── contact/
│   │           └── index.tsx
│   ├── providers.tsx                  # 'use client' — NextIntlClientProvider + GSAP register
│   ├── globals.css                    # Tailwind base, font-face vars
│   └── favicon.ico
├── components/
│   ├── chrome/
│   │   ├── TopNav.tsx                 # desktop
│   │   ├── BottomNav.tsx              # mobile
│   │   └── LocaleSwitcher.tsx
│   ├── transitions/
│   │   └── PageTransition.tsx         # AnimatePresence wrapper
│   └── mdx/
│       ├── PhaseTimeline.tsx          # GSAP-drawn SVG
│       ├── Callout.tsx
│       └── CodeBlock.tsx
├── content/
│   └── projects/
│       ├── mimo-ai-channel.mdx
│       ├── mimo-ai-channel.de.mdx
│       ├── vlc-v2v.mdx
│       ├── vlc-v2v.de.mdx
│       ├── iot-security.mdx
│       └── iot-security.de.mdx
├── i18n/
│   ├── routing.ts                     # locales, defaultLocale, pathnames
│   ├── request.ts                     # getRequestConfig
│   └── navigation.ts                  # wrapped Link/useRouter/usePathname
├── messages/
│   ├── en.json
│   └── de.json
├── lib/
│   ├── projects.ts                    # getProjects(locale), getProject(slug, locale)
│   └── fonts.ts                       # next/font declarations exported as CSS vars
├── public/
│   ├── images/                        # static photos for /life, project hero images
│   └── illustrations/                 # mobile Spline fallback
├── mdx-components.tsx                 # MDX components map (root, per @next/mdx convention)
├── middleware.ts
├── next.config.mjs                    # createNextIntlPlugin + createMDX
├── tailwind.config.ts                 # design tokens, fluid clamp scale
├── tsconfig.json
└── package.json
```

### Notes on Structure

- `_sections/` uses the underscore prefix Next.js treats as a private folder (not routable). Keeps section components co-located with the home page that consumes them, without polluting the route tree.
- `mdx-components.tsx` **must** be at project root per `@next/mdx` App Router convention — don't move it.
- `content/` outside `app/` because MDX files are data, not routes. Pages read them at build via `lib/projects.ts`.
- `lib/fonts.ts` centralizes `next/font` calls so they only run once (next/font requires module-level calls).
- Parallel `.de.mdx` files keep DeepL workflow simple — translate file-by-file, no merge logic.

---

## Quality Gate Self-Check

- [x] Server/Client component boundaries explicitly mapped (Server vs Client Split section, boundary table)
- [x] Data flow direction explicit for i18n (server-first via `getTranslations`, client via provider) and MDX (file → RSC → MDX renderer → component map with client islands)
- [x] Build order implications noted (i18n blocks routing, MDX pipeline blocks content, providers block animation libs)
- [x] next-intl App Router setup specifics included (middleware, routing config, locale layout, `setRequestLocale`, LocaleSwitcher, `localePrefix: 'always'`)
- [x] GSAP hydration strategy covered (useGSAP hook, single registration in Providers, matchMedia, ScrollTrigger.refresh timing)

---

## Sources & Confidence

- next-intl App Router patterns — MEDIUM confidence (training-data based; external doc fetch was blocked this session). Recommend cross-checking `setRequestLocale` API and Next 15 async `params` behavior against current next-intl docs at https://next-intl.dev before locking config.
- GSAP + `useGSAP` hook patterns — HIGH confidence (stable API since `@gsap/react` 2.x).
- `@next/mdx` App Router conventions (`mdx-components.tsx` at root) — HIGH confidence.
- Framer Motion `AnimatePresence` + `layoutId` for shared element transitions — HIGH confidence.
- `next/dynamic` with `ssr: false` requiring a Client Component parent in App Router — HIGH confidence (changed in Next 13.4+).
- shader-gradient and @splinetool/react-spline SSR incompatibility — HIGH confidence (both touch WebGL at module init or first render).

**Flag for phase-level verification:** Before Phase 2 (i18n), verify next-intl v3.x API surface against live docs — minor names like `defineRouting`, `setRequestLocale`, and the navigation helper exports have shifted between v3 minor versions.
