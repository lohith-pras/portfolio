# Phase 4 Plan: Work Section

## Goal
Implement the Work section, featuring an interactive SVG waveform divider drawn on scroll, a high-density responsive grid of project cards with distinct minimalist styling (only a bottom border, Space Mono headers, and active status tags), and a smooth GSAP stagger reveal as the user enters the section.

---

## Requirements Mapping
This phase addresses the following requirements from `.planning/REQUIREMENTS.md`:
- [ ] **WORK-01**: Work section opens with a full-width SVG waveform drawn by GSAP DrawSVG as the divider between About and Work.
- [ ] **WORK-02**: Project cards render in 2-column desktop / 1-column mobile grid — each card shows project name (Space Mono bold), one-line problem statement (Plus Jakarta Sans), status tag with `#FF1E00` dot, phase count, and `1px solid #FFFFFF` border-bottom only.
- [ ] **WORK-03**: Project cards enter from below via GSAP stagger reveal on scroll (0.08s stagger between cards).

---

## Technical Design & Layout

### 1. SVG Waveform Divider (`components/WaveformDivider.tsx`)
- Placed immediately above the Work section.
- **Visuals:** A detailed SVG line mimicking an analog or signal waveform (appropriate for Lohith's wireless and mobility background). The path is designed with raw SVG vectors:
  ```xml
  <svg viewBox="0 0 1440 100" fill="none" class="w-full h-auto">
    <path id="waveform-path" d="M0,50 Q120,0 240,50 T480,50 T720,50 T960,50 T1200,50 T1440,50" stroke="#FF1E00" stroke-width="2" />
  </svg>
  ```
- **Animation Strategy:**
  - GSAP `DrawSVGPlugin` is used. We animate `drawSVG: "0% 0%"` to `drawSVG: "0% 100%"` using a ScrollTrigger.
  - ScrollTrigger starts as the divider approaches the viewport (`trigger: "#waveform-trigger"`, `start: "top 85%"`, `end: "top 40%"`, `scrub: 1`).
  - Fallback option: If there is any environment bundling issue with DrawSVG, use native SVG `strokeDasharray` + `strokeDashoffset` dynamically animated via custom GSAP values to maintain absolute reliability.

### 2. Project Grid & Card Design (`components/ProjectCard.tsx` & `components/WorkSection.tsx`)
- **Layout Structure:**
  - Responsive Grid: `grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 px-6 md:px-16 max-w-7xl mx-auto`.
  - Content: 3 project cards (representing the required projects: MIMO AI, VLC V2V, IoT Security).
- **Project Card Styling (High Visual Discipline):**
  - Rigid, flat, structure: **No borders on left, right, or top. Only a bottom border: `border-b border-white`**.
  - No rounded corners, no soft shadows, no cards background. Highly responsive and clean.
  - Header: Space Mono bold, title font-size `clamp(1.5rem, 3vw, 2.5rem)`.
  - One-line problem statement: Plus Jakarta Sans, light weight, `text-white/70`, `clamp(1rem, 1.8vw, 1.2rem)`.
  - Status Tag: Flex layout, Space Mono text, green/red/orange dot (`#FF1E00` accent dot) representing current status (e.g., `Active`, `Done`, `Prototyping`).
  - Phase Count: e.g., `Phase 3 / 4` or `Completed` in small Space Mono bold.

### 3. Stagger Reveal Animation (`components/WorkSection.tsx`)
- In `components/WorkSection.tsx`, wrap cards in a layout wrapper.
- Use `@gsap/react` `useGSAP` hook:
  ```tsx
  useGSAP(() => {
    gsap.from(".project-card", {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#work-grid",
        start: "top 80%",
        toggleActions: "play none none reverse",
      }
    });
  }, { scope: containerRef });
  ```
- Scoped to `containerRef` to prevent conflicts or global targeting.
- Responsive handling: `gsap.matchMedia` can customize reveal offsets for smaller viewports if necessary.

---

## Proposed Changes

### [NEW] `components/WaveformDivider.tsx`
Handles the rendering and drawing animation of the SVG waveform line.

### [NEW] `components/ProjectCard.tsx`
The minimalist project card component containing name, description, status dot, and phase stats.

### [NEW] `components/WorkSection.tsx`
Hosts the divider, the title of the section, the grid of project cards, and initiates the stagger ScrollTrigger.

### [MODIFY] `app/[locale]/page.tsx`
Mount the `WaveformDivider` and the `WorkSection` below the `AboutSection`.

---

## Verification Plan

### Automated Checks
- **HTML Validity & Accessibility:** Inspect the generated DOM. Ensure all cards have proper semantic markup (`<article>`) and descriptive `aria-label` labels.
- **Scroll Performance check:** Scroll past the waveform divider at high speed. Ensure zero layout thrashing or stuttering.

### Manual Verification
- **Divider Drawing check:** Scroll slowly. Confirm the red waveform line draws itself from left to right as the divider scrolls into view.
- **Stagger check:** Observe card entrance when scrolling down. Ensure each card slides up sequentially with exactly 0.08s of stagger delay.
- **Visual Audit:** Confirm that the cards have NO background, NO shadows, and ONLY a clean `1px` white line border at the bottom.
