# Domain Pitfalls — v2.0 Feature Additions (Spline 3D + MDX Depth + rehype-pretty-code)

**Project:** LTP Portfolio v2 — Milestone v2.0
**Researched:** 2026-05-22
**Scope:** Pitfalls specific to adding Spline 3D character, "What I'd do differently" MDX sections, and `rehype-pretty-code` to the *existing validated* Next.js 15 / React 19 / GSAP / next-intl codebase.

> **Context:** All v1 phases (1–10) are complete and validated. The codebase is running `@splinetool/react-spline ^4.x` installed but no scene wired yet. `@next/mdx` is configured in `next.config.mjs` with **no rehype/remark plugins currently**. MDX content lives at `src/content/projects/{locale}/*.mdx` and is imported via dynamic `import()` in the page component. `ShaderCanvasWrapper` / `ShaderCanvas` are live with an active GSAP ScrollTrigger. This document focuses only on pitfalls introduced by the v2.0 additions — not pre-existing general portfolio risks (those are in the earlier PITFALLS.md).

> **Research conditions:** WebSearch, WebFetch, ctx7 CLI, and Bash were all restricted in this run. All findings below are drawn from the codebase inspection (actual files read) and documented library behavior in training data. Confidence levels are assigned per the standard protocol: HIGH = well-documented official patterns backed by multiple sources and the codebase confirms the setup is in place; MEDIUM = commonly reported behavior that is consistent across sources; LOW = reasonable inference that should be verified during implementation.

---

## Critical Pitfalls (ship-blockers)

### Pitfall SP-1: Spline runtime (~400–600 kB) enters the main bundle if the `dynamic()` wrapper is on the wrong component boundary

**Confidence:** HIGH

**What goes wrong:** The `@splinetool/runtime` package is the actual WebGL engine. It is 400–600 kB parsed JS. The bundle enters the page's initial payload if `next/dynamic(..., { ssr: false })` wraps the wrong layer. Specifically: if the component that `import`s from `@splinetool/react-spline` is a server component, or if `dynamic()` wraps a component that *re-exports* Spline rather than the one that *imports* it, Next.js still bundles the runtime in the server pass.

**Why it happens with this codebase:** The existing `ShaderCanvasWrapper.tsx` pattern (a `"use client"` component that holds the `dynamic()` call wrapping `ShaderCanvas`) is the correct two-layer approach — it works because `ShaderCanvas` does the actual import. The same pattern must be followed for Spline: the `dynamic()` call must be in a component that is itself a **named dynamic boundary**, not inside a server component that imports a client component that happens to use `dynamic()`.

**Lighthouse impact:** Spline runtime added to initial payload: TBT +800–1500 ms on mobile, TTI +1.5–2 s. This single mistake can drop Lighthouse mobile from ~85 to ~65.

**Prevention:**
- Replicate the exact `ShaderCanvasWrapper` pattern:
  ```tsx
  // SplineWrapper.tsx  — "use client"
  import dynamic from 'next/dynamic'
  const SplineScene = dynamic(
    () => import('./SplineScene').then(m => m.SplineScene),
    { ssr: false, loading: () => <SplinePlaceholder /> }
  )
  export function SplineWrapper() { return <SplineScene /> }
  ```
  ```tsx
  // SplineScene.tsx — "use client"
  import Spline from '@splinetool/react-spline'
  // ...actual Spline usage here
  ```
- Gate the render on `window.matchMedia('(min-width: 768px)')` — never conditionally *hide* via CSS. Only conditionally *render*. This prevents the Spline chunk from loading on mobile at all (matches ABOUT-V2-02 requirement).
- Verify after adding: run `next build` and check the First Load JS for the `/en` route. It should not increase by more than ~2 kB (just the wrapper). The runtime chunk should only appear in the lazy-loaded Spline chunk.

**Detection:** `next build` output — compare "First Load JS" before and after adding the wrapper. If it increases by >50 kB, the dynamic boundary is wrong. Open Network tab in DevTools (slow 3G throttle) and confirm the `@splinetool/runtime` chunk loads *after* initial paint, not during.

**Phase:** ABOUT-V2-01/02 (before writing any scene code).

---

### Pitfall SP-2: Spline scene + `ShaderCanvas` compete for the same WebGL context budget — gradient turns black after About section loads

**Confidence:** MEDIUM

**What goes wrong:** The existing `ShaderCanvas` already creates a WebGL context on page load. When the About section scrolls into view and Spline creates its own context, the total climbs. Browsers cap concurrent WebGL contexts at 8–16 (Chrome: 16, Safari: 8). This codebase also has `@react-three/fiber` (from `@shadergradient/react`) running R3F's own renderer, so the actual context count per page visit is already 1 (ShaderCanvas R3F) + any other R3F usage. Adding Spline's runtime creates a second independent context.

