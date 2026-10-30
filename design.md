# Design — Lohith Tarikere Prasanna (portfolio_v2)

The locked system for this site. Read it before changing any page; extend this
file when the system needs to grow. Built with Hallmark (theme: Almanac), October 2026.

## Genre and shape
editorial. One page, shaped as a Conversational FAQ: each section is a question a
recruiter or researcher would ask, answered with the owner's own facts and figures.

Order: hero (name, thesis line, the engineering index) → What is my thesis about?
→ What did I ship at NI Dresden? → What do I build for fun? → Where have I lived?
→ What am I up to now? → Can we work together? → colophon footer.

## Tokens
Canonical source: [`src/app/tokens.css`](src/app/tokens.css) (Hallmark scaffold,
Almanac). Shared floor rules: [`src/app/base.css`](src/app/base.css). Page rules:
[`src/app/globals.css`](src/app/globals.css), whose first lines carry the Hallmark stamp.

- Paper: cool slate `--color-paper` oklch(84% 0.012 245), steps `-2`, `-3`; the
  printed sheet `--color-sheet` oklch(93.5% 0.008 245).
- Ink: blue-black `--color-ink` oklch(16% 0.020 245), `--color-ink-2`, `--color-muted`.
- Rules: `--rule-hair` 1px in `--color-rule`, `--rule-bar` 2px in `--color-rule-2`.
- Accent: chart magenta `--color-accent` oklch(45% 0.180 350). Under 5% of any
  screen: the primary button, link underlines, the one row the page points at.

## Type
- Display: Hanken Grotesk 600, sentence case, -0.02em (hero name -0.035em).
- Body: Newsreader 400/500.
- Figures: IBM Plex Mono, tabular, for numbers only.
- Labels, captions, table heads: Newsreader a step smaller, sentence case, muted.
  Never uppercase, never tracked, never mono.
Fonts load through `next/font/google` in `src/app/layout.tsx` and reach the
tokens as `--font-hanken`, `--font-newsreader`, `--font-plex-mono`.

## Surfaces
Square corners (2px on controls). No cards, no shadows: depth is a rule or a
paper step. Two bands a page at most: the NI band on `--color-paper-2` and the
contact band on `--color-ink`.

## Motion
Nothing moves except state: a row tint and an underline on hover, a 1px press on
buttons. No reveals, no scroll effects, no loaders.

## Voice
Declarative and exact: cite the figure, the unit, the place. Section heads are
questions of six words or so. No eyebrows, no hype adjectives, no dashes.

## Never
Invented metrics, quotes or logos; photographs captioned as places they do not
show; mono or tracked caps on labels; a second accent colour.
