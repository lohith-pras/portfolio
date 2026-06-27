# Design — Lohith Tarikere Prasanna (portfolio_v2)

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
atmospheric — dark, cinematic, technical. Reads like an RF/signal instrument,
not a SaaS template.

## Macrostructure family
- Marketing / home page: **Marquee Hero → Manifesto → Index → Ledger**
  (3D city hero · oversized positioning statement · sticky-stack work index ·
  quiet capability ledger). Variation knobs: hero dock copy, manifesto accent
  placement, work card voice.
- Content pages (e.g. `/life`): **Long Document** — single-column editorial,
  typography-led, horizontal place scroll allowed. Shares type + colour + CTA voice.

## Theme
- `--color-paper`      oklch(0.15 0 0)        /* page base = #0A0A0A rich black */
- `--color-paper-2`    oklch(0.15 0 0)        /* section base = #0A0A0A rich black */
- `--color-ink`        oklch(0.95 0 0)        /* foreground ≈ #F0F0F0 */
- `--color-ink-2`      oklch(0.72 0 0)        /* softened body ink */
- `--color-muted`      oklch(0.62 0 0)        /* labels / eyebrows — raised for AA contrast (~4.6:1) */
- `--color-rule`       oklch(0.95 0 0 / 0.1)  /* hairline dividers */
- `--color-accent`     oklch(0.63 0.25 28)    /* warm-red ≈ #FF1E00 */
- `--color-accent-ink` oklch(0.15 0 0)        /* ink on accent fills */
- `--color-focus`      oklch(0.63 0.25 28)    /* focus ring = accent */

Accent discipline: warm-red ≤ 5% per viewport. Used as signal marker
(left rules, key words, link hover, focus ring) — never as a fill field.

## Typography
- Display / Headings: **Oswald**, weight 500–700, uppercase, condensed (hero `<h1>` + all section `<h2>`s)
- Body:    Plus Jakarta Sans, weight 300–500
- Mono:    Space Mono (eyebrows, ledger labels, chips, counters, CTA pills)
- Route Specific (e.g. `/life`): **Courier Prime** (loaded dynamically in `src/app/[locale]/life/layout.tsx` to optimize page weight)
- Display tracking: -0.04em on the hero name; -0.02em on section h2 headings
- Type scale anchor: `--text-heading` = clamp(2rem, 6vw, 4.5rem)

Oswald is the brand signature (condensed "signal" face). Space Mono handles all
mono labels. Plus Jakarta Sans handles all body prose. Courier Prime is reserved exclusively for the `/life` log environment. Never mix body and mono on
the same text element.

## Spacing
Fluid section rhythm, deliberately varied to break the uniform `py-24` cadence:
`--space-section-lg` for narrative beats (hero/manifesto), `--space-section-sm`
for supporting beats (ledger). Use named tokens, never raw values.

## Motion
- Easings: `--ease-out` cubic-bezier(0.16, 1, 0.3, 1); also `--ease-out-quart`,
  `--ease-out-quint`. Never the browser default `ease`, never bounce/overshoot.
- Reveal pattern: **de-uniform per section** — each section uses a distinct entrance:
  - Hero: mask-reveal (yPercent 110→0, staggered lines)
  - About: clip-path wipe (top→bottom surface sweep, then content rises)
  - Projects: vertical stagger on list rows (y: 32, stagger: 0.12s)
  - Toolkit: horizontal clip-path wipe from left (inset 0 100% → 0 0%)
  - Contact: opacity-only container fade (0.9s); SplitText heading provides spatial motion
- Reduced-motion fallback: opacity-only, ≤ 150 ms; spatial reveals collapse.
- Shader: `ShaderGradient` animation pauses via IntersectionObserver when #hero
  leaves the viewport (< 5% intersection) to stop GPU repaints off-fold.
- Ghost numerals: static decoration only — no parallax drift. Eyebrow + rule is
  the primary section-head cadence.
- Detail panel transitions: opacity + y only — no blur/scale (avoids compositor
  escapes on every scrub frame).

## Microinteractions stance
- Silent success. No celebratory toasts.
- Link underline wipe in from left (`.link-wipe`); arrow nudge on CTA hover.
- Hover delay 800 ms / focus delay 0 ms on any tooltip.
- `:focus-visible` ring at ≥ 3:1, shown instantly (never animated).

## CTA voice
- Primary: pill, hairline border, mono uppercase tracking-widest, arrow nudge on
  hover, border + text → accent on hover. (`ContactSection` link pattern.)
- Secondary: same shell, lower contrast border.

## Per-page allowances
- Home MAY use the 3D city enrichment (Tier-D library + customisation, R3F).
- Content pages: typography only (plus existing place-scroll / waving-flag motifs).

## What pages MUST share
- The 3-family type stack: Oswald (display/headings), Space Mono (mono labels), Plus Jakarta Sans (body).
- The warm-red accent and its ≤ 5% placement.
- The CTA pill voice (shape, mono label, arrow nudge).
- Eyebrow rhythm: mono uppercase tracking-[0.3em] label, stacked above heading.
- Nav: dark opaque bg-paper border-rule — no glass/backdrop-filter on the nav bar.

## What pages MAY differ on
- Macrostructure within the family (home = Marquee Hero; `/life` = Long Document).
- Section padding rhythm (sm vs lg beats).

## Exports

### tokens.css
See [`tokens.css`](tokens.css) at project root — the canonical token source.

### Tailwind v3 Configuration (`tailwind.config.js`)
```javascript
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        foreground: '#F0F0F0',
        accent: '#FF1E00',
        beige: '#F5DDB6',
        paper: 'var(--color-paper)',
        'paper-2': 'var(--color-paper-2)',
        ink: 'var(--color-ink)',
        'ink-2': 'var(--color-ink-2)',
        muted: 'var(--color-muted)',
        rule: 'var(--color-rule)',
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'sans-serif'],
        body: ['var(--font-plus-jakarta)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
        life: ['var(--font-courier-prime)', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### DTCG `tokens.json`
```json
{
  "color": {
    "paper":  { "$value": "oklch(0.15 0 0)", "$type": "color" },
    "paper-2": { "$value": "oklch(0.15 0 0)", "$type": "color" },
    "ink":    { "$value": "oklch(0.95 0 0)", "$type": "color" },
    "ink-2":  { "$value": "oklch(0.72 0 0)", "$type": "color" },
    "muted":  { "$value": "oklch(0.62 0 0)", "$type": "color" },
    "accent": { "$value": "oklch(0.63 0.25 28)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Oswald", "$type": "fontFamily" },
    "body":    { "$value": "Plus Jakarta Sans", "$type": "fontFamily" },
    "mono":    { "$value": "Space Mono", "$type": "fontFamily" },
    "life":    { "$value": "Courier Prime", "$type": "fontFamily" }
  }
}
```

### shadcn/ui CSS variables
```css
:root {
  --background:          0.15 0 0;
  --foreground:          0.95 0 0;
  --primary:             0.63 0.25 28;
  --primary-foreground:  0.15 0 0;
  --muted-foreground:    0.62 0 0;
  --border:              0.95 0 0 / 0.1;
  --ring:                0.63 0.25 28;
  --radius:              9999px;
}
```
