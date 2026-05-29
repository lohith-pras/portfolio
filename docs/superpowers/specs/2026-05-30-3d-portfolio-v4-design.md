# 3D Portfolio v4 — Full Redesign Spec

**Date:** 2026-05-30  
**Branch:** feat/v4  
**Owner:** Lohith Tarikere Prasanna (Lo)  
**Audience:** Recruiters/hiring managers at Huawei, Siemens Healthineers, Qualcomm, Schaeffler, Fraunhofer IIS  
**Role targets:** RF & Wireless / Embedded & Automotive EV / AI/ML & Data Pipelines (Werkstudent/internship, Bavaria)

---

## Problem

Current home page gives zero recruiter signal. No domains, no stack, no education, no experience. A recruiter for GenAI/IoT/RF roles bounces immediately — nothing to grab. The portfolio reads as a design showcase, not a technical portfolio.

## Goals

1. Signal Lo's three career streams (RF/Wireless, Embedded/EV, AI/ML) without reading like a CV
2. Replace ShaderGradient hero with a custom R3F scene that ties to the RF/signal background
3. Add "The Work" section: domain cards with R3F micro-scenes per domain
4. Wire existing `PhaseTimeline` component as an Experience/Education section
5. Restore project detail pages (deleted on this branch)
6. Full 3D feel with scroll-driven motion throughout

---

## Architecture

### WebGL Context Strategy

Multiple `Canvas` elements = multiple WebGL contexts. Browsers limit contexts (8–16); mobile crashes. **Solution:** single root `Canvas` at layout level using `@react-three/drei`'s `View` system. Each 3D section renders into its own `View` (DOM-attached), all sharing one context.

Existing violations to migrate:
- `ChibiCanvas` → convert to `View`
- `PlaceScene` → convert to `View`

Root canvas lives in `src/components/R3FRoot.tsx`, mounted in `[locale]/layout.tsx`.

### Motion Spine

