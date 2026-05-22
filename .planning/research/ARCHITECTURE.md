# Architecture Patterns — v2.0 Integration

**Domain:** Next.js 15 App Router portfolio — v2.0 feature integration
**Researched:** 2026-05-22
**Overall confidence:** HIGH (based on direct codebase inspection, not training assumptions)

---

## Context: What Already Exists

The v1 codebase has a clearly established structure that v2.0 features must slot into without structural changes.

### Existing component topology (verified from source)

```
src/
├── app/
│   └── [locale]/
│       ├── layout.tsx               ← Server RSC; NextIntlClientProvider, NavbarDesktop, NavbarMobile, PageTransition
│       ├── page.tsx                 ← Server RSC; renders ShaderCanvasWrapper, HeroSection, AboutSection, WorkSection
│       ├── @modal/(.)projects/[slug]/page.tsx  ← Parallel route modal, same MDX import pattern
│       └── projects/[slug]/page.tsx ← Server RSC; dynamic import of @/content/projects/[locale]/[slug].mdx
├── components/
│   ├── AboutSection.tsx             ← Server-safe RSC (only uses useTranslations, no browser APIs)
│   ├── HeroSection.tsx              ← 'use client' (uses GSAP via HeroTitle)
│   ├── HeroTitle.tsx                ← 'use client' (GSAP ScrambleText)
│   ├── PhaseTimeline.tsx            ← 'use client' (GSAP DrawSVG + ScrollTrigger)
│   ├── ShaderCanvas.tsx             ← 'use client' (WebGL)
│   ├── ShaderCanvasWrapper.tsx      ← 'use client'; next/dynamic wrapper, ssr: false
│   └── ...
├── content/projects/
│   ├── en/[slug].mdx
│   └── de/[slug].mdx
├── lib/gsap.ts                      ← Central GSAP import surface; plugins registered once here
└── mdx-components.tsx               ← At project root; h1/h2/p overrides
```

### Critical architecture facts (from code inspection)

1. `AboutSection.tsx` is currently a plain server-compatible component — no `'use client'` directive, no hooks that require client boundary. It uses `useTranslations` which works in server components.
2. The GSAP plugin registration lives in `src/lib/gsap.ts` with a `typeof window !== 'undefined'` guard, exported and used by components that import from `@/lib/gsap`.
3. MDX files are at `src/content/projects/{locale}/{slug}.mdx` — note the locale is a subdirectory, not a suffix (verified from the import path in `projects/[slug]/page.tsx`: `import('@/content/projects/${locale}/${slug}.mdx')`).
4. `next.config.mjs` has `withMDX({})` with **no remark/rehype plugins configured** — the plugins object is empty.
5. `@splinetool/react-spline` is listed in `package.json` (`milestone_context` says "already a dependency") but is **not installed** in `node_modules` — requires `npm install` before use.
6. Neither `rehype-pretty-code` nor `shiki` is in `package.json` or `node_modules` — requires install and config.
7. The modal route (`@modal/(.)projects/[slug]`) uses the exact same MDX import pattern as the full-page route — any MDX content changes automatically apply to both.

---

## Feature A: Spline 3D Character in About Section

### Integration point

`src/components/AboutSection.tsx` is where the Spline component slots in. The file is currently a server component rendering a placeholder `<div>` in the right column of a 2-column grid.

### Where exactly the Spline component lives

**New file:** `src/components/SplineAbout.tsx`

This is a dedicated `'use client'` wrapper that:
- Uses `next/dynamic` with `ssr: false` to lazy-load `@splinetool/react-spline/next`
- Owns the desktop-only conditional render logic
- Owns the GSAP ScrollTrigger + Spline app-instance bridge for the greeting animation

`AboutSection.tsx` imports `SplineAbout` and renders it in the right column, replacing the placeholder div.

### Why a separate file (not inline in AboutSection)