**Why it matters here specifically:** The existing `ShaderCanvas` already has a visibility-based GPU release: it sets `display: none` when the hero fades. But it does *not* explicitly destroy the WebGL context. Spline also does not destroy its context on unmount by default. After several SPA navigations (Home → /life → /projects/x → Home), the context count can exceed the limit. The shader gradient is the first to lose its context because it was created first.

**Prevention:**
- Keep the existing `ShaderCanvas` GPU-release logic (it already sets `display: none` via ScrollTrigger). This is enough to pause rendering but does not free the context.
- For Spline: wrap the mount in an `IntersectionObserver` gate so the Spline WebGL context is not created until the About section is at least 20% in view. This defers the context creation past the hero-paint critical path.
- Pattern for the IntersectionObserver gate inside `SplineScene.tsx`:
  ```tsx
  const [shouldMount, setShouldMount] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setShouldMount(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])
  // render <Spline ... /> only when shouldMount === true
  ```
- Do NOT use `gsap.matchMedia()` alone for this gate — it handles viewport width (mobile/desktop split) but not scroll position. You need both: `matchMedia` for the 768 px width gate + `IntersectionObserver` for the scroll-position gate.

**Detection:** Open DevTools console, navigate Home → /life → /projects/x → Home four times rapidly. Watch for `WebGL: CONTEXT_LOST_WEBGL` or "Too many active WebGL contexts" warnings. Visually: shader gradient on hero renders solid black or white.

**Phase:** ABOUT-V2-01/02.

---

### Pitfall SP-3: React 19 Strict Mode double-mount fires Spline's `onLoad` callback twice, creating two animation subscriptions

**Confidence:** MEDIUM

**What goes wrong:** In development (Strict Mode on), React 19 mounts → unmounts → remounts every client component. Spline's `onLoad` prop receives the `splineApp` instance. If a `useEffect` or direct callback sets up GSAP ScrollTrigger bindings that drive Spline's animation state (via `splineApp.emitEvent(...)` or `splineApp.setVariable(...)`), the double-mount creates two GSAP ScrollTriggers subscribed to the same Spline instance. In production this is fine (single mount). In dev it causes the greeting animation to fire twice and the ScrollTrigger to stack.

**Why it matters here specifically:** ABOUT-V2-01 requires "greeting animation triggers once on section scroll-in via IntersectionObserver, returns to idle loop." The word "once" is the trigger — you need to guard against double-fire.

**Prevention:**
- Store the spline app instance in a `useRef`, not `useState`. The ref survives the unmount/remount cycle in dev (it does not reset between mounts).
- Add a `hasInitialized` ref guard:
  ```tsx
  const splineRef = useRef<Application | null>(null)
  const hasInit = useRef(false)

  const onLoad = useCallback((app: Application) => {
    splineRef.current = app
    if (hasInit.current) return   // guard against StrictMode double-fire
    hasInit.current = true
    // set up IntersectionObserver → emitEvent here
  }, [])
  ```
- For GSAP integration (driving Spline via ScrollTrigger), do the GSAP setup inside `useGSAP` with `{ scope: containerRef }` — `useGSAP` from `@gsap/react` already handles cleanup on unmount, so the ScrollTrigger is destroyed on the first unmount and recreated clean on the second mount.

**Detection:** In dev mode, console.log inside `onLoad`. If it fires twice, the guard is missing. If it fires once, you're safe.

**Phase:** ABOUT-V2-01.

---

### Pitfall SP-4: GSAP ScrollTrigger + Spline's internal RAF loop fight for scroll events on the About section

**Confidence:** MEDIUM

**What goes wrong:** Spline's runtime runs its own `requestAnimationFrame` loop and listens to pointer/scroll events for interactive scenes. If the Spline scene has any camera-parallax or mouse-follow behavior configured in `spline.design`, both the scene's event listeners and the GSAP ScrollTrigger that drives the greeting animation will process `scroll` events. The result is the camera drifting while GSAP expects it to be stationary, or the `onUpdate` progress values conflicting with the scene state.

**Why it matters here specifically:** The Spline character is "greeting animation triggers once on section scroll-in." If the scene has any default camera interactivity (common default in new Spline scenes), it will override GSAP's control.

