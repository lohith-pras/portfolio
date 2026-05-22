---
phase: 10-german-mdx-translation-pass
reviewed: 2026-05-22T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/content/projects/de/mimo-ai-channel-quality-tool.mdx
  - src/content/projects/de/vlc-v2v-communication.mdx
  - src/content/projects/de/iot-security-project.mdx
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-05-22T00:00:00Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Three German MDX translation files were reviewed against the English source files and the project's stated requirements (D-01 through D-05 in 10-CONTEXT.md, REQUIREMENTS.md §I18N-V2-01). All files are syntactically valid MDX with no compilation blockers. The `## Phase 1 / 2 / 3` headings are preserved verbatim as required by D-03, ensuring PhaseTimeline animation continues to work.

However, the German translations consistently expand content well beyond what exists in the English source files. The English files are deliberately minimal stubs (one sentence per section), while the German files add multi-clause technical prose that has no English counterpart. This content asymmetry is not itself a code defect, but it introduces three quality risks: (1) the expanded German text contains one verifiable mistranslation/semantic error; (2) the expanded content was added without a corresponding English expansion, breaking the assumption of parity between locales that the dynamic-import pattern implies; and (3) a term-consistency issue exists across the three files in how "KI" (AI) is rendered versus what the system title uses.

---

## Warnings

### WR-01: German prose expands beyond English source — content parity is broken

**File:** `src/content/projects/de/mimo-ai-channel-quality-tool.mdx:3`, `src/content/projects/de/vlc-v2v-communication.mdx:3`, `src/content/projects/de/iot-security-project.mdx:3`

**Issue:** The English files contain exactly one short sentence per section (intro + three phases). The German files double or triple that sentence count with technical elaborations that do not exist in the English source (e.g., "aus realen MIMO-Messungen", "LED-Kalibrierung für die optische Übertragungsstrecke", "automatisierter Schwachstellenscan der eingebetteten Gerätefirmware"). If the English source is ever treated as the master/authoritative copy and re-synced or updated, all extra German content will be silently lost with no signal in diff review. Conversely, if a reader switches locale, they see substantially different project descriptions, which breaks the implicit contract that `/en` and `/de` describe the same project at the same depth.

The core risk is that the expanded German content is essentially orphaned — there is no English equivalent — so no reviewer can verify translation accuracy for the added sentences.

**Fix:** Either (a) expand the English source files to match the German prose (making German the richer version that drove the expansion) and document that German is the authored-first locale for this phase, or (b) strip the German files back to direct translations of the English stubs. The current asymmetric state is a maintenance trap.

---

### WR-02: Semantic mistranslation in mimo-ai-channel-quality-tool.mdx — "Kanalqualitätsprädiktion" vs. "Kanalqualitätsvorhersage"

**File:** `src/content/projects/de/mimo-ai-channel-quality-tool.mdx:9`

**Issue:** Phase 2 reads: "Training und Evaluierung von Regressionsmodellen zur Kanalqualitätsprädiktion." The compound noun "Kanalqualitätsprädiktion" mixes "Kanal" + "Qualität" + the Latin-root "Prädiktion." German technical writing in wireless/ML contexts consistently prefers "Kanalqualitätsvorhersage" (all-German roots) or "Kanalschätzung" when referring to channel estimation tasks. "Prädiktion" is not incorrect, but it is a false-register hybrid — it reads as if auto-translated — and contradicts the title of the same file, which uses the pure-German compound "Qualitätstool" (not "Prädiktionstool"). Within a single document, mixing Latin-borrowed "Prädiktion" with native-German "Qualitätstool" is inconsistent.

The intro on line 3 uses "Vorhersage" (the standard German word for prediction), making line 9's "Prädiktion" a direct intra-document inconsistency.

**Fix:** Replace line 9's "Kanalqualitätsprädiktion" with "Kanalqualitätsvorhersage" to match the terminology used on line 3:

```mdx
Training und Evaluierung von Regressionsmodellen zur Kanalqualitätsvorhersage.
```

---

### WR-03: PhaseTimeline component uses a global `document.getElementById` — German MDX pages share the same DOM ID risk

**File:** `src/components/PhaseTimeline.tsx:11` (cross-file, triggered by all three DE MDX pages)

