# Phase 10: German MDX Translation Pass - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Translate all three project deep-dive body MDX files into German so that browsing project pages in the `/de` locale renders localized, high-quality, professional German content. Verifies that the Next.js production build statically generates these routes correctly without errors.

</domain>

<decisions>
## Implementation Decisions

### Translation Tone & Style
- **D-01:** Remove all placeholder markers such as `(DE)` from heading/titles.
- **D-02:** Translate technical terms into appropriate German professional language while maintaining standard industry terminologies where standard German equivalents are not typical (e.g., keeping "MIMO", "VLC V2V", "IoT" in titles/abbreviations but using correct German nouns like "MIMO-KI-Kanalqualitätstool").
- **D-03:** Ensure the structural markdown (headings like `## Phase 1`, `## Phase 2`, etc.) matches the English files exactly so that the frontend's phase timeline and other components sync up perfectly.

### Route and Build Safety
- **D-04:** Keep the files in `src/content/projects/de/` matching the exact filenames of their English counterparts in `src/content/projects/en/`.
- **D-05:** Verify that Next.js static page generation builds all German project slugs as static HTML pages during the production build pass (`npm run build`).

### the agent's Discretion
- Exact German phrasing and wording choice for maximum aesthetic and professional appeal.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Requirements
- `.planning/REQUIREMENTS.md` §I18N-V2-01 — German MDX translation requirements

### Route Handling & Dynamic Imports
- `src/app/[locale]/projects/[slug]/page.tsx` — Dynamic route rendering matching local path to MDX content
- `src/components/PhaseTimeline.tsx` — Phase Timeline visual component relying on the phase structure

</canonical_refs>

<specics>
## Specific Ideas

- The translated MDX files should read naturally and feel premium, consistent with the rest of the German UI translations in `messages/de.json`.
- Titles should be:
  - `iot-security-project.mdx` -> `# IoT-Sicherheitsprojekt`
  - `mimo-ai-channel-quality-tool.mdx` -> `# MIMO-KI-Kanalqualitätstool`
  - `vlc-v2v-communication.mdx` -> `# VLC-V2V-Kommunikation`

</specics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PhaseTimeline`: The phase timeline on project pages depends on `## Phase` headings inside the MDX. Keeping these exact headings ensures it continues animating correctly.

### Integration Points
- Dynamic import at `src/app/[locale]/projects/[slug]/page.tsx` reads `@/content/projects/${locale}/${slug}.mdx`.

</code_context>

<deferred>
## Deferred Ideas

- "What I'd do differently" sections (PROJ-V2-01) — Deferred to Milestone v2.0
- Code snippets + syntax highlighting (PROJ-V2-02) — Deferred to Milestone v2.0

</deferred>

---

*Phase: 10-german-mdx-translation-pass*
*Context gathered: 2026-05-22*