**Prevention:**
- In the Spline editor: explicitly **disable scroll**, **disable orbit**, and **disable zoom** on the camera in the scene settings before exporting. Only keep the named states that represent "idle" and "greeting" — the scene should not respond to any user input autonomously.
- GSAP controls the *when* (via ScrollTrigger / IntersectionObserver). Spline controls the *what* (pre-authored animation states). These are separate channels — GSAP does not scrub Spline's timeline directly; it only fires Spline's named events.
- GSAP pattern: `gsap.matchMedia({ '(min-width: 768px)': () => ScrollTrigger.create({ trigger: '#about', ... onEnter: () => splineRef.current?.emitEvent('keyUp', 'Character') }) })`
- GSAP does NOT write `transform` to the Spline canvas element. GSAP and Spline own different things. If you want to animate the *container* (e.g., fade in the Spline canvas on enter), use GSAP on the `<div>` wrapping `<Spline>`, not on the canvas itself.

**Detection:** Load the page in dev, scroll slowly into About — if the 3D character rotates/drifts based on pointer position *before* you've done anything, scroll interactivity is on in the Spline scene. Disable it in the editor.

**Phase:** ABOUT-V2-01 (scene design phase, before wiring the React component).

---

### Pitfall SP-5: CORS error loading `.splinecode` file from `prod.spline.design` when served from Vercel

**Confidence:** MEDIUM

**What goes wrong:** Spline scenes are served as `.splinecode` files from `prod.spline.design`. This is a cross-origin fetch. In most cases it Just Works because `prod.spline.design` includes CORS headers. The gotcha is when: (a) the scene URL is copied as a draft URL (not the published URL) — draft URLs do not have `Access-Control-Allow-Origin: *`, they require authentication; or (b) a corporate network or privacy browser extension blocks the external fetch.

**Why it matters here specifically:** This is a portfolio site. The Spline scene must load on the first try for any recruiter opening it. Draft URLs are a common mistake during development — they work on the developer's machine (Spline auth cookie present) and fail for everyone else.

**Prevention:**
- Always use the **published export URL** from Spline (Scene → Export → "Spline Viewer" or "Public Link"). Published URLs always have CORS headers.
- Verify the URL in an incognito window before wiring it into the component. If it 404s or returns a 401 in incognito, it's a draft URL.
- Optional: self-host the `.splinecode` file in `/public/scenes/character.splinecode` and serve it from the same origin. This eliminates CORS entirely and gives control over caching headers. The downside is file size (~5–20 MB for complex scenes) — set an explicit `Cache-Control: public, max-age=31536000` via Vercel's `headers()` config to amortize the cost.
- If self-hosting: add to `next.config.mjs`:
  ```js
  headers: async () => [{ source: '/scenes/:file', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }]
  ```

**Detection:** Open Network tab in an incognito browser (no Spline auth cookie). Filter by the `.splinecode` request. If it returns 401 or a CORS error, the URL is wrong. Check the "Access-Control-Allow-Origin" response header — it must be `*` or the portfolio domain.

**Phase:** ABOUT-V2-01 (scene publishing, before final integration).

---

### Pitfall SP-6: Spline `@splinetool/react-spline` version drift between installed package and the `@splinetool/runtime` peer — `emitEvent` API removed or renamed

**Confidence:** MEDIUM

**What goes wrong:** The Spline event API (`spline.emitEvent(eventName, objectName)`) changed between major versions of `@splinetool/runtime`. In older versions it was `spline.emitEvent('mouseHover', 'Name')`. In newer versions `emitEvent` still exists but the event name strings changed (e.g., `'keyDown'` instead of `'mouseDown'` for animation state triggers). If `@splinetool/react-spline` and `@splinetool/runtime` diverge in version (e.g., `react-spline` 4.x expects `runtime` 4.x, but npm hoisted an older `runtime` 3.x from a lockfile), the `onLoad` callback receives an `Application` instance with the old API and `emitEvent` calls silently do nothing.

**Why it matters here specifically:** The current `package.json` lists `@splinetool/react-spline` but not `@splinetool/runtime` pinned explicitly. The runtime is auto-installed as a peer dep. If the lockfile has `runtime@0.9.x` from a prior install, it may not match the current `react-spline@4.x` expectation.

**Prevention:**
- Explicitly add `@splinetool/runtime` to `dependencies` in `package.json` and pin it to the same major as `react-spline`. Check the react-spline README for the required peer range.
- After install, verify in the browser console: `window.__splineRuntime` or inspect the `Application` instance in `onLoad` — log `Object.keys(app)` to see the available methods before assuming `emitEvent` exists.
- Read the `CHANGELOG.md` in the installed `node_modules/@splinetool/react-spline/` (or the GitHub releases page) to find the current event API before wiring any animation triggers.
- If `emitEvent` is not available: use `spline.setVariable(key, value)` instead — this is the more stable alternative for triggering named animation states.