- **GSAP ScrollTrigger** for scroll-driven 3D camera control (consistent with existing `ShaderCanvas` fade — do NOT use drei's `ScrollControls`, which conflicts with the `View` system)
- Framer Motion for 2D layer animations (section entrances, card lifts)
- GSAP for timeline scrubbing and the hero name scramble (unchanged)
- All animations honor `prefers-reduced-motion`

### Easing Vocabulary

One authored curve set, reused everywhere. No bare `ease` / `ease-in-out` (reads AI-generic). Define as tokens (`src/lib/motion.ts`) so GSAP, Framer, and CSS share them.

| Token | Curve | Used for |
|---|---|---|
| `enter` | `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out) | Section enters, card lifts, experience stagger |
| `exit` | `cubic-bezier(0.4, 0, 1, 1)` (in) | Section leaves / disperse — subtler than enter |
| `hover` | `cubic-bezier(0.34, 1.3, 0.64, 1)` (slight overshoot) | Card hover lift, hover `speedMultiplier` ramp |
| `scrub` | `none` (linear) | GSAP ScrollTrigger camera — driven by scroll position, not time |
| `signature` | Framer spring `{ stiffness: 200, damping: 26, bounce: 0 }` | Card tilt pointer-follow (no wobble) |

Durations: section enters 400–500ms (Jakub polish range), hover transitions 150–200ms (never instant), hero converge 1.5s (once, on mount).

### Reduced-Motion Contract (per surface)

`prefers-reduced-motion: reduce` is not "skip some" — every animated surface has an explicit static target. Codebase already gates per-component (`ShaderCanvas`, `ProjectCard`, `PhaseTimeline`); spec extends that.

| Surface | Full motion | Reduced-motion target |
|---|---|---|
| Hero `SignalField` | particle converge + drift + parallax + scroll camera | static radial gradient (existing fallback) |
| Domain micro-scenes | infinite `useFrame` loop | render **one static frame**, no `useFrame`; or still poster image |
| Scroll camera (GSAP) | Z pull-back on scroll | fixed Z, ScrollTrigger not registered |
| Mouse parallax (hero ±5°) | pointer-tilt field | disabled, no `pointermove` listener attached |
| Card tilt (±8°) | pointer-follow spring | disabled, flat card |
| Experience stagger | sequential slide-up | all entries visible at once, no transform |
| Domain tag / card stagger | sequential pop | instant, all visible |

Implementation: single `useReducedMotion()` (Framer) at section root; for R3F, gate `useFrame` body on the flag and skip listener `useEffect`s.

### Idle-Still + Offscreen-Pause Strategy

5 micro-scenes + 3000-particle hero must not all animate forever. `View` renders every attached view each frame regardless of viewport.

- **Offscreen pause:** each `DomainCard` `View` gates its `useFrame` on an `IntersectionObserver` / drei `useInView`. Not in viewport → no per-frame work.
- **Idle-still:** in-viewport but not hovered → scene near-static (minimal drift). Lively motion lives in the hover `speedMultiplier` ramp — makes hover feel earned, keeps the page calm.
- **Root canvas:** prefer `frameloop="demand"` + manual `invalidate()` on active scenes over always-on `frameloop="always"`.
- **GPU policy:** resolve the `powerPreference` contradiction — either lean scenes that genuinely run `"low-power"`, or `"high-performance"` + the pause strategy above. Do not request low-power while feeding high-power work.

---

## Section 1 — Hero (Replace ShaderGradient)

### Concept: Signal Field

Replace `ShaderGradientCanvas` with a custom R3F scene (`SignalField.tsx`).

**Scene:** ~3000 particles in a shallow 3D plane. Particles drift in sine-wave interference patterns physically analogous to EM wave propagation. Two wave sources at opposite edges create a standing wave pattern in the center.

**Colors:** existing palette — `#FF4500` (electric orange) → `#C0001A` (deep crimson) → `#0A0A0A`. Particles fade to near-black at edges via distance attenuation in the shader.

**Load animation:** particles start scattered (random positions), converge into wave formation over 1.5s on mount.

**Scroll:** camera pulls back slowly in Z as user scrolls hero; particles disperse at hero exit. GSAP ScrollTrigger drives camera Z position.

**Mouse:** subtle parallax tilt of the entire field (±5°) via pointer move event.

**Performance:** custom `Points` geometry, single `ShaderMaterial` (vertex + fragment). `powerPreference` per GPU policy (see Architecture → Idle-Still). Reduced motion: static radial gradient fallback (same as current).

**Signal-first:** hero DOM content (name, contact links) renders immediately on top of the converging field — do NOT gate text on the 1.5s converge. Recruiter must read before they bounce.

**Files:**
- `src/components/SignalField.tsx` — R3F scene component (View-aware)

Shaders written as inline template strings in `SignalField.tsx` (no `.glsl` files — Next.js requires webpack config for GLSL imports; inline avoids that dependency).

**Hero content unchanged:** name scramble, grain toggle, scroll caret, contact links.

---

## Section 2 — About (light addition)

No structural changes. Add domain tags below the bio paragraphs:

```
RF/5G   Embedded/EV   AI/ML   Signal Processing   IoT
```

Styled: small mono text, `text-accent/70`, pill border `border-accent/20`. Framer stagger on scroll-in. `useTranslations` key `about.domain_tags` (array).

---

## Section 3 — Domains ("The Work")

### Layout

New section below About. Heading: **"The Work"** (not "Skills").

Desktop: CSS grid `grid-cols-3` — 5 cards fill 3+2 rows (last card spans or is centered).  
Mobile: single column stack.

### Cards

Each `DomainCard` has:
- Domain name (display font, accent color)
- 2–3 key tools/concepts (mono tags)
- R3F micro-scene via `View` (top portion of card, fixed aspect ratio)
- Hover: Framer spring `y: -8`, `boxShadow` intensifies, `border-accent/40` → `border-accent/80`

### Micro-Scenes

All share the root Canvas via `View`. Animation rate doubles on card hover (uniform `speedMultiplier` prop).

| Domain | Scene | Key visuals |
|---|---|---|
| **AI/ML** | `NeuralNetScene` | ~20 nodes, weighted edges, activation pulses traveling along edges |
| **RF / 5G** | `WaveformScene` | Two orthogonal 3D sine wave planes, animated phase offset (MIMO analogy) |
| **Embedded / EV** | `CircuitScene` | PCB-style trace grid, particle signals traveling along traces |
| **Signal Processing** | `SpectrumScene` | 3D FFT bar chart, bars morphing between noise → clean tone → impulse |
| **IoT** | `NodeMeshScene` | Connected sphere graph, nodes pulsing, data packet particles between nodes |

All scenes: transparent background, same orange/crimson palette, `powerPreference` per GPU policy (Architecture → Idle-Still), offscreen-paused + idle-still per the same section.

### Files

- `src/components/DomainsSection.tsx`
- `src/components/DomainCard.tsx`
- `src/components/domains/NeuralNetScene.tsx`
- `src/components/domains/WaveformScene.tsx`
- `src/components/domains/CircuitScene.tsx`
- `src/components/domains/SpectrumScene.tsx`
- `src/components/domains/NodeMeshScene.tsx`
- `src/lib/domains.ts` — domain data (name, tags, scene component)

---

## Section 4 — Projects (enhanced)

### Domain Tags

Add `domains: DomainKey[]` to each project in content MDX frontmatter. Tag pills displayed on `ProjectCard`, styled matching domain section tags.

Mapping:
- MIMO AI Channel Quality Tool → `rf-5g`, `ai-ml`, `signal-processing`
- Radar Object Classifier → `ai-ml`, `signal-processing`, `embedded-ev`
- VLC V2V prototype → `rf-5g`, `signal-processing`
- IoT Security → `iot`, `embedded-ev`

### 3D Card Tilt

CSS 3D perspective tilt on hover via `useSpring` + pointer position → `rotateX/Y`. Not R3F — pure Framer Motion `useMotionValue`. Max tilt ±8°. Applied in `ProjectCard.tsx`.

### Project Detail Pages

Restore `src/app/[locale]/projects/[slug]/page.tsx` (deleted on this branch). Each MDX project file gets sections:

- Problem / context
- Approach + key technical decisions
- Results / outcomes
- Tech stack tags

MDX files restored:
- `src/content/projects/en/mimo-ai-channel-quality-tool.mdx`
- `src/content/projects/en/radar-object-classifier.mdx`  
- `src/content/projects/en/vlc-v2v-communication.mdx`
- `src/content/projects/en/iot-security-project.mdx`
- Matching `de/` files

---

## Section 5 — Experience / Education

Wire `PhaseTimeline` (existing, unused) as a new `ExperienceSection`.

### Entries (reverse-chron)

1. **M.Sc. Electromobility — FAU Erlangen-Nuremberg** *(Current)*  
   AI & Connectivity track · MIMO systems · 5G/6G architectures · DSP

2. **Engineer Intern — National Instruments Dresden (Emerson)**  
   Python pipelines · ML diagnostics · LLM automation on RF measurement data

3. **Embedded Engineer — Delta X Automotive**  
   STM32 · FreeRTOS · CAN bus · EV embedded systems

4. **VLC Research Project — FAU**  
   OFDM · MIMO · Turbo Coding · V2V prototype

### Style

- No printed year ranges — relative phrasing ("Current", etc.)
- Each entry: title line (display font), org name (mono, subdued), one-line descriptor, tech tags
- Scroll-driven stagger: entries slide up + fade in sequentially as section enters viewport
- `i18n` keys under `experience.*`

### Files

- `src/components/ExperienceSection.tsx` — wraps `PhaseTimeline`
- `src/lib/experience.ts` — experience data

---

## Page Composition (updated `page.tsx`)

```tsx
<ShaderCanvasWrapper />     // → becomes R3FRoot (single Canvas + Views)
<HeroSection />             // → SignalField replaces ShaderGradient
<AboutSection />            // + domain tags
<DomainsSection />          // NEW
<ProjectsSection />         // + domain tags + tilt
<ExperienceSection />       // NEW
```

`PlacesSection` stays on `/life`. No changes to Life page.

---

## Open Questions / Deferred

- Nav scroll-spy (home sections) — not in this spec, noted in PROJECT-STATUS as open
- Scroll caret in Hero — still `animate-bounce`, scroll-driven upgrade deferred
- `PhaseTimeline` internal component may need props audit before wiring
- Projektarbeit deadline June — keep portfolio shippable, don't break existing sections mid-work

---

## Non-Goals

- Not replacing the Life page
- Not adding a contact form section (email in nav is sufficient)
- Not adding blog/writing section
- No CV photo or CV download on site
