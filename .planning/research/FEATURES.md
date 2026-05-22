# Feature Landscape

**Domain:** Developer/engineer portfolio website (AI, wireless, mobility)
**Audience:** Recruiters AND technical collaborators (dual-mode)
**Researched:** 2026-05-22
**Version:** v2.0 update (Spline 3D character + project page depth features)
**Confidence:** MEDIUM (WebSearch and WebFetch unavailable; findings based on training data through 2025 spanning Spline community patterns, portfolio best practices, and rehype-pretty-code docs. Flagged where verification is needed.)

---

## v1.0 Feature Summary (already built — do not re-implement)

- Hero section: shader gradient + GSAP scramble name animation
- About section: static SVG/PNG illustration, text descriptor
- Work section: project cards with GSAP stagger reveal, Framer Motion card expansion
- Project pages: MDX deep-dives with GSAP phase timeline, EN + DE locales
- Life page: Courier Prime, travel photos, hobbies
- Page transitions: Framer Motion AnimatePresence dark panel slide

---

## v2.0 New Features

Three features. Spec'd below with table stakes, differentiators, anti-features, complexity, and dependencies.

---

## Feature 1: Spline 3D Character in About Section

**Requirements ref:** ABOUT-V2-01, ABOUT-V2-02, ABOUT-V2-03

### What It Is

A stylized 3D character built in spline.design, replacing the static illustration on desktop (≥768px). The character has two animation states: a one-shot "greeting" (wave or head-nod) that fires once when the About section scrolls into view, and an idle loop it returns to after the greeting completes. On mobile (<768px), the static illustration remains — no Spline at all (not hidden, not mounted, not in the bundle for that viewport).

### Expected Behavior — Detail