**Detection:** Wire `onLoad={(app) => console.log(Object.keys(app))}` first. Confirm the methods you intend to call exist before the main implementation.

**Phase:** ABOUT-V2-01 (spike / proof-of-concept before building the full component).

---

### Pitfall SP-7: Spline canvas creates a hydration mismatch because its placeholder div has no stable dimensions

**Confidence:** MEDIUM

**What goes wrong:** The existing `AboutSection.tsx` renders a placeholder `<div>` with `aspect-square` and `max-w-[400px]`. When Spline mounts (client-side only), it creates a `<canvas>` inside the same container. If the container's dimensions change between server render (aspect-square div) and the canvas insertion (canvas may set its own width/height attributes), React 19 hydration can warn about attribute mismatches. More importantly, if the canvas mount causes a reflow that shifts surrounding text, CLS is incurred.

**Why it matters here specifically:** The About section has a two-column grid where text is on the left and the illustration/canvas is on the right. A height change in the right column shifts the left text vertically — directly observable as a layout pop.

**Prevention:**
- The placeholder div that wraps `<SplineWrapper>` must have explicit CSS dimensions (not just `aspect-square` — `aspect-ratio` only works if one dimension is constrained):
  ```tsx
  <div className="w-full max-w-[400px] aspect-square relative overflow-hidden">
    <SplineWrapper />
  </div>
  ```
- Inside `SplineScene.tsx`, the `<Spline>` component must be sized to `100%` of its container:
  ```tsx
  <Spline scene="..." style={{ width: '100%', height: '100%' }} />
  ```
- The `loading` prop on `dynamic()` should return a placeholder that has **identical dimensions** to the canvas:
  ```tsx
  dynamic(/* ... */, { loading: () => <div className="w-full h-full bg-white/5 rounded-2xl" /> })
  ```
  This prevents a height change when the actual canvas replaces the skeleton.

**Detection:** Lighthouse "Avoid large layout shifts" (CLS > 0.1). Visually: About text jumps vertically when Spline finishes loading. In React DevTools, watch for hydration warnings in the About section tree.

**Phase:** ABOUT-V2-02.

---

## Critical Pitfalls — rehype-pretty-code

### Pitfall MDX-1: Adding `rehype-pretty-code` to `next.config.mjs` breaks the existing MDX build — `createMDX` API changed between `@next/mdx` 15 and 16

**Confidence:** HIGH

**What goes wrong:** The current `next.config.mjs` uses `createMDX({})` from `@next/mdx ^16.2.6` with no options. The correct way to pass rehype plugins to `@next/mdx` has changed between versions:
- In `@next/mdx ^13–14`: options passed via `createMDX({ options: { rehypePlugins: [...] } })`
- In `@next/mdx ^15`: same as above but some configs moved to the MDX loader directly
- In `@next/mdx ^16+` (current): the options object key may be `extension` not `options` in some variants — **verify against the installed version's README, not the Next.js docs which lag the package**

The failure mode is silent in dev (MDX files compile without error but `rehype-pretty-code` does not run) and only becomes visible when you check that code blocks have no syntax highlighting.

**Why it matters here specifically:** The current `next.config.mjs`:
```js
const withMDX = createMDX({
  // Add markdown plugins here, as desired
})
```
Adding rehype plugins looks like:
```js
const withMDX = createMDX({
  options: {
    rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark' }]],
  },
})
```
But confirm the exact key name (`options` vs the `@next/mdx` 16.x docs) before shipping — the comment in the file even says "as desired," which hints the slot is ready.

**Prevention:**
- Read `node_modules/@next/mdx/readme.md` or the package's `index.js` to see what the config object accepts in the installed version before writing any plugin config.
- Add a single remark plugin first (e.g., `remark-gfm`) and verify it works with a table in MDX before adding rehype plugins — this confirms the options key is correct.
- Test locally with `next build` (not just `next dev`) because the MDX loader runs differently in prod. A broken rehype plugin often manifests as a build error in prod but is silently ignored in dev.

**Detection:** Add a fenced code block to any MDX file and run `next build`. The rendered HTML should contain `<code class="..." data-language="...">` attributes from Shiki. If code blocks are plain `<pre><code>`, the plugin did not run.

**Phase:** PROJ-V2-02 (before writing any code snippet content in MDX files).

---

### Pitfall MDX-2: `rehype-pretty-code` and the existing `prose-invert` Tailwind class conflict — code block backgrounds become double-inverted or invisible

**Confidence:** MEDIUM