`AboutSection.tsx` is currently a server component. Adding `'use client'` to it would push the entire About section (including the text copy) to the client bundle. The correct pattern — already used by `ShaderCanvasWrapper.tsx` wrapping `ShaderCanvas.tsx` — is to keep the shell as a server component and embed a client island for the interactive part. Keep the pattern consistent.

### Desktop-only gate: conditional render vs CSS hide

**Use conditional render, not CSS hide.** This is an existing, explicit project decision in CLAUDE.md:

> "Mounting Spline on mobile and hiding via CSS — The bundle still ships and the scene still runs. Instead: Conditional render gated by matchMedia."

Implementation in `SplineAbout.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Spline = dynamic(
  () => import('@splinetool/react-spline/next'),
  { ssr: false, loading: () => <StaticIllustrationFallback /> }
)

export function SplineAbout({ sceneUrl }: { sceneUrl: string }) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  if (!isDesktop) return <StaticIllustrationFallback />

  return <SplineWithScrollTrigger sceneUrl={sceneUrl} />
}
```

`useState(false)` is intentional — avoids SSR/hydration mismatch. On the server the initial render is `false`, the first hydration render is also `false` (since `useEffect` hasn't run), and then the `useEffect` fires and shows the desktop version if appropriate. This matches the same approach used by `ShaderCanvasWrapper` for the shader gradient.

**Static fallback file:** `src/components/StaticIllustrationFallback.tsx` — renders the SVG/image that was in the placeholder div. Extracting it makes it reusable by `SplineAbout` for both mobile and the Suspense loading state.

### Scroll-triggered greeting animation

The greeting plays once when the About section scrolls into view, then the scene returns to its idle loop.

**Integration with existing GSAP setup:**

The project already has `src/lib/gsap.ts` as the central GSAP surface with `ScrollTrigger` registered. Any client component importing from `@/lib/gsap` gets `ScrollTrigger` already registered. The Spline greeting trigger uses this same setup — no new plugin registration needed.

The scroll trigger lives inside `SplineAbout.tsx` (or a sub-component `SplineWithScrollTrigger.tsx`) using `useGSAP`:

```tsx
// Captures the Spline app instance via onLoad, then drives it from GSAP ScrollTrigger
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import type { Application } from '@splinetool/runtime'

function SplineWithScrollTrigger({ sceneUrl }: { sceneUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const splineAppRef = useRef<Application | null>(null)
  const hasGreetedRef = useRef(false)

  function handleLoad(splineApp: Application) {
    splineAppRef.current = splineApp
  }

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 60%',
      once: true,  // fires greeting once, never again
      onEnter: () => {
        if (splineAppRef.current && !hasGreetedRef.current) {
          hasGreetedRef.current = true
          // Trigger the named state/event in Spline
          // Exact method depends on how the scene is authored:
          // Option A — named event: splineAppRef.current.emitEvent('mouseDown', 'Character')
          // Option B — named state: splineAppRef.current.emitEventReverse('mouseHover', 'Character')
          // Confirm the event/object name when the Spline scene is built
        }
      },
    })
  }, { scope: containerRef, dependencies: [] })

  return (
    <div ref={containerRef}>
      <Spline scene={sceneUrl} onLoad={handleLoad} />
    </div>
  )
}
```

**Why `once: true` on ScrollTrigger, not IntersectionObserver:** The project already uses GSAP ScrollTrigger throughout. `once: true` gives the same "fires once on enter" behavior without mixing two scroll APIs. `ABOUT-V2-01` says "triggers once on section scroll-in via IntersectionObserver, returns to idle loop" — IntersectionObserver is equally valid but GSAP ScrollTrigger already exists, is registered, and avoids introducing a second scroll-observation mechanism.

**Critical sequencing issue:** `ScrollTrigger.refresh()` must be called after the Spline scene loads, because the scene iframe/canvas can shift layout. Call it in `handleLoad`:

```tsx
function handleLoad(splineApp: Application) {
  splineAppRef.current = splineApp
  ScrollTrigger.refresh()  // recalculate trigger positions after Spline layout settles
}
```

### Modified files

| File | Change |
|------|--------|
| `src/components/AboutSection.tsx` | Replace placeholder div with `<SplineAbout sceneUrl="..." />` import |

### New files

| File | Purpose | Component type |
|------|---------|----------------|
| `src/components/SplineAbout.tsx` | Desktop gate + dynamic Spline import + scroll trigger | `'use client'` |
| `src/components/StaticIllustrationFallback.tsx` | SVG/image fallback for mobile and Spline loading state | Server-safe (or client if uses hooks) |

### Package requirement

`@splinetool/react-spline` needs `npm install` — it is in `package.json` but not in `node_modules`. No version conflict risk since the project locked it at project start.

### Performance notes

- `next/dynamic` with `ssr: false` + `loading:` prop means: server renders the `StaticIllustrationFallback`, client hydrates and starts loading Spline bundle, Spline bundle loads and replaces the fallback on desktop only.
- The static fallback is visible for ~1-3 seconds on slow connections — make it visually similar to the Spline scene to avoid jarring swap.
- Spline runtime is heavy (~200-400KB gzipped). The lazy load via `next/dynamic` defers this from the initial JS parse. This is why the desktop conditional render must happen before the `<Spline>` component mounts — not after.

---

## Feature B: "What I'd do differently" Section in MDX

### Integration point

`src/content/projects/{en|de}/{slug}.mdx` — added as a new H2 section at the bottom of each MDX file.

### New MDX section vs new component: new MDX section

"What I'd do differently" is authored content — it's not a reusable interactive component, it's prose with opinions. It belongs in the MDX file as a standard `## What I'd Do Differently` heading section.

No new React component is needed for PROJ-V2-01 alone. The existing `h2` override in `mdx-components.tsx` already styles H2 headings.

The MDX content for each project file:

```mdx
## What I'd Do Differently

[Author's honest reflection prose here — this is the content author's job, not a component]
```

### If visual distinction is desired

If the section should look visually distinct from the rest of the page (accent color, callout box, different background), create a `<Callout>` MDX component:

**New file:** `src/components/mdx/Callout.tsx` — a styled container component, server-safe (no hooks needed for a pure styling component).

Register in `mdx-components.tsx`:

```tsx
import { Callout } from '@/components/mdx/Callout'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // existing overrides...
    Callout,
    ...components,
  }
}
```

Used in MDX as:

```mdx
<Callout type="reflection">
  What I'd do differently: ...
</Callout>
```

This is optional for v2.0 — the requirement just specifies the section exists. The `<Callout>` is a quality-of-life addition but not required to satisfy PROJ-V2-01.

### Modified files

| File | Change |
|------|--------|
| `src/content/projects/en/mimo-ai-channel-quality-tool.mdx` | Add `## What I'd Do Differently` section |
| `src/content/projects/en/vlc-v2v-communication.mdx` | Same |
| `src/content/projects/en/iot-security-project.mdx` | Same |
| `src/content/projects/de/mimo-ai-channel-quality-tool.mdx` | DE translation of the section |
| `src/content/projects/de/vlc-v2v-communication.mdx` | Same |
| `src/content/projects/de/iot-security-project.mdx` | Same |
| `mdx-components.tsx` | (Optional) Add `Callout` to components map |

### New files (optional)

| File | Purpose |
|------|---------|
| `src/components/mdx/Callout.tsx` | Styled callout/reflection box for MDX | 

---

## Feature C: rehype-pretty-code Syntax Highlighting

### Integration point

`next.config.mjs` is the single file that needs updating. `rehype-pretty-code` integrates via the `@next/mdx` plugin pipeline.

### Current state

`next.config.mjs` currently:

```js
const withMDX = createMDX({
  // Add markdown plugins here, as desired
})
```

The comment "as desired" marks where the rehype pipeline goes. This is the standard `@next/mdx` plugin injection point.

### What changes in next.config.mjs

```js
import rehypePrettyCode from 'rehype-pretty-code'

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: 'one-dark-pro',   // or 'github-dark', 'vesper' — pick one that matches the dark-only palette
        keepBackground: false,   // use Tailwind/CSS for background instead of inline style
      }]
    ],
  },
})
```

That's the complete change to `next.config.mjs`. No changes to any component files, no MDX content changes, no runtime code.

### How code blocks in MDX become highlighted

In MDX, a fenced code block with a language tag is automatically picked up:

````mdx
```python
def predict_channel_quality(features):
    return model.predict(features)
```
````

`rehype-pretty-code` processes these at build time via the Shiki tokenizer and outputs pre-styled HTML with inline spans. Zero JS is sent to the browser for syntax highlighting — it's all static HTML+CSS.

### Styling integration

`rehype-pretty-code` outputs a `<figure>` wrapper with `data-rehype-pretty-code-figure` attribute. The `<code>` and `<pre>` elements inside get `data-language` and `data-theme` attributes. These need CSS targeting.

The existing `mdx-components.tsx` overrides `h1/h2/p` but does not override `pre` or `code`. Add overrides for code blocks:

```tsx
// mdx-components.tsx additions
pre: ({ children, ...props }) => (
  <pre
    className="rounded-lg border border-white/10 overflow-x-auto text-sm my-6 p-4"
    {...props}
  >
    {children}
  </pre>
),
code: ({ children, ...props }) => (
  // rehype-pretty-code adds data-language — only style inline code (no data-language)
  // Block code is already wrapped by pre override above
  <code
    className="font-mono text-accent/90 bg-white/5 px-1.5 py-0.5 rounded text-sm"
    {...props}
  >
    {children}
  </code>
),
```

Alternatively, add global CSS in `globals.css` targeting `[data-rehype-pretty-code-figure]` — either approach works.

### Does it affect the modal route?

Yes, automatically. Both `app/[locale]/projects/[slug]/page.tsx` and `app/[locale]/@modal/(.)projects/[slug]/page.tsx` use the same dynamic MDX import pattern. Since `rehype-pretty-code` processes MDX at build time (it's a Webpack/MDX compilation step, not a runtime step), all rendered MDX gets highlighted automatically — including the modal.

### Package installation required

```bash
npm install rehype-pretty-code
```

`rehype-pretty-code` installs `shiki` as a peer dependency automatically. Neither is in the current `package.json`.

### Modified files

| File | Change |
|------|--------|
| `next.config.mjs` | Add `rehype-pretty-code` import + `options.rehypePlugins` array |
| `mdx-components.tsx` | Add `pre` and `code` overrides for styling |

### No changes needed

| File | Reason |
|------|--------|
| `src/app/[locale]/projects/[slug]/page.tsx` | MDX compilation is transparent — no import changes |
| `src/app/[locale]/@modal/(.)projects/[slug]/page.tsx` | Same |
| Any MDX content file | Fenced code blocks already use standard Markdown syntax |

---

## Suggested Build Order

Given the dependencies between these three features:

### Step 1: rehype-pretty-code (PROJ-V2-02)

**Do this first.** It has the smallest blast radius — one config file, no component changes, no UI work. Installing it validates the MDX pipeline still builds cleanly, and code blocks in the MDX files become instantly useful when authoring content. It has zero dependencies on the other two features.

1. `npm install rehype-pretty-code`
2. Edit `next.config.mjs` to add the plugin
3. Add `pre`/`code` overrides to `mdx-components.tsx`
4. Add test code blocks to one MDX file (`en/mimo-ai-channel-quality-tool.mdx`) and verify build

### Step 2: "What I'd do differently" content (PROJ-V2-01)

**Do this second.** Pure content work — add the reflection sections to MDX files. No code changes. Can be done in parallel with step 1 but makes more sense after syntax highlighting is working so you can also add code snippets at the same time. Authoring both the reflection section and code snippets in one MDX editing pass is more efficient than two passes.

1. Add `## What I'd Do Differently` + prose to all 6 MDX files (3 slugs × 2 locales)
2. Optionally add code snippets with fenced blocks (only meaningful after Step 1 is done)
3. Optionally create `src/components/mdx/Callout.tsx` and register in `mdx-components.tsx` if visual distinction is wanted

### Step 3: Spline 3D character (ABOUT-V2-01/02/03)

**Do this last.** It has the most dependencies — requires the Spline scene to be designed and exported, and involves more wiring (dynamic import, desktop gate, scroll trigger). The other two features are independent of it.

1. `npm install @splinetool/react-spline @splinetool/runtime`
2. Create `src/components/StaticIllustrationFallback.tsx` (replace the existing inline SVG placeholder)
3. Create `src/components/SplineAbout.tsx` with desktop gate + `next/dynamic` import
4. Edit `src/components/AboutSection.tsx` to import `SplineAbout` and replace placeholder div
5. Build Spline scene (`spline.design` — out of scope for code work but required for the `sceneUrl`)
6. Wire the `onLoad` + ScrollTrigger greeting animation, confirming event/object names from the Spline scene

**Spline scene is the long pole** for Step 3. The code integration (steps 1-4) can be completed and merged independently as scaffolding, then the scene URL and event name are filled in when the scene is ready.

---

## RSC / Client Boundary Summary

| Component | Boundary | Reason |
|-----------|----------|--------|
| `AboutSection.tsx` | Server (unchanged) | Uses `useTranslations` (server-safe), no browser APIs |
| `SplineAbout.tsx` (new) | `'use client'` | `useState`, `useEffect` for matchMedia, `useGSAP` for ScrollTrigger |
| `StaticIllustrationFallback.tsx` (new) | Server-safe | Pure presentational, no hooks |
| `mdx-components.tsx` additions | Server-safe | Pure presentational overrides for `pre`/`code` |
| `Callout.tsx` (optional, new) | Server-safe unless animated | Pure styling; add `'use client'` only if Framer entrance is added |
| `next.config.mjs` change | Build-time only | rehype-pretty-code runs at Webpack compile time |

---

## Performance Implications

### Spline bundle impact

`@splinetool/runtime` is approximately 300-500KB gzipped. With `next/dynamic + ssr: false`, this bundle is:
- Not included in the initial page HTML
- Not parsed on mobile (conditional render prevents mount)
- Lazy-fetched on desktop only, after the main page JS hydrates

The desktop Lighthouse score will take a hit from the Spline bundle. Monitor after integration. If it drops below 85, consider further deferring the dynamic import until after scroll (using `IntersectionObserver` to trigger the `import()` call itself, not just the animation).

### rehype-pretty-code: zero runtime impact

All syntax highlighting is done at build time. The output is static HTML with `<span>` elements and inline CSS variables. No JavaScript is shipped for syntax highlighting. The only cost is a slightly larger HTML payload for pages with code blocks — negligible.

### "What I'd do differently" section: zero impact

Pure markdown content. No performance consideration.

---

## Sources

- Direct codebase inspection (all source files listed above read at research time) — HIGH confidence
- `next.config.mjs` plugin injection pattern for `@next/mdx` — HIGH confidence (official @next/mdx API, verified against existing empty config in repo)
- `next/dynamic` with `ssr: false` conditional render pattern — HIGH confidence (established pattern, same as `ShaderCanvasWrapper` already in repo)
- GSAP `useGSAP` + `ScrollTrigger.create({ once: true })` — HIGH confidence (existing `PhaseTimeline.tsx` shows the `useGSAP` + ScrollTrigger pattern already working in repo)
- `@splinetool/react-spline/next` subpath for App Router — MEDIUM confidence (documented in Spline's Next.js guide; verify exact import path matches installed package version before using)
- `rehype-pretty-code` config options (`theme`, `keepBackground`) — MEDIUM confidence (training data + documented API; verify against current `rehype-pretty-code` README at install time, as options have shifted between versions)