**Load sequence:**
1. About section scrolls to within ~20% of viewport bottom (IntersectionObserver threshold: 0.2 or ScrollTrigger `start: "top 80%"`)
2. If Spline scene is not yet loaded: load begins at this moment (lazy, not on page load)
3. Once loaded (onLoad fires), greeting animation plays immediately — no additional user gesture required
4. Greeting animation duration: 1.5–2.5 seconds is the standard range. Under 1.5s feels jerky; over 3s feels slow for a page-scroll interaction. Target 2s.
5. After greeting completes (via Spline's animation event or a timeout fallback), idle loop resumes automatically if the character has a looping idle state in the Spline scene
6. Greeting fires exactly once per page visit — tracked with a `useRef` boolean (`hasGreeted.current`). No re-trigger on scroll-up/scroll-down.

**Trigger mechanism:**
- PRIMARY: IntersectionObserver on the About section container (`rootMargin: "0px 0px -20% 0px"` to trigger slightly before full entry)
- ALTERNATIVE: GSAP ScrollTrigger `onEnter` callback — consistent with the existing GSAP architecture already in the project. Preferred given GSAP is already registered and in use.
- GSAP ScrollTrigger is the correct choice here because the project already registers ScrollTrigger globally; adding an IntersectionObserver creates a second pattern. Use `ScrollTrigger.create({ trigger: aboutRef.current, start: "top 80%", once: true, onEnter: () => triggerGreeting() })`.

**Spline API call pattern:**
```
onLoad={(splineApp) => { splineRef.current = splineApp }}
// then in triggerGreeting():
splineRef.current?.emitEvent('mouseDown', 'CharacterName')
// OR for state-based animation:
splineRef.current?.setVariable('greeting', true)
// after 2000ms, set back to false to return to idle
```
The exact method depends on how the character is authored in spline.design:
- If character has named states (State Machine): `emitEventReverse` or set a boolean variable
- If character uses events: `emitEvent('mouseDown', objectName)` triggers the associated event

**Desktop-only gate:**
```typescript
const isDesktop = useMediaQuery('(min-width: 768px)')
// or via matchMedia without a library:
const [isDesktop, setIsDesktop] = useState(false)
useEffect(() => {
  const mql = window.matchMedia('(min-width: 768px)')
  setIsDesktop(mql.matches)
  const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
  mql.addEventListener('change', handler)
  return () => mql.removeEventListener('change', handler)
}, [])
// Render: {isDesktop ? <SplineScene /> : <StaticIllustration />}
```
Do NOT use Tailwind `hidden md:block` — that mounts the component. The conditional must prevent mounting entirely.

**Character style guidance:**
- Stylized, not hyper-realistic. A flat-shaded or cel-shaded humanoid reads as intentional design choice, not a failed attempt at realism
- Consistent with the warm orange-crimson palette (clothing, lighting, or ambient in the Spline scene)
- Greeting: wave is the most natural and universally readable. Head nod is an acceptable second. Avoid complex multi-limb animations — they add Spline file size and can feel uncanny
- Idle loop: subtle breathing or slight hover/float. Avoid constant movement (eye darts, constant head swivel) — these distract from the About text

### Table Stakes (must-have for this feature to ship)

| Behavior | Why Required | Notes |
|----------|-------------|-------|
| Greeting fires once on scroll-in | Prevents annoying re-trigger on scroll up/down | `hasGreeted.current = true` guard |
| Desktop-only conditional render (not just hidden) | Lighthouse ≥85 mobile gate — Spline bundle is ~300–500 KB | `useMediaQuery` or `matchMedia` conditional mount |
| `next/dynamic({ ssr: false })` import | Server-side: `window is not defined` crash | Non-negotiable, already documented in CLAUDE.md |
| `onLoad` captures splineApp instance | Required to programmatically call emitEvent | `const splineRef = useRef<SplineApp>()` |
| Returns to idle after greeting | Character frozen mid-wave is visually broken | Either automatic (Spline state machine exits), or set variable back after timeout |
| No full-page-load Spline fetch | Lazy load is mandatory | Use `loading="lazy"` on the SplineViewer or only mount after scroll trigger |
| Static illustration on mobile | Fallback UX must be equivalent quality | Must exist as a real asset, not a placeholder |

### Differentiators (nice-to-have, add if complexity is low)

| Behavior | Value | Complexity | Notes |
|----------|-------|------------|-------|
| Mouse parallax on character (subtle) | Character tracks cursor slightly — alive feeling | Med | Spline supports pointer events; can also be done with CSS `perspective` + `rotateX/Y` based on mouse position. Only if Lighthouse budget allows after Spline is loaded. |
| Character blinks on hover over About section | Micro-interaction — suggests awareness | Low-Med | Another `emitEvent` call on `onMouseEnter` on the section. Easy if character has a blink state. |
| Smooth opacity fade-in of Spline canvas when loaded | Prevents pop-in of WebGL canvas | Low | CSS `transition: opacity 0.4s ease` controlled by `onLoad` callback. `opacity-0` until loaded. |
| Loading skeleton that matches character dimensions | Prevents layout shift (CLS) while Spline loads | Low | `aspect-ratio: 1/1` placeholder div with `bg-zinc-900 animate-pulse` or a simplified SVG silhouette |

### Anti-Features (explicitly avoid)

| Anti-Feature | Why | What Instead |
|-------------|-----|-------------|
| Mount Spline on mobile and hide via CSS | Bundle ships, scene runs, Lighthouse tanks | Conditional render: `isDesktop && <SplineScene />` |
| Greeting re-fires on scroll up/down | Annoying, cheapens the interaction | `once: true` in ScrollTrigger + `hasGreeted.current` guard |
| Continuous animation with no idle state | Distracting, GPU drain | Idle = subtle breathing/float, not constant movement |
| Using raw `useEffect` to trigger animation | Breaks in React 19 Strict Mode double-mount | `useGSAP` for scroll trigger, `useRef` for splineApp instance |
| Spline scene loading on page load (not lazy) | Adds ~300–500 KB to first paint | Only begin loading when About section is near viewport |
| Two WebGL contexts (Spline + shader-gradient) simultaneously visible | Context limit on integrated GPUs causes black canvases | Hero (shader-gradient) and About (Spline) are never simultaneously in viewport. This is a layout guarantee, not a code guard — confirm in design. |
| Hyper-realistic character design | Uncanny valley, high Spline file size | Stylized, flat-shaded, intentional design |

### Complexity: HIGH

Not because the React code is hard, but because:
1. The character must be designed and built in spline.design — creative asset work, not coding
2. Getting the greeting/idle state machine right in Spline editor takes iteration
3. Spline file size must be kept under ~2 MB for acceptable load time at lazy-load trigger
4. Mobile breakpoint conditional must be confirmed in both the component AND Lighthouse CI

### Dependencies on Existing Features

- Depends on: About section container ref (for ScrollTrigger trigger element)
- Depends on: GSAP ScrollTrigger already registered in `lib/gsap.ts` (already exists per v1.0)
- Depends on: Static illustration asset (for mobile fallback — must be production-quality, not a placeholder)
- Blocks: Nothing downstream
- CRITICAL EXTERNAL DEPENDENCY: Spline character asset. Must be designed and exported from spline.design before this feature can land. Stub About with static illustration until character is ready.

---

## Feature 2: "What I'd Do Differently" Section on Project Pages

**Requirements ref:** PROJ-V2-01

### What It Is

A freeform but structured section at the end of each project deep-dive MDX page where the author (Lohith) reflects honestly on decisions that didn't work out, approaches he'd change now, and lessons absorbed. Not a failure wall — a credibility signal. Shows a builder who learns.

### Expected Behavior — Detail

**Placement:** After the project content, before the "Next project" navigation link. After all technical sections and the outcome summary. This is the closing note of the deep-dive.

**Format recommendation (based on strong-portfolio patterns):**
- 3–5 short bullets (not a wall of paragraphs)
- Each bullet: one sentence of what + one sentence of why it matters now
- No bullet should be longer than 3 lines
- Honest but not self-deprecating: "I'd use X instead of Y because Z" not "I made a terrible mistake"
- Avoid vague statements: "I'd communicate better" is noise. "I'd scope the MIMO simulation to 2×2 MIMO before scaling to 4×4, to validate the channel model independently" is signal.
- Past tense for the mistake, conditional for the reflection: "We chose MATLAB for prototyping — if starting today, I'd use Python/NumPy for the matrix operations to make the analysis reproducible without a license."

**Tone:**
- First-person, direct voice (matches the portfolio's "builder with intent" brand)
- Not formal/academic — personal, like a post-mortem note from a senior engineer
- Not confessional or apologetic — matter-of-fact and growth-oriented
- Contrast with the rest of the MDX which is likely more factual/technical: this section shifts register intentionally to personal reflection

**Length:** 150–350 words total. Under 150 feels superficial; over 400 starts to feel like a blog post within a project case study.

**Section heading options:**
- "What I'd Do Differently" — direct, honest
- "If I Were Starting Today" — slightly warmer, forward-looking
- "Hindsight" — short, punchy
- "Lessons" — generic, avoid
- Recommendation: "What I'd Do Differently" — matches the requirements verbatim, is the most commonly understood pattern, and signals self-awareness without self-pity

**Visual treatment:**
- Distinct from surrounding content: light left-border accent (orange/crimson from the palette), slightly muted background (e.g. `bg-zinc-900/50`), or a subtle divider line
- NOT a callout box or warning badge — this is not an error or a warning, it's a reflection
- The accent color (orange-crimson) as a left border is the right visual metaphor: same energy as the hero, here used for introspection rather than show
- Font size: same as body (Plus Jakarta Sans), not shrunk. Shrinking implies the section is less important, which undermines the intent.

**MDX implementation:**
```mdx
## What I'd Do Differently

- **Validate the channel model at small scale first.** I jumped to 4×4 MIMO simulation before confirming the 2×2 base case worked. Would have saved two weeks of debugging correlation matrix issues.
- **Write the DeepL translation script earlier.** We left the i18n pass for the last phase; it introduced character encoding edge cases in the German locale that required backtracking.
- **Separate the simulation runner from the analysis pipeline.** Mixing data generation and visualization in one notebook made it hard to re-run experiments with different parameters.
```

The MDX renders this as a standard `ul`, styled by the `@tailwindcss/typography` prose class. The visual treatment (left border, background) is applied via the MDX component map in `mdx-components.tsx` — override the `h2` or wrap `<WhatIDoDifferently>` in a custom component.

**Custom MDX component option:**
```tsx
// In mdx-components.tsx
<WhatIDoDifferently>
  - bullet 1
  - bullet 2
</WhatIDoDifferently>
```
This is optional but allows the visual treatment to be applied without CSS hacks on the heading. Complexity: low.

**i18n note:** This section will be in English in v1.0. For DE locale, the content is either translated inline in the `.de.mdx` file or kept in English with a note. Given the personal-voice register, machine translation (DeepL) of this section needs careful manual review — avoid idioms that don't translate well. Flag for manual review in the v1.1 i18n pass.

### Table Stakes (must-have)

| Behavior | Why Required | Notes |
|----------|-------------|-------|
| Section present on all three project MDX pages | Per requirements (PROJ-V2-01): "all project deep-dive pages" | MIMO AI, VLC V2V, IoT Security |
| 3–5 honest, specific bullets | Section must have real content or it undermines trust | Each bullet: what + why it matters |
| Visually distinct from surrounding content | Reader must understand this is a different register | Left-border accent or subtle background |
| Same font size as body text | Reflects that this section is equally important, not a footnote | No `text-sm` |
| Placed at the end of the project deep-dive, before nav | Structural position: closing thought, not an interruption | After Outcome/Results section |

### Differentiators (nice-to-have)

| Behavior | Value | Complexity | Notes |
|----------|-------|------------|-------|
| Custom `<WhatIDoDifferently>` MDX component with consistent styling | Visual consistency across all three projects, easy to re-use | Low | 20 lines of code, applied once in mdx-components.tsx |
| Section heading with subtle orange-crimson accent | Reinforces brand palette at a meaningful moment | Low | CSS `border-left: 3px solid var(--color-accent)` on the `h2` or wrapper |
| Small pull-quote of the most important lesson | A single line in larger type before the bullets — "the headline lesson" | Low-Med | Optional. Adds visual hierarchy, good for skim readers. |
| Translations for DE locale via manual review (not auto-DeepL) | Personal voice requires human translation | High (effort not code) | Defer to v1.1, flag in PROJECT.md |

### Anti-Features (explicitly avoid)

| Anti-Feature | Why | What Instead |
|-------------|-----|-------------|
| Vague generic reflections ("I'd communicate more") | Undermines the credibility signal — reads as template | Specific, technical, scoped to this project |
| More than 5 bullets | Shifts register to "post-mortem document" — wrong tone for portfolio | Cap at 5; merge or cut |
| Self-deprecating/apologetic tone | Signals insecurity, not growth | Matter-of-fact: "X would have been better because Y" |
| Callout box with warning/error icon | Wrong semantic — this is reflection, not an alert | Left border + muted background only |
| Placing section in the middle of the deep-dive | Interrupts the technical narrative | Always at the end |
| Making it i18n-translated via raw DeepL without review | Machine-translated personal voice sounds wrong | Manual review pass for DE |

### Complexity: LOW

Pure content + minimal styling. No new libraries. Leverages existing MDX pipeline (`@next/mdx` + `@tailwindcss/typography` already in use). Custom MDX component is optional but easy.

### Dependencies on Existing Features

- Depends on: MDX pipeline (`@next/mdx` config, `mdx-components.tsx`) — already built in v1.0
- Depends on: Project MDX files (MIMO AI, VLC V2V, IoT Security) — already authored in v1.0
- Depends on: `@tailwindcss/typography` prose styles — already in use
- Blocks: Nothing downstream

---

## Feature 3: Code Snippets with Syntax Highlighting + Repo Link

**Requirements ref:** PROJ-V2-02

### What It Is

Code blocks in project MDX pages rendered with VS Code-quality syntax highlighting via `rehype-pretty-code` (Shiki-based, build-time, zero runtime cost), plus a visible link to the project's source repo. Language labels appear on each code block. An optional copy-to-clipboard button on hover.

### Expected Behavior — Detail

**Syntax highlighting (rehype-pretty-code):**
- Renders at build time — no JavaScript shipped to the browser for highlighting
- Theme: match the site's dark aesthetic. Recommended: `vesper`, `github-dark-dimmed`, or `one-dark-pro`. Avoid `github-dark` (too blue; clashes with orange-crimson palette). `vesper` is warm-toned and was created by Rauno Freiberg (whose style aligns with this portfolio's direction).
- Language label: rendered via `rehype-pretty-code`'s `figcaption` or a custom `meta` string. The library attaches `data-language` to the `pre` element — use a CSS `::before` or a Tailwind-based approach to display it.
- Line highlighting: `rehype-pretty-code` supports `{1,3-5}` in the code fence meta to highlight specific lines. Used sparingly in project deep-dives to draw attention to key lines.
- File name label: `rehype-pretty-code` supports `title="filename.py"` in the fence meta — appears as a tab above the code block. Use for file context in longer snippets.
- NO line numbers by default — line numbers add visual noise in portfolio context. Reserve for snippets >20 lines where navigation aids comprehension.

**Copy-to-clipboard button:**
- `rehype-pretty-code` does NOT add a copy button itself — it's a build-time transform; it has no runtime JS
- Copy button must be added via a client component wrapper around the `pre` element in `mdx-components.tsx`
- Pattern: wrap `<pre>` in a `<CodeBlock>` client component that injects a `<CopyButton>` using `navigator.clipboard.writeText(codeRef.current?.textContent)`
- Button appears on hover (CSS `group-hover:opacity-100 opacity-0 transition-opacity`)
- Icon: clipboard icon or a check icon that animates to "copied" state for 2 seconds
- Position: top-right corner of the code block, `absolute` positioned

**Language label display:**
- `rehype-pretty-code` sets `data-language` on the `pre[data-language]` element
- CSS approach (no JS needed): `pre::before { content: attr(data-language); }` styled as a small badge
- OR: read `data-language` in the `CodeBlock` wrapper component and render a `<span>` label
- Recommended: component approach (more styling control) — display as `bg-zinc-800 text-zinc-400 text-xs font-mono px-2 py-1` badge in the top-left corner of the code block

**Repo link:**
- One repo link per project page, not per code snippet
- Placement: either in the project frontmatter (rendered in the page header alongside stack tags and dates), or as a standalone "View on GitHub" button/link near the top of the page or at the end
- Recommendation: in the project page header area, near the tech stack tags — this is where recruiters look first. A secondary link at the end of the page (near "What I'd Do Differently") as a CTA.
- Format: `<a href="https://github.com/..." target="_blank" rel="noopener noreferrer">` — simple, no custom component needed
- Icon: GitHub mark SVG (inline, ~24px) + "View source" label, or the standard external-link icon
- If the repo is private: do not show the link, or show it as "Private repository" (non-linked text). Handle this via frontmatter: `repo: null` suppresses the link.

**Dark theme color choices for code blocks:**
The site palette is electric orange → deep crimson → near-black (`#0A0A0A`). Code block background should be `#111111` or `#141414` (slightly lighter than page background to create depth). The syntax highlight theme should have:
- Keywords in the warm range (orange-amber, not blue)
- Strings in a muted warm tone
- Comments in `#555` or `#666` (readable but clearly secondary)
- No neon greens or harsh blues — they clash with the palette

`vesper` theme by Rauno Freiberg is the top recommendation: warm ambers, no blues, high contrast on dark backgrounds, widely cited as matching Linear/Vercel-style design systems.

**MDX authoring experience:**
```mdx
```python title="channel_estimator.py" {3-5}
import numpy as np

def estimate_channel(H, snr_db):
    noise_var = 10 ** (-snr_db / 10)
    return np.linalg.solve(H.T @ H + noise_var * np.eye(H.shape[1]), H.T)
```
```
The `title` and `{3-5}` line-highlight meta are processed by `rehype-pretty-code` at build time. Author writes normal fenced code blocks — no custom MDX component needed in the content itself.

**Configuration in `next.config.mjs`:**
```javascript
import rehypePrettyCode from 'rehype-pretty-code'

const options = {
  theme: 'vesper', // or { dark: 'vesper', light: 'github-light' } — single dark theme sufficient
  keepBackground: false, // let Tailwind/CSS control the background
  defaultLang: 'plaintext',
}

// Inside withMDX config:
rehypePlugins: [[rehypePrettyCode, options]]
```

### Table Stakes (must-have)

| Behavior | Why Required | Notes |
|----------|-------------|-------|
| Syntax highlighting on all code blocks | Core feature requirement; un-highlighted code reads as afterthought | `rehype-pretty-code` in MDX pipeline |
| Language label on each code block | Reader orientation — "is this Python or JS?" | `data-language` CSS or component approach |
| Dark theme matching site palette | Bright white code blocks on dark site look broken | `vesper` or `github-dark-dimmed` |
| Repo link visible on the project page | Per PROJ-V2-02 requirements | Frontmatter-driven, near page header |
| Private repo handled gracefully | Don't show a broken link or 404 | `repo: null` in frontmatter suppresses link |
| Build-time (not runtime) highlighting | Lighthouse ≥85 mobile gate | `rehype-pretty-code` is build-time; no PrismJS |

### Differentiators (nice-to-have)

| Behavior | Value | Complexity | Notes |
|----------|-------|------------|-------|
| Copy-to-clipboard button | Developer ergonomics — recruiter/collaborator copies snippet | Low-Med | Client component wrapper in mdx-components.tsx; ~30 lines |
| File name tab above code block | Context: tells reader which file this is from | Low | `title="filename.py"` in fence meta, styled via CSS |
| Line highlighting for key sections | Directs attention to the most important lines | Low | `{3-5}` in fence meta, styled with `bg-zinc-700/30` on highlighted lines |
| Diff-style code blocks (`+` / `-` lines) | Show before/after changes — useful for "What I'd Do Differently" | Low | `rehype-pretty-code` supports `diff` language with `+`/`-` prefix styling |
| Inline code styled distinctly from blocks | Inline `code` should be readable mid-paragraph | Low | Custom `code` in mdx-components.tsx: `bg-zinc-800 px-1 rounded text-orange-400 font-mono text-sm` |
| Collapsible long code blocks | Prevents overwhelming the page layout | Med | Custom `<CodeCollapse>` wrapper; toggle with state. Only needed for >30-line snippets. |

### Anti-Features (explicitly avoid)

| Anti-Feature | Why | What Instead |
|-------------|-----|-------------|
| Runtime syntax highlighting (PrismJS, highlight.js, prism-react-renderer) | Adds JS bundle size, slower FCP, worse Lighthouse | `rehype-pretty-code` (build-time, already in CLAUDE.md) |
| Bright default themes (`github-light`, `solarized-light`) | Breaks dark-site visual consistency | Dark theme only; `vesper` or `github-dark-dimmed` |
| Line numbers on all code blocks | Visual noise in portfolio context; adds ~30px of column width | Only on blocks >20 lines where navigation helps |
| Repo link on every code snippet | Redundant; clutters the page | One repo link per project page, in the header |
| Copy button that's always visible (not hover-triggered) | Clutters UI when multiple code blocks are on the page | `group-hover:opacity-100 opacity-0` — appears on hover |
| Using `next-mdx-remote` for local MDX | Overkill for local files, adds complexity | `@next/mdx` already in use (per CLAUDE.md) |
| Code blocks with default browser styling | Looks unfinished | Full custom styling via mdx-components.tsx |

### Complexity: LOW-MEDIUM

- Adding `rehype-pretty-code` to MDX config: LOW (5 lines in `next.config.mjs`)
- Styling code blocks to match the palette: LOW (CSS/Tailwind)
- Copy button client component: LOW-MEDIUM (30–50 lines, one new component)
- Repo link in frontmatter + display: LOW
- Line highlighting and file names: LOW (fence meta, no code changes)

### Dependencies on Existing Features

- Depends on: `@next/mdx` pipeline — already configured in v1.0
- Depends on: `mdx-components.tsx` — already exists, add `pre`/`code` overrides
- Depends on: Project frontmatter structure (add `repo` field if not present)
- Blocks: Nothing downstream

---

## Feature Dependencies (v2.0)

```
Spline 3D character (ABOUT-V2-01/02/03)
  ├─ REQUIRES: Spline scene designed + exported (.splinecode or hosted URL)
  │   └─ CREATIVE BLOCKER — design work, not coding. Estimated: 4–8 hours in spline.design
  ├─ REQUIRES: About section ref available (for ScrollTrigger)
  ├─ REQUIRES: GSAP ScrollTrigger registered (already done in v1.0)
  ├─ REQUIRES: Static illustration (for mobile fallback — must be production quality)
  └─ PRODUCES: Enhanced About section on desktop

"What I'd Do Differently" section (PROJ-V2-01)
  ├─ REQUIRES: Project MDX files exist (MIMO AI, VLC V2V, IoT Security — already in v1.0)
  ├─ REQUIRES: mdx-components.tsx (already exists)
  └─ PRODUCES: Richer project deep-dive pages

Code snippets + syntax highlighting (PROJ-V2-02)
  ├─ REQUIRES: rehype-pretty-code installed + configured in next.config.mjs
  ├─ REQUIRES: Project MDX files contain code blocks (add during this feature)
  ├─ OPTIONAL DEPENDENCY: Copy button requires a new client component
  └─ PRODUCES: Visual code blocks with language labels in project pages
```

**No circular dependencies.** PROJ-V2-01 and PROJ-V2-02 can be done in the same pass on the MDX files. ABOUT-V2-01/02/03 is fully independent — it only touches the About section.

**Recommended build order for v2.0:**
1. PROJ-V2-02 first (install rehype-pretty-code, add code blocks to MDX, style them) — pure config + content work, no creative blocker
2. PROJ-V2-01 second (add reflection sections to MDX, style via mdx-components.tsx) — pure content + minimal styling
3. ABOUT-V2-01/02/03 last (requires the Spline scene to exist) — start Spline design in parallel with steps 1–2

---

## Overall v2.0 Complexity Assessment

| Feature | Complexity | Primary Risk | Timeline estimate |
|---------|-----------|-------------|------------------|
| Spline 3D character | HIGH | Creative asset (Spline scene) is the blocking dependency, not code | 2–3 days (scene design) + 0.5 day (code wiring) |
| "What I'd Do Differently" | LOW | Content quality (must be specific and honest) | 2–4 hours per project (content) + 2 hours (styling) |
| Code snippets + syntax highlighting | LOW-MEDIUM | rehype-pretty-code config + theme matching | 2–4 hours (config + styling) + 1 hour per project (add code blocks) |

**Total v2.0 estimate:** 1.5–2 days for PROJ-V2-01 + PROJ-V2-02 (code side), 2–3 days for ABOUT-V2-01/02/03 (design-heavy). Can parallelize.

---

## Confidence Notes

| Area | Confidence | Notes |
|------|------------|-------|
| Spline scroll-trigger + emitEvent pattern | MEDIUM | CLAUDE.md documents this pattern from training-data research. Cannot verify exact SplineApp method names against current @splinetool/react-spline npm without WebFetch. Verify `emitEvent` signature against package README before coding. |
| Spline greeting duration norms (1.5–2.5s) | MEDIUM | Drawn from general animation UX guidelines and Spline community portfolios observed through training data. Not verifiable without live examples. |
| rehype-pretty-code `data-language`, `title`, `{line}` meta syntax | HIGH | Documented in rehype-pretty-code README (stable, well-established API). Syntax has been consistent across v0.10.x–v0.14.x range. |
| `vesper` theme recommendation | MEDIUM | Known to exist in Shiki's theme registry. Verify `import { vesper } from '@shikijs/themes'` or string `'vesper'` is valid in current Shiki version bundled by rehype-pretty-code. |
| Copy button pattern (client component) | HIGH | Standard Next.js App Router pattern for adding client interactivity to MDX. |
| "What I'd Do Differently" format (bullets, length, tone) | MEDIUM-HIGH | Based on portfolio best-practice analysis through 2025. Durable UX/content principle. No live examples verified. |
| Desktop-only Spline gate via matchMedia | HIGH | Explicitly documented in CLAUDE.md as the required pattern. Not CSS `hidden`. |

---

## Sources

- Project context: `/Users/lohith/Projects/Personal/portfolio_v2/.planning/PROJECT.md`
- Existing CLAUDE.md stack documentation (Spline integration patterns, rehype-pretty-code choice)
- Existing research SUMMARY.md and PITFALLS.md
- Training data (Spline React API, rehype-pretty-code API, portfolio content patterns) through 2025
- Context7 CLI: resolved `/splinetool/react-spline` library ID (could not fetch docs — CLI permissions denied in this environment)
- No live web sources verified in this pass (WebSearch, WebFetch, Bash all denied after library resolution)
