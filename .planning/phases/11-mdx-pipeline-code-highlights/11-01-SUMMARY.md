---
plan: 11-01
phase: 11-mdx-pipeline-code-highlights
status: complete
completed: 2026-05-22
commit: c5f237a
---

# 11-01 Summary: MDX Pipeline + Code Highlights

## What Was Built

The MDX rendering pipeline now supports Shiki-powered syntax highlighting at **build time** via `rehype-pretty-code`. This introduces zero runtime JavaScript overhead, preserving the Lighthouse mobile ≥ 85 performance target.

## Changes

### package.json
- Added `rehype-pretty-code@^0.14.3`
- Added `shiki@^4.1.0`

### next.config.mjs
- Imported `rehype-pretty-code` and wired it into `createMDX` options under `rehypePlugins`.
- Configured the `vesper` dark theme — warm dark color palette matching the portfolio's electric orange / deep crimson branding.
- Added `onVisitLine`, `onVisitHighlightedLine`, and `onVisitHighlightedChars` callbacks for future line-highlight support.

### mdx-components.tsx
- Added `pre` override: `bg-[#0d0d0d]`, `rounded-xl`, `border border-white/10`, `overflow-x-auto`, and `shadow-lg`.
- Added smart `code` override: detects `data-theme` / `data-language` props (set by rehype-pretty-code on block code) to switch between:
  - **Block code** → renders cleanly with Shiki token colors, no style collision.
  - **Inline code** → accent orange/warm text (`#FF6B35`), subtle `bg-white/5` background, border.

### src/content/projects/en/mimo-ai-channel-quality-tool.mdx
- Added temporary Python smoke-test code block to validate end-to-end rendering.

## Verification

- `npm run build` passed: ✓ 20/20 static pages generated
- TypeScript: no type errors
- All 6 project slugs compiled (3 EN + 3 DE)

## Self-Check: PASSED

## Key Files Created/Modified
- key-files:
  - created: []
  - modified:
    - package.json
    - next.config.mjs
    - mdx-components.tsx
    - src/content/projects/en/mimo-ai-channel-quality-tool.mdx

## Deviations
- Used `onVisitHighlightedChars` instead of `onVisitHighlightedWord` (renamed in rehype-pretty-code v0.14.x API — `onVisitHighlightedWord` is the old v0.13 name).
