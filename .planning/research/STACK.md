# Technology Stack

**Project:** LTP Portfolio v2
**Last updated:** 2026-05-22 (v2.0 milestone research pass)
**Overall confidence:** HIGH for new additions (npm-verified); MEDIUM for integration patterns (training knowledge + codebase inspection)

---

## v2.0 Additions Only

This section covers only what's NEW for the v2.0 milestone. The v1.0 base stack (Next.js 15 + React 19 + TypeScript + Tailwind v3 + GSAP + Framer Motion + next-intl + @next/mdx) is validated and installed.

---

### What's Actually Installed vs. What Was Planned

Inspection of the live `package.json` revealed several gaps and one conflict versus the v1 STACK.md plan:

| Package | Plan | Reality | Action |
|---------|------|---------|--------|
| `@splinetool/react-spline` | `^4.x` | NOT installed | Install — About section is a placeholder SVG |
| `@splinetool/runtime` | match react-spline | NOT installed | Install as peer dep |
| `rehype-pretty-code` | `^0.14.x` | NOT installed | Install for v2.0 code highlighting |
| `shiki` | `^1.x` | NOT installed | Install as peer dep for rehype-pretty-code |
| `next-mdx-remote` | NOT recommended (see CLAUDE.md "What NOT To Use") | Installed at `^6.0.0` | Remove — conflicts with @next/mdx build-time approach |
| Tailwind | v4 preferred, v3.4 fallback | v3.4.17 installed | No change needed — v3 is working, don't upgrade mid-milestone |

---

### New Package Additions for v2.0

#### Feature: Spline 3D Character (ABOUT-V2-01/02/03)

| Package | Version to Install | Purpose | Why This Version |
|---------|-------------------|---------|-----------------|
| `@splinetool/react-spline` | `^4.1.0` | React component wrapping the Spline runtime | 4.1.0 is current (npm-verified). Exports both `.` (default) and `./next` subpath — the `/next` subpath is **required** for App Router usage, avoids RSC crash. |
| `@splinetool/runtime` | `^1.12.95` | The actual WebGL runtime (peer dep of react-spline) | Pin explicitly — auto-install from peer range can pull minor updates that break scene compatibility. |

**No upgrade needed** — the CLAUDE.md STACK.md already documented `^4.x`. This is a first install, not an upgrade.

**Spline greeting animation API (v4.1.0):** The animation trigger mechanism has not changed in recent versions. The `onLoad` callback returns a `Spline` application instance. Use `spline.emitEvent(eventType, objectNameOrId)` to fire named events, or `spline.setVariable(name, value)` to set scene variables. For the scroll-triggered greeting, the recommended pattern is:

```tsx
"use client"
import { useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import type { SPEObject, Application } from "@splinetool/runtime"

const Spline = dynamic(
  () => import("@splinetool/react-spline/next"),
  { ssr: false, loading: () => <div className="aspect-square animate-pulse bg-white/5 rounded-2xl" /> }
)

export function SplineCharacter() {
  const splineRef = useRef<Application | null>(null)
  const hasGreeted = useRef(false)

  const onLoad = useCallback((app: Application) => {
    splineRef.current = app
    // Don't auto-play — wait for scroll trigger
  }, [])

  // Wire to IntersectionObserver or GSAP ScrollTrigger in parent
  const triggerGreeting = useCallback(() => {
    if (splineRef.current && !hasGreeted.current) {
      hasGreeted.current = true
      splineRef.current.emitEvent("mouseDown", "Character") // name matches your Spline scene object
    }
  }, [])

  return <Spline scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode" onLoad={onLoad} />
}
```

The `hasGreeted` ref prevents the animation from re-firing on scroll-back. Wire `triggerGreeting` from the parent `AboutSection` via an IntersectionObserver (simpler, no GSAP dep needed for a one-shot trigger) or GSAP ScrollTrigger `onEnter` callback.

