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
- `--color-paper`      oklch(0.15 0 0)        /* page base ≈ #0A0A0A */
- `--color-paper-2`    oklch(0.17 0 0)        /* section base ≈ #0C0C0C */
- `--color-ink`        oklch(0.95 0 0)        /* foreground ≈ #F0F0F0 */
- `--color-ink-2`      oklch(0.72 0 0)        /* softened body ink */
- `--color-muted`      oklch(0.55 0 0)        /* labels / eyebrows */
- `--color-rule`       oklch(0.95 0 0 / 0.1)  /* hairline dividers */
- `--color-accent`     oklch(0.63 0.25 28)    /* warm-red ≈ #FF1E00 */
- `--color-focus`      oklch(0.63 0.25 28)

Accent discipline: warm-red ≤ 5% per viewport. Used as signal marker
(left rules, key words, link hover, focus ring) — never as a fill field.

## Typography
- Display: Space Mono, weight 700, style normal (roman — no italic headers)
- Body:    Plus Jakarta Sans, weight 300–500
- Mono:    Space Mono (labels, eyebrows, ledger, chips)
- Display tracking: -0.02em on large headings
- Type scale anchor: `--text-heading` = clamp(2rem, 6vw, 4.5rem)

The monospace display face is the brand signature (RF/signal voice). Keep it.
Body copy stays Plus Jakarta at a comfortable measure (≤ 60ch).

## Spacing
Fluid section rhythm, deliberately varied to break the uniform `py-24` cadence:
`--space-section-lg` for narrative beats (hero/manifesto), `--space-section-sm`
for supporting beats (ledger). Use named tokens, never raw values.

## Motion
- Easings: `--ease-out` cubic-bezier(0.16, 1, 0.3, 1); also `--ease-out-quart`,
  `--ease-out-quint`. Never the browser default `ease`, never bounce/overshoot.
- Reveal pattern: opacity + small y-translate (≤ 24px) on scroll-in, once.
- Reduced-motion fallback: opacity-only, ≤ 150 ms; spatial reveals collapse.

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
- The mono+sans pairing (Space Mono display, Plus Jakarta body).
- The warm-red accent and its ≤ 5% placement.
- The CTA pill voice (shape, mono label, arrow nudge).
- Eyebrow rhythm: mono uppercase tracking-[0.3em] label, stacked above heading.

## What pages MAY differ on
- Macrostructure within the family (home = Marquee Hero; `/life` = Long Document).
- Section padding rhythm (sm vs lg beats).

## Exports

### tokens.css
See [`tokens.css`](tokens.css) at project root — the canonical token source.

### Tailwind v4 `@theme`
```css
@theme {
  --color-paper:   oklch(0.15 0 0);
  --color-ink:     oklch(0.95 0 0);
  --color-accent:  oklch(0.63 0.25 28);
  --font-display:  "Space Mono", monospace;
  --font-body:     "Plus Jakarta Sans", sans-serif;
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`
```json
{
  "color": {
    "paper":  { "$value": "oklch(0.15 0 0)", "$type": "color" },
    "ink":    { "$value": "oklch(0.95 0 0)", "$type": "color" },
    "accent": { "$value": "oklch(0.63 0.25 28)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Space Mono", "$type": "fontFamily" },
    "body":    { "$value": "Plus Jakarta Sans", "$type": "fontFamily" }
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
  --muted-foreground:    0.55 0 0;
  --border:              0.95 0 0;
  --ring:                0.63 0.25 28;
  --radius:              9999px;
}
```
