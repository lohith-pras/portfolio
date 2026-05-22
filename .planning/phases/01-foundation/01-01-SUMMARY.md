# Phase 01 Plan 01 — SUMMARY: Next.js Scaffold + Design Tokens

**Phase:** 01-foundation
**Plan:** 01
**Completed:** 2026-05-22
**Status:** ✓ Complete

## What Was Built

Manually bootstrapped a Next.js 15.5.18 App Router project with TypeScript and Tailwind CSS v3.4.x in the existing project root. `create-next-app` was skipped because the project root already contained `.git`, `.planning`, `.agent`, and `CLAUDE.md` — the tool refused to run. Instead, all files were created directly.

### Files Created

| File | Purpose |
|------|---------|
| `package.json` | Project manifest with Next.js 15, React 19, Tailwind v3.4 |
| `tsconfig.json` | TypeScript strict mode, `moduleResolution: bundler`, `paths: @/*` |
| `next.config.mjs` | Minimal Next.js config (extended in Plan 02 with next-intl) |
| `tailwind.config.js` | Design tokens: `#0A0A0A` bg, `#FF1E00` accent, `#F0F0F0` fg; font CSS var references |
| `postcss.config.mjs` | ESM PostCSS config for Tailwind + Autoprefixer |
| `.eslintrc.json` | ESLint with next/core-web-vitals + next/typescript |
| `.gitignore` | Standard Next.js ignore patterns |
| `src/app/globals.css` | Tailwind directives + CSS custom properties + fluid type scale (clamp) |
| `src/app/layout.tsx` | Root layout loading Space Mono + Plus Jakarta Sans via next/font/google |
| `src/app/[locale]/layout.tsx` | Minimal locale layout shell (extended in Plan 02) |
| `src/app/[locale]/page.tsx` | Phase 1 shell page (replaced in Phase 2) |

### Design Tokens Applied

- Background: `#0A0A0A`
- Foreground: `#F0F0F0`
- Accent: `#FF1E00`
- Accent Warm: `#FF4500`
- Accent Crimson: `#C0001A`

### Fluid Type Scale (FOUND-02)

```css
--type-hero:       clamp(3rem, 10vw, 9rem)
--type-heading:    clamp(2rem, 6vw, 4.5rem)
--type-subheading: clamp(1.5rem, 3.5vw, 3rem)
--type-body:       clamp(1rem, 2vw, 1.2rem)
--type-small:      clamp(0.8rem, 1.5vw, 0.95rem)
```

### Fonts

Space Mono and Plus Jakarta Sans loaded via `next/font/google` with CSS variable mode:
- `--font-space-mono` → `.font-display` / `font-family: display`
- `--font-plus-jakarta` → `.font-body` / `font-family: body`

Courier Prime intentionally NOT loaded here (loads only in `/life` layout in Phase 7).

## Verification

- ✅ `npm install` — 356 packages installed clean
- ✅ `npx next build` — passes with 0 errors
- ✅ TypeScript strict mode compiles clean
- ✅ globals.css contains `clamp(3rem, 10vw, 9rem)`
- ✅ tailwind.config.js contains `#0A0A0A` and `#FF1E00`
- ✅ layout.tsx imports `Space_Mono` and `Plus_Jakarta_Sans` from `next/font/google`

## Decisions Made

- **Tailwind v3.4.x** (not v4) — `@tailwindcss/typography` doesn't have stable v4 support yet; needed for MDX prose in Phase 5
- **Manual scaffold** (not `create-next-app`) — existing files in root caused tool conflict
- **`tailwind.config.js`** (not `.ts`) — simpler for CJS-mode Tailwind config