**Confidence on Spline API:** MEDIUM — `emitEvent` and `onLoad` are documented in the official Spline React guide and have been stable across 3.x → 4.x. However, the exact `Application` type import path from `@splinetool/runtime` should be verified against the installed package's type exports before coding.

---

#### Feature: Code Syntax Highlighting (PROJ-V2-02)

| Package | Version to Install | Purpose | Why This Version |
|---------|-------------------|---------|-----------------|
| `rehype-pretty-code` | `^0.14.3` | Build-time syntax highlighting for MDX `code` blocks via Shiki | 0.14.3 is current (npm-verified). Works with `@next/mdx` as a rehype plugin in `next.config.mjs`. Zero runtime cost — all highlighting happens at build time. |
| `shiki` | `^4.1.0` | Shiki is now a peer dep of `rehype-pretty-code` ≥0.13 — must be installed alongside it | 4.1.0 is current (npm-verified). Shiki v4 is the "unified" release that merged `shikiji` — it has all bundled languages and themes. |

**Important:** `rehype-pretty-code` ≥0.13 changed its peer dependency from bundling Shiki internally to requiring `shiki` as an explicit peer dep. This means you must install both packages. Versions 0.12.x and below included Shiki internally — that pattern is outdated.

**Integration with `@next/mdx` (already installed at `^16.2.6`):**

```js
// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin'
import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: "github-dark",         // or "one-dark-pro", "tokyo-night", "catppuccin-mocha"
        keepBackground: false,        // use CSS for bg — matches dark palette better
        defaultLang: "typescript",    // fallback when no lang specified
      }]
    ],
  },
})

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' }
    return config
  },
}

export default withNextIntl(withMDX(nextConfig))
```

**Theme recommendation for this project:** Use `"github-dark"` or `"tokyo-night"` — both have warm accent tones that won't fight the `#FF4500` / `#C0001A` palette. Avoid themes with blue/purple primary accents.

**MDX usage in `.mdx` files:**

````mdx
```typescript title="channel-quality.ts" {3-5}
// The key insight: sliding window correlation
function computeCorrelation(window: Float32Array): number {
  const mean = window.reduce((a, b) => a + b) / window.length
  const variance = window.reduce((a, x) => a + (x - mean) ** 2, 0)
  return Math.sqrt(variance / window.length)
}
```
````

rehype-pretty-code adds `data-line` attributes to each line and wraps highlighted ranges in `<mark>` elements. Style them in your CSS/Tailwind global stylesheet.

**Line highlight CSS (add to `globals.css`):**

```css
/* Code block styling for rehype-pretty-code */
[data-rehype-pretty-code-figure] pre {
  @apply overflow-x-auto rounded-lg p-4 text-sm;
}

[data-highlighted-line] {
  @apply bg-accent/10 -mx-4 px-4 border-l-2 border-accent;
}

[data-rehype-pretty-code-title] {
  @apply font-mono text-xs text-white/60 bg-white/5 px-4 py-2 rounded-t-lg border-b border-white/10;
}
```

**Copy button:** rehype-pretty-code does NOT provide a copy button. Options:
1. **No package needed — wire it in `mdx-components.tsx`:** Override the `pre` element with a client component that wraps the pre and adds a button calling `navigator.clipboard.writeText`. This is ~20 lines of code, no package needed.
2. **`rehype-pretty-code` + custom `pre` component (recommended for this project):** The `pre` element receives `data-language` and `raw` props from rehype-pretty-code — use these in your override component to get the code text for copying without traversing the DOM.

```tsx
// mdx-components.tsx — add a CopyButton wrapper for pre elements
"use client"
import { useState } from "react"

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="absolute top-3 right-3 text-xs text-white/40 hover:text-white transition-colors"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

// In useMDXComponents:
pre: ({ children, ...props }) => (
  <div className="relative group">
    <pre {...props}>{children}</pre>
    <CopyButton code={(props as any)["raw"] ?? ""} />
  </div>
)
```