**What goes wrong:** The project renders MDX content inside:
```tsx
<article className="flex-1 prose prose-invert max-w-none">
  <Content />
</article>
```
`prose-invert` applies Tailwind Typography's dark-mode overrides, which set `--tw-prose-pre-bg` (code block background) to a semi-transparent dark color. `rehype-pretty-code` injects its own inline CSS variables for Shiki token colors. When both systems apply backgrounds, one overrides the other: you get either transparent code blocks (Tailwind wins over Shiki) or very dark-on-dark text (both apply simultaneously).

**Why it matters here specifically:** The design is dark-only (`#0A0A0A` background, no light mode toggle). The default Shiki themes (`github-dark`, `one-dark-pro`) have explicit dark backgrounds that conflict with `prose-invert`'s assumed dark background. The result is visible as a colored box inside the already-dark article — usually a slightly lighter dark box that looks unintentional.

**Prevention:**
- Use a Shiki theme that has a transparent or matching background. Candidates:
  - `"github-dark-default"` — neutral background close to `#0A0A0A`
  - Custom theme object: pass a Shiki `BundledTheme` or a custom JSON theme that sets `"editor.background": "transparent"` — this lets Tailwind Typography's `pre` background show through
  - The cleanest approach for a dark-only site: use `rehype-pretty-code`'s theme as `{ dark: 'github-dark' }` (it supports a theme object for dark/light) and override the pre background in CSS:
    ```css
    article.prose pre { background: #111 !important; }
    ```
- Also: `prose-invert` overrides `code` font color to white, but Shiki spans inject their own inline `color` — the inline color wins over the prose utility, which is actually correct behavior. Don't try to fight it with `!important` on token colors.
- Add to `globals.css` or the article component directly:
  ```css
  .prose pre { padding: 0 !important; } /* rehype-pretty-code wraps with its own padding */
  .prose pre > code { background: transparent !important; } /* prevent double background */
  ```

**Detection:** Add a code block with `\`\`\`ts`, run `next dev`, inspect the rendered `<pre>` in DevTools — check what `background-color` is applied. If it differs from the article background by more than a subtle contrast step, it needs override.

**Phase:** PROJ-V2-02 (during first code-block integration).

---

### Pitfall MDX-3: Copy button in code blocks requires `"use client"` — adding it to a server-rendered MDX article causes a hydration error

**Confidence:** HIGH

**What goes wrong:** `rehype-pretty-code` itself is build-time only and has no copy button. Copy button patterns from the community (e.g., the popular pattern where a `<CopyButton>` component is injected into the `<pre>` via a custom rehype plugin or via `mdx-components.tsx`) require client-side `onClick`. If the `<CopyButton>` component is not marked `"use client"`, or if it is used inside an RSC MDX render without a client island wrapper, React throws a hydration error about event handlers on server-rendered HTML.

**Why it matters here specifically:** The current `mdx-components.tsx` exports a `useMDXComponents` function with `h1`, `h2`, `p` overrides. If a `pre` or `code` override is added here with click handlers, and `mdx-components.tsx` is not marked `"use client"` (it currently is not), the build will fail or hydration will error.

**Prevention:**
- Either: skip the copy button for v2.0 (code quality and syntax highlighting land value without it — defer copy UX to v2.1)
- Or: implement the copy button as a separate `"use client"` component:
  ```tsx
  // components/CopyButton.tsx
  'use client'
  export function CopyButton({ text }: { text: string }) {
    return <button onClick={() => navigator.clipboard.writeText(text)}>Copy</button>
  }
  ```
  Then use a custom `pre` override in `mdx-components.tsx` that uses `<CopyButton>` — but `mdx-components.tsx` itself must **not** be marked `"use client"` (it is a module-level export read by the MDX compiler, not a component). Instead, the copy button is added via a **custom rehype plugin** that wraps `<pre>` with a client island.
- The simplest working pattern: use CSS `user-select: all` on code blocks so users can triple-click to select all. No JS required, no hydration risk.

**Detection:** Add a `pre` override with an `onClick` to `mdx-components.tsx` and run `next dev`. If you see "Event handlers cannot be passed to Client Component props" in the terminal, the boundary is wrong.

**Phase:** PROJ-V2-02 — decide before implementing. Default recommendation: no copy button for v2.0, add in a follow-up.

---

### Pitfall MDX-4: Dynamic `import()` of MDX files from `src/content/projects/{locale}/*.mdx` does not include `rehype-pretty-code` transforms — syntax highlighting is blank

**Confidence:** HIGH

