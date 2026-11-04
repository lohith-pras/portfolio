# Site outline

Working file: `mockups/v3.html`. Frozen baseline (agreed 2026-11-04): `mockups/v3-baseline.html`.
References: `insp/README.md`. Plan: refine one section per session, then port into the Next.js app.

## System (locked for now)

| | Decision |
|---|---|
| Theme | Setience: black `#000`, cream ink `#f2eae3`, warm-grey tiles `#d0c9c3`, red accent `#ff073a` used sparingly |
| Project cards | Intown navy `#21304e` (table block, dots and highlights inside the light panels) |
| Type | Geist 300/400 for text and headings, Geist Mono for labels, Doto (dot matrix) only for section numbers |
| Motion | Reveal on scroll, work panel opens once from the right edge, slides change inside it. Off under reduced motion |
| Imagery | Drawn SVG diagrams (exploded, isometric, pipeline) on plain paper; real photos later. No AI renders |
| Chrome | Fixed nav, tiny corner labels, layer gauge on the right (desktop) |

## Sections

| # | Section | What it does now | Refine next | Needs from you |
|---|---|---|---|---|
| — | Hero | Status line, one sentence, scroll cue, giant LOHITH | Wording of the sentence; whether anything should move | — |
| 01 | About | Small photo + two sentences | Better photo; tone | A photo you like |
| 02 | Range | Coverage map: projects × layers (RF → signal processing → models → hardware); hover isolates, click opens the project | Cell wording, order of columns, mobile | Check every cell is accurate |
| 03 | Work | One light panel, four project pages (Fraunhofer, ISAC thesis, NI, Delta X): intro, headline number, readouts, navy table, drawing | Each drawing in detail; "Details" and "Full case study" targets; transition polish | Nicla ↔ Brainboard interface; thesis results; Fraunhofer numbers you can share |
| 04 | Builds | Featured RF modulation classifier with accuracy bars, six smaller builds | Links, screenshots, maybe a featured build rotation | GitHub links |
| 05 | Outside work | F1, RCB, three cities, German A2 | Makeover (parked) | Photos or a line each |
| 06 | Contact | Big line + email, LinkedIn, GitHub, CV | Final CTA wording | Updated CV with Fraunhofer |

## Open facts

- ISAC: CV says deep RL solver is being investigated; site copy claims PPO results (97.7 %, 4.2 W). Headline uses "≤ 0.5 m" from site copy. Confirm.
- Fraunhofer is not on either CV yet.
- `public/Lohith_Prasanna_Resume.pdf` is older than `~/Documents/Career/inputs/cv/master.pdf`.

## After the mockup

Port to `src/` (Next.js + next-intl, EN/DE in `messages/`), drop the theme switcher, keep tokens as CSS variables.