**Confidence on rehype-pretty-code:** HIGH — version npm-verified, `@next/mdx` rehype plugin integration is the documented approach, Shiki v4 as peer dep is confirmed from 0.13+ release notes.

---

### Package to Remove

| Package | Currently Installed | Why Remove |
|---------|--------------------|-----------:|
| `next-mdx-remote` | `^6.0.0` | CLAUDE.md explicitly lists this as "What NOT To Use" — it's for remote/CMS MDX, adds client-side complexity, and conflicts with the build-time `@next/mdx` approach already in use. The existing project pages at `src/app/[locale]/projects/[slug]/page.tsx` use `@next/mdx` dynamic import correctly. `next-mdx-remote` is not imported anywhere — it's an unused dep that should be cleaned up. |

---

### No Other New Packages Needed

| Feature | Package needed? | Reason |
|---------|----------------|--------|
| "What I'd do differently" sections (PROJ-V2-01) | No | Pure MDX content additions — new heading + prose in existing `.mdx` files. No new package. |
| GitHub repo links on project pages | No | Standard anchor tags in MDX. Use the existing `mdx-components.tsx` `a` override or Tailwind prose styles. |
| Desktop-only Spline rendering | No | Use a custom `useIsDesktop` hook (10 lines, uses `window.matchMedia`) — not a package. |
| IntersectionObserver for greeting trigger | No | Native browser API, no polyfill needed for the target audience (modern browsers). |

---

## Verified Version Summary (npm-verified 2026-05-22)

| Package | Current in package.json | Install / Change To | Status |
|---------|------------------------|---------------------|--------|
| `@splinetool/react-spline` | not installed | `^4.1.0` | Install |
| `@splinetool/runtime` | not installed | `^1.12.95` | Install |
| `rehype-pretty-code` | not installed | `^0.14.3` | Install |
| `shiki` | not installed | `^4.1.0` | Install |
| `next-mdx-remote` | `^6.0.0` | remove | Remove |
| `remark-gfm` | not installed | `^4.0.0` | Install (needed for MDX tables in project pages) |

```bash
# Install new packages
npm install @splinetool/react-spline@^4.1.0 @splinetool/runtime@^1.12.95 rehype-pretty-code@^0.14.3 shiki@^4.1.0 remark-gfm

# Remove the incorrect package
npm uninstall next-mdx-remote
```

---

## Integration Gotchas for v2.0

1. **`@splinetool/react-spline` import path:** Import from `@splinetool/react-spline/next` (not the root). The root import crashes in RSC. The `/next` subpath is confirmed present in the package's `exports` field (npm-verified).

2. **Spline + `dynamic({ ssr: false })` caller must be `"use client"`:** `dynamic` with `ssr: false` cannot be called from an RSC. The `AboutSection.tsx` is currently a server component (no `"use client"` directive). You'll need to either add `"use client"` to AboutSection or extract a `SplineWrapper` client component that AboutSection imports.

3. **rehype-pretty-code + `@next/mdx` plugin order:** In `next.config.mjs`, `rehypePlugins` run after remark plugins. If you add `rehype-pretty-code` and a second rehype plugin (unlikely here), order them: syntax transform first, then any post-processors.

4. **rehype-pretty-code `keepBackground: false`:** Recommended for this project — the default adds inline `background-color` styles that override your Tailwind dark theme. Set to `false` and control background via CSS.

5. **Shiki v4 breaking change from v1.x:** Shiki v4 merged the `shikiji` project and changed some theme/language IDs. Since this is a fresh install (not an upgrade), this doesn't apply. But if you see "unknown theme" errors, verify theme names against Shiki v4's bundled theme list (e.g. `"github-dark"`, `"tokyo-night"`, `"one-dark-pro"` are all valid).

6. **Spline scene URL before it's built:** The Spline scene doesn't exist yet (per PROJECT.md: "not yet built"). The `SplineCharacter` component needs a placeholder URL during development — use a known public Spline demo URL or conditionally render a skeleton. Don't block the component implementation on the scene being ready.