**What goes wrong:** The current `projects/[slug]/page.tsx` uses:
```tsx
Content = (await import(`@/content/projects/${locale}/${slug}.mdx`)).default
```
This uses webpack's dynamic import with the `@next/mdx` loader. The MDX loader *does* apply the rehype plugins configured in `next.config.mjs` when it processes these files — **as long as `next.config.mjs` includes the correct `pageExtensions` and the `withMDX` wrapper**. The current config already has `pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx']` and `withMDX` wrapping `nextConfig`. This is the correct setup.

**However**, there is one failure mode: if rehype plugins are added as ESM-only modules (e.g., `rehype-pretty-code` uses ESM-only imports), and the config is `next.config.mjs` (already ESM), the `import` statement for the plugin must be a top-level `import`, not a `require`. Mixing `require()` and ESM in `next.config.mjs` breaks the webpack loader initialization.

**Prevention:**
- Use only top-level `import` statements in `next.config.mjs`. The current file already uses `import createNextIntlPlugin from 'next-intl/plugin'` and `import createMDX from '@next/mdx'` — maintain this pattern:
  ```js
  import rehypePrettyCode from 'rehype-pretty-code'
  // NOT: const rehypePrettyCode = require('rehype-pretty-code')
  ```
- `rehype-pretty-code` is ESM-only. `remark-gfm` is ESM-only. Both are safe in the existing `.mjs` config.
- After adding plugins, run `next build` immediately (not just `next dev`) — webpack loader errors often surface only in production builds.

**Detection:** Add a code block in any MDX file and run `next build`. Look for loader errors in the terminal. If build passes but code blocks show no highlighting, log inside a custom rehype plugin to confirm it runs.

**Phase:** PROJ-V2-02 (before writing any MDX content with code blocks).

---

### Pitfall MDX-5: "What I'd do differently" section added to existing MDX files breaks DE locale pages if the DE `.mdx` files are not updated in sync

**Confidence:** MEDIUM

**What goes wrong:** The 6 MDX files (3 slugs × 2 locales) were translated in Phase 10. Adding a new `## What I'd Do Differently` section to the EN files without adding the corresponding section to the DE files means the DE project pages 404 or render with only partial content. The dynamic import fallback (`notFound()`) does not help here — the DE file will still import successfully, but the section will simply be absent, making DE pages silently incomplete.

**Why it matters here specifically:** The `generateStaticParams` in `projects/[slug]/page.tsx` generates all 6 combinations at build time. If a DE file builds without the new section, Vercel serves a stale cached version. Recruiters using `?locale=de` (or navigating to `/de`) see an incomplete page.

**Prevention:**
- Treat EN and DE MDX files as a synchronized pair. When adding the "What I'd do differently" section to any EN file, immediately add a stub in the corresponding DE file — even if the German copy is draft/TBD at first.
- Add a build-time parity check: a script (or a custom remark plugin) that asserts all `##` headings in the EN file have a corresponding heading in the DE file. This can be a simple Node script run as part of `prebuild` in `package.json`:
  ```json
  "prebuild": "node scripts/check-mdx-parity.mjs"
  ```
- If running DeepL again for the new sections: apply the same XML tag protection for any inline code (backtick strings), filenames, and variable names inside the new section's prose — DeepL will translate `useState` to German-inflected forms if not protected.

**Detection:** After adding the section to EN files, run `next build` with `--locale de` and manually check each project page in DE locale. Watch for missing `## Was ich anders machen würde` section.

**Phase:** PROJ-V2-01 (the "What I'd do differently" content phase).

---

## Integration Pitfalls — Cross-Cutting

### Pitfall INT-1: ScrollTrigger `refresh()` called at wrong time after Spline loads — scroll triggers fire at old positions

**Confidence:** HIGH

**What goes wrong:** The existing codebase calls `ScrollTrigger.refresh()` after `document.fonts.ready` to correct positions after font loading. Spline has a significant load time (the `.splinecode` fetch + WebGL init). When Spline finishes loading, the About section's height may change slightly (the canvas settles to its final dimensions), which shifts all scroll positions below the About section. This means the Work section's stagger trigger, the waveform draw trigger, and the PhaseTimeline triggers all fire at wrong scroll offsets.

**Why it matters here specifically:** All existing ScrollTrigger animations (Phase 4 Work stagger, Phase 5 PhaseTimeline draw, Phase 3 hero fade) were calibrated against a layout without a live Spline canvas. The canvas mount changes the layout by potentially a few pixels to tens of pixels depending on how the About section's aspect-ratio constraint resolves.

