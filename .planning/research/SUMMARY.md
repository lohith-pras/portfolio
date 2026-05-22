# Research Summary: v2.0 Depth + 3D

**Synthesized:** 2026-05-22
**Milestone:** v2.0 — Spline 3D character + project content depth
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## Stack Additions

```bash
npm install @splinetool/react-spline@^4.1.0 @splinetool/runtime@^1.12.95 rehype-pretty-code@^0.14.3 shiki@^4.1.0 remark-gfm@^4.0.0
npm uninstall next-mdx-remote
```

`next-mdx-remote` is in `package.json` but unused (CLAUDE.md blacklists it). Remove before MDX work begins — if accidentally used, `rehype-pretty-code` plugins in `next.config.mjs` will not run (silent failure, no error).

No copy-button library needed — native `navigator.clipboard` in a 20-line `CopyButton.tsx` client component.

---

## Feature Table Stakes

### ABOUT-V2-01/02/03 — Spline 3D Character

- Desktop-only conditional render (≥768px via `useState + useEffect + matchMedia`) — NOT CSS `hidden` (CLAUDE.md explicit constraint)
- Lazy-loaded via `next/dynamic({ ssr: false })` — two-layer pattern (wrapper + canvas), identical to existing `ShaderCanvasWrapper.tsx`
- Scroll-triggered greeting: `useGSAP + ScrollTrigger.create({ once: true, start: "top 80%" })`
- `onLoad` captures `SplineApp` instance → `splineApp.emitEvent('mouseDown', 'CharacterName')` triggers greeting
- Must call `requestAnimationFrame(() => ScrollTrigger.refresh())` inside `onLoad` to recalibrate all downstream scroll triggers (About height changes on mount)
- **Hard blocker:** Scene must be designed in spline.design before event names are known. Scaffold code with placeholder URL + commented `emitEvent`.

### PROJ-V2-01 — "What I'd Do Differently"

- 3–5 specific technical bullets per project (first-person, matter-of-fact, not apologetic)
- 150–350 words, placed at end of deep-dive before any navigation
- Visual: `border-l-2 border-accent` + subtle `bg-zinc-900/50`, same body font size
- Pure MDX content + optional component override — no new packages

### PROJ-V2-02 — Code Snippets + Repo Link

- `rehype-pretty-code` with single dark theme (e.g. `'vesper'` — warm amber, no blue, matches palette)
- Language labels via `data-language` attribute + CSS `::before`
- Repo link: `repo` field in MDX frontmatter, rendered in page header
- Apply to all 6 MDX files (3 EN + 3 DE) in one pass

---

## Architecture Integration Points

| Feature | Files Modified | New Files |
|---------|---------------|-----------|
| Spline 3D | `AboutSection.tsx` (add SplineAbout + conditional render) | `SplineAbout.tsx`, `StaticIllustrationFallback.tsx` |
| rehype-pretty-code | `next.config.mjs` (add rehypePlugins), `mdx-components.tsx` (pre/code overrides) | `CopyButton.tsx` (optional) |
| MDX content | All 6 `src/content/projects/{en,de}/{slug}.mdx` | — |

`AboutSection.tsx` is a server component — do NOT add `'use client'` to it. Create `SplineAbout.tsx` as the isolated `'use client'` island.

---

## Top Pitfalls

| # | Pitfall | Prevention |
|---|---------|------------|
| 1 | **Spline runtime enters initial bundle** — Lighthouse mobile drops ~20pts | Mirror `ShaderCanvasWrapper` two-layer `dynamic()` pattern exactly; verify with `next build` First Load JS diff |
| 2 | **ScrollTrigger misfires after Spline loads** — About section height changes | `requestAnimationFrame(() => ScrollTrigger.refresh())` inside `onLoad` |
| 3 | **`prose-invert` + Shiki dual theme = invisible code blocks** | Single dark theme string only; never `{ light, dark }` object; add `keepBackground: false` |
| 4 | **`"use client"` boundary error on copy button** | Isolate to separate `CopyButton.tsx`; never inline in `mdx-components.tsx` |
| 5 | **DE MDX missing new sections** — EN + DE drift | Always commit EN + DE stubs together in same commit |

---

## Recommended Build Order

1. **Package setup + MDX pipeline** — Install/remove packages, wire `rehype-pretty-code` in `next.config.mjs`, add overrides to `mdx-components.tsx`. Smoke test: add a code block to one MDX file and verify highlighting.
2. **MDX content authoring** — Add reflection sections + code blocks to all 6 MDX files (EN + DE) in one pass. Requires phase 1 so code blocks render during authoring.
3. **SplineAbout component shell** — Build `SplineAbout.tsx` + `StaticIllustrationFallback.tsx` with placeholder scene URL. Decouples code from Spline character design timeline.
4. **Spline scene wiring** — Wire published scene URL + event names once character is built. Validate greeting, `ScrollTrigger.refresh()`, Lighthouse mobile ≥ 85.

---

## Implementation Verification Flags

- Read `node_modules/@next/mdx/readme.md` — confirm exact `options` key for rehype plugins before writing config
- `console.log(Object.keys(splineApp))` spike in `onLoad` — confirm `emitEvent` exists in installed version
- Measure Lighthouse mobile after Spline integration (must stay ≥ 85)
- Spline scene file size target: < 2 MB for acceptable lazy-load at scroll trigger