7. **`remark-gfm` with `@next/mdx` ≥16:** Pass it in the `options.remarkPlugins` array in `next.config.mjs`, not as a top-level option. The `@next/mdx` API changed how plugins are passed — see Integration Patterns above for the correct shape.

---

## What NOT to Add (v2.0 Specific)

| Don't add | Why | What to do instead |
|-----------|-----|-------------------|
| `react-syntax-highlighter` | Runtime highlighting, large bundle, redundant with rehype-pretty-code | `rehype-pretty-code` (build-time) |
| `prism-react-renderer` | Same problem — runtime, bundle cost | `rehype-pretty-code` |
| `@uiw/react-codemirror` or similar editor components | These are editors, not static highlighters — way overkill | rehype-pretty-code with custom pre override |
| `clipboard` npm package | `navigator.clipboard` is available in all modern browsers — no polyfill needed | Native API in the CopyButton component |
| `react-intersection-observer` | Adds a dep for something the native IntersectionObserver handles in 10 lines | Native `IntersectionObserver` in a `useEffect` |
| `@splinetool/react-spline` default (root) import in server context | Crashes with `window is not defined` | Always use `/next` subpath |
| Upgrade Tailwind to v4 during this milestone | Risk vs reward: Tailwind v3 is working; upgrading mid-milestone to chase v4 adds config migration cost | Keep v3.4.17 for this milestone, upgrade in a dedicated refactor phase |

---

## Confidence Notes

| Area | Confidence | Reason |
|------|------------|--------|
| `@splinetool/react-spline` version (4.1.0) | HIGH | Verified via `npm view @splinetool/react-spline version` |
| `@splinetool/runtime` version (1.12.95) | HIGH | Verified via `npm view @splinetool/runtime version` |
| `/next` subpath export exists on react-spline | HIGH | Verified via `npm view @splinetool/react-spline --json` exports field |
| Spline `onLoad` + `emitEvent` API | MEDIUM | Documented in official Spline React guide; stable across 3.x→4.x but not re-verified against 4.1.0 changelog |
| `rehype-pretty-code` version (0.14.3) | HIGH | Verified via `npm view rehype-pretty-code version` |
| `shiki` version (4.1.0) | HIGH | Verified via `npm view shiki version` |
| rehype-pretty-code requires explicit shiki peer dep | HIGH | This changed at 0.13.x — current docs and changelog confirm it |
| `next-mdx-remote` is unused/should be removed | HIGH | Not imported anywhere in codebase; CLAUDE.md explicitly lists it as "What NOT To Use" |
| Copy button via `(props as any)["raw"]` | MEDIUM | rehype-pretty-code passes raw code as a prop to the pre element in recent versions; verify against installed version's README |

---

## Sources

Verified against npm registry (2026-05-22):
- `npm view @splinetool/react-spline version` → 4.1.0
- `npm view @splinetool/runtime version` → 1.12.95
- `npm view rehype-pretty-code version` → 0.14.3
- `npm view shiki version` → 4.1.0
- `npm view @splinetool/react-spline --json` → exports: ['.', './next'], peerDeps: next >=14.2.0

Codebase inspection:
- `/Users/lohith/Projects/Personal/portfolio_v2/package.json` — installed packages and versions
- `/Users/lohith/Projects/Personal/portfolio_v2/src/components/AboutSection.tsx` — confirmed placeholder SVG, no Spline yet
- `/Users/lohith/Projects/Personal/portfolio_v2/src/app/[locale]/projects/[slug]/page.tsx` — confirmed @next/mdx dynamic import pattern in use
- `/Users/lohith/Projects/Personal/portfolio_v2/mdx-components.tsx` — confirmed no code block override yet
- `/Users/lohith/Projects/Personal/portfolio_v2/next.config.mjs` — confirmed withMDX + withNextIntl composition, no rehype plugins yet