**Prevention:**
- Fire `ScrollTrigger.refresh()` from Spline's `onLoad` callback:
  ```tsx
  const onSplineLoad = useCallback((app: Application) => {
    splineRef.current = app
    // Allow one frame for the canvas to settle dimensions
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [])
  ```
- Combine with the existing `document.fonts.ready` refresh in a root-level effect — do not fire two `refresh()` calls simultaneously; the second one after Spline is the one that matters for layout.
- Also call `ScrollTrigger.refresh()` on the `IntersectionObserver` callback when Spline first becomes visible (the canvas may only be sized after it enters the viewport).

**Detection:** After wiring Spline, scroll slowly past the Work section on first load. If cards animate 100–200 px late (or early), the refresh is missing or mistimed. Easiest test: pin element jumps to wrong position.

**Phase:** ABOUT-V2-01/02 (after Spline is wired, as a final integration step).

---

### Pitfall INT-2: The existing `next-mdx-remote` dependency in `package.json` is unused but present — causes confusion and potential import errors if accidentally used alongside `@next/mdx`

**Confidence:** HIGH

**What goes wrong:** `package.json` currently lists `next-mdx-remote: ^6.0.0` as a dependency. The actual project uses `@next/mdx` with webpack dynamic `import()` for MDX files. `next-mdx-remote` is not used anywhere in the codebase. If a developer adds a new MDX pattern and mistakenly imports from `next-mdx-remote` (it's in node_modules, it's listed in package.json, autocomplete will suggest it), they get a different MDX compilation pipeline than the one configured in `next.config.mjs` — the `rehype-pretty-code` plugins will not run on content compiled through `next-mdx-remote`.

**Why it matters here specifically:** `rehype-pretty-code` is configured via `withMDX` in `next.config.mjs`. This only applies to the webpack MDX loader. `next-mdx-remote` uses its own serializer and must have plugins passed separately to `serialize({ mdxOptions: { rehypePlugins: [...] } })`. If the v2.0 work accidentally uses `next-mdx-remote` for any new content, code blocks will have no syntax highlighting and the error will not be obvious.

**Prevention:**
- Remove `next-mdx-remote` from `package.json` and `node_modules` before starting v2.0 work. It is dead code. Run `npm uninstall next-mdx-remote` (or the lock-file equivalent).
- If there is a reason to keep it (not apparent from the codebase), add a comment in `package.json` explaining why, so it's not mistakenly used.

**Detection:** `grep -r "next-mdx-remote" src/` — should return zero results. If it does, the library is in use and needs auditing.

**Phase:** Before PROJ-V2-02 (cleanup step at the start of the phase).

---

### Pitfall INT-3: `prose-invert` + rehype-pretty-code + dark-only design means light-mode Shiki themes render white text on white background

**Confidence:** HIGH

**What goes wrong:** Several popular Shiki themes (`github-light`, `solarized-light`, `catppuccin-latte`) have light backgrounds. If `rehype-pretty-code` is configured with one of these themes — or with a dual-mode theme object `{ light: '...', dark: '...' }` — and the CSS variable `--shiki-light` is applied in an environment where there is no `@media (prefers-color-scheme: light)` override (because this portfolio is dark-only by design, no `prefers-color-scheme` media query exists in `globals.css`), the browser may apply the light token colors. On a `#0A0A0A` background: white background + white text = invisible.

**Prevention:**
- Use a single dark theme string, not a theme object:
  ```js
  [rehypePrettyCode, { theme: 'github-dark-default' }]
  ```
  Single theme = single `--shiki-color-*` variable set. No light/dark branching. Safe for a dark-only site.
- Do not follow the official `rehype-pretty-code` docs' dual-theme example for this project. The dual-theme pattern is designed for sites with `prefers-color-scheme` switching, which this project explicitly does not have.
- If you want a custom feel: create a minimal Shiki JSON theme that overrides just the background to `transparent` and keeps dark token colors.

**Detection:** Add a `\`\`\`ts` block and load in browser. Open DevTools, inspect the `<code>` element — check `--shiki-light` and `--shiki-dark` CSS vars. If light vars are present and not overridden, the code block will look broken on any device with `prefers-color-scheme: light` set at OS level.

**Phase:** PROJ-V2-02 (theme config decision, before adding any MDX code blocks).

---

## Phase-Specific Warnings — v2.0 Features