**Issue:** `PhaseTimeline.tsx` queries `document.getElementById('timeline-line')` (line 11) rather than querying within its scoped `containerRef`. The SVG `<line>` element has `id="timeline-line"` (line 40). If two project pages are mounted simultaneously (which can happen with the `@modal` intercepting-route slot — both `page.tsx` and `@modal/(.)projects/[slug]/page.tsx` render `<PhaseTimeline />`), both instances of the component will resolve to the same single DOM element. The first instance's GSAP ScrollTrigger will control it, and the second instance will silently animate the wrong element. This is a pre-existing bug that this phase does not fix and actively surfaces because all three German project pages now render the component.

**Fix:** Replace the global `getElementById` with a ref-scoped query:

```tsx
// In PhaseTimeline.tsx — use containerRef scope, not global document
useGSAP(() => {
  const line = containerRef.current?.querySelector('#timeline-line')
  // ...
}, { scope: containerRef })
```

Or assign a `ref` directly to the `<line>` SVG element and pass it to GSAP, removing the `id="timeline-line"` entirely.

---

## Info

### IN-01: No MDX frontmatter — downstream metadata extraction is impossible

**File:** `src/content/projects/de/mimo-ai-channel-quality-tool.mdx:1`, `src/content/projects/de/vlc-v2v-communication.mdx:1`, `src/content/projects/de/iot-security-project.mdx:1`

**Issue:** None of the three German MDX files (nor the English source files) contain YAML frontmatter (`title`, `description`, `date`, `tags`). The page currently renders without metadata, but `generateMetadata()` in `page.tsx` does not exist at all — meaning the German project pages emit no `<title>` or `<meta name="description">` tags. This is a missed SEO opportunity for the German locale specifically, since `/de/projects/[slug]` pages are public routes.

**Fix:** Add a frontmatter block to each German MDX file and implement `generateMetadata` in `page.tsx` to read it. Example for `mimo-ai-channel-quality-tool.mdx`:

```mdx
---
title: MIMO-KI-Kanalqualitätstool
description: Vorhersage der Kanalqualität in MIMO-Systemen mit maschinellen Lernmodellen.
---

# MIMO-KI-Kanalqualitätstool
...
```

---

### IN-02: "Kanalqualitätstool" compound noun capitalization is non-standard

**File:** `src/content/projects/de/mimo-ai-channel-quality-tool.mdx:1`

**Issue:** The `h1` title "MIMO-KI-Kanalqualitätstool" follows the spec (D-02 in 10-CONTEXT.md), but "tool" as the last element of the compound is written in lowercase ("tool" is an English loanword in German). German loanword orthography requires capitalizing the initial letter when the loanword forms the base word of a compound noun: "MIMO-KI-Kanalqualitäts**T**ool". This matches Duden guidance for anglicisms used as base nouns. As written, "tool" reads as an uninflected suffix rather than a recognized noun.

**Fix:**

```mdx
# MIMO-KI-Kanalqualitätstool
```
should be:
```mdx
# MIMO-KI-Kanalqualitäts-Tool
```

The hyphen before "Tool" separates the English noun visually and satisfies standard German compound-with-anglicism rules, matching how "Smart-Home" (iot-security-project.mdx line 3) is correctly hyphenated in this same codebase.

---

### IN-03: iot-security-project.mdx uses "Eindämmungsmaßnahmen" — non-standard security register

**File:** `src/content/projects/de/iot-security-project.mdx:12`

**Issue:** Phase 3 reads: "Entwicklung von Eindämmungsmaßnahmen und Erstellung des abschließenden Sicherheitsberichts." The word "Eindämmungsmaßnahmen" (containment measures) is drawn from epidemiological/disaster management German, not IT security German. The standard German cybersecurity term for "mitigation measures" is "Gegenmaßnahmen" or "Abhilfemaßnahmen" (the latter is used in BSI-Grundschutz documentation). Using "Eindämmungsmaßnahmen" in a security context reads as register misalignment and will look odd to a German-speaking security professional.

**Fix:**

```mdx
Entwicklung von Gegenmaßnahmen und Erstellung des abschließenden Sicherheitsberichts.
```

---

_Reviewed: 2026-05-22T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