| Phase | Feature | Likely Pitfall | Mitigation | Confidence |
|---|---|---|---|---|
| **ABOUT-V2-01** | Spline scene authoring | Default camera interactivity fights GSAP scroll control (SP-4) | Disable scroll/orbit/zoom in Spline editor before exporting | MEDIUM |
| **ABOUT-V2-01** | Spline scene URL | Draft URL used instead of published URL (SP-5) | Verify in incognito before wiring | MEDIUM |
| **ABOUT-V2-01** | Event API | `emitEvent` method name changed between runtime versions (SP-6) | Log `Object.keys(splineApp)` in onLoad spike first | MEDIUM |
| **ABOUT-V2-01** | ScrollTrigger timing | Spline load changes About layout, misfires existing triggers (INT-1) | `onLoad → requestAnimationFrame → ScrollTrigger.refresh()` | HIGH |
| **ABOUT-V2-02** | Dynamic import boundary | Spline runtime enters initial bundle (SP-1) | Mirror `ShaderCanvasWrapper` two-layer pattern exactly | HIGH |
| **ABOUT-V2-02** | WebGL contexts | ShaderCanvas + Spline exhaust context budget (SP-2) | IntersectionObserver gate + mobile-only render gate | MEDIUM |
| **ABOUT-V2-02** | React 19 Strict Mode | `onLoad` fires twice in dev, duplicate animation subscriptions (SP-3) | `useRef` guard + `useGSAP` for GSAP bindings | MEDIUM |
| **ABOUT-V2-02** | CLS | Spline canvas mount shifts About text column (SP-7) | Pre-sized placeholder with identical dimensions | MEDIUM |
| **PROJ-V2-01** | MDX sync | New section added to EN but not DE (MDX-5) | Stub DE section immediately, run parity check script | MEDIUM |
| **PROJ-V2-01** | DeepL | New prose section has code terms mangled (MDX-5) | XML tag protection for inline code in DeepL call | MEDIUM |
| **PROJ-V2-02** | Cleanup | `next-mdx-remote` in package.json confuses MDX pipeline (INT-2) | Uninstall it before starting | HIGH |
| **PROJ-V2-02** | Plugin config | `rehype-pretty-code` options key wrong for `@next/mdx` 16 (MDX-1) | Verify installed package README before writing config | HIGH |
| **PROJ-V2-02** | Theme conflict | `prose-invert` + Shiki dual theme → invisible code on dark bg (INT-3, MDX-2) | Single dark theme string, not theme object | HIGH |
| **PROJ-V2-02** | Copy button | Client event handler in server MDX → hydration error (MDX-3) | Skip copy button for v2.0, or isolate to `"use client"` island | HIGH |
| **PROJ-V2-02** | ESM config | `require()` mixed with ESM in `next.config.mjs` breaks loader (MDX-4) | Top-level `import` only in `.mjs` config | HIGH |

---

## "Works locally, breaks on Vercel" — v2.0 Scenarios

1. **Spline draft URL** (SP-5) — works on dev machine (Spline auth cookie present), returns 401 for all visitors on Vercel.
2. **rehype-pretty-code ESM import missing** (MDX-4) — `next dev` may tolerate it via HMR; `next build` on Vercel fails with loader error.
3. **DE MDX file missing new section** (MDX-5) — local build checks EN locale by default; Vercel builds all 6 static params and the DE page silently ships without the section.
4. **Spline bundle not lazy-loaded** (SP-1) — local machine (fast CPU, good RAM) hides the TBT impact; Vercel Lighthouse CI on a simulated mobile device fails ≥ 85 threshold.
5. **WebGL context exhaustion** (SP-2) — local dev rarely navigates enough times in one session; real users (especially recruiters who open multiple tabs or navigate back/forth) hit the limit.

---

## Sources

External research tools (WebSearch, WebFetch, ctx7, Bash) were restricted in this research run. Findings are drawn from:

- Direct codebase inspection: `package.json`, `next.config.mjs`, `src/lib/gsap.ts`, `src/components/ShaderCanvas.tsx`, `src/components/AboutSection.tsx`, `src/app/[locale]/projects/[slug]/page.tsx`, `mdx-components.tsx`, `src/app/layout.tsx`
- Training data on documented library behavior for: `@splinetool/react-spline`, `@splinetool/runtime`, `rehype-pretty-code`, `@next/mdx`, GSAP `ScrollTrigger`, React 19 Strict Mode, Shiki token themes, Tailwind Typography `prose-invert`

**Recommended verification during implementation:**
- Spline event API: https://github.com/splinetool/react-spline — check `Application` type exports and CHANGELOG
- rehype-pretty-code config: https://rehype-pretty-code.netlify.app/ — confirm options key for `@next/mdx` 16.x
- Shiki themes available: https://shiki.style/themes — pick a single dark theme name
- WebGL context limits: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext — browser limits section
- @next/mdx + rehype: https://nextjs.org/docs/app/building-your-application/configuring/mdx#using-plugins
