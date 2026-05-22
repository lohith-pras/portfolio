# Phase 3 Plan: Hero

## Goal
Animate the Hero section. We will introduce the WebGL-powered animated shader gradient background, scramble entry animation for the main title `Lohith Tarikere Prasanna` using GSAP, and map the shader canvas opacity to scroll progress using GSAP ScrollTrigger to fade out the WebGL background cleanly as the user transitions to the About section.

---

## Requirements Mapping
This phase addresses the following requirements from `.planning/REQUIREMENTS.md`:
- [ ] **HERO-01**: Hero renders animated shader gradient — warm palette (`#FF4500` → `#C0001A` → `#0A0A0A`), slow deliberate movement.
- [ ] **HERO-02**: Hero displays full name `Lohith Tarikere Prasanna` in Space Mono, oversized with negative letter-spacing, plus contact row (`lnlohith3@gmail.com` · GitHub · LinkedIn).
- [ ] **HERO-03**: On page load, hero name plays GSAP character scramble animation that resolves to the real name within 600–800ms.
- [ ] **HERO-04**: As user scrolls toward About, GSAP ScrollTrigger scrubs shader gradient opacity 1→0 so gradient is fully gone by the time About is in view.

---

## Technical Design & Animation Flow

### 1. Shader Gradient Background (`components/ShaderCanvas.tsx`)
- **Package selection:** Use `@shadergradient/react` (or `shader-gradient` based on npm inspection).
- **Client component isolation:** WebGL requires Canvas context, which is client-only. We import the component dynamically with `ssr: false`:
  ```tsx
  const ShaderGradient = dynamic(
    () => import('shader-gradient').then((mod) => mod.ShaderGradient),
    { ssr: false }
  );
  ```
- **Configuration:** 
  - Palette: `#FF4500` (electric orange), `#C0001A` (deep crimson), and `#0A0A0A` (rich dark bg).
  - Settings: `uSpeed: 0.15` (low to protect CPU and integrated GPUs), `uStrength: 2.0`, `uDensity: 1.5`, `uFrequency: 3.5`.
  - Stacking Context: Placed fixed in the background: `fixed inset-0 z-0 pointer-events-none w-full h-full`.
  - CSS Layout Shift Prevention: Set explicit parent container height `h-screen w-full` to prevent cumulative layout shift (CLS) during hydration.

### 2. Title Scramble Animation (`components/HeroTitle.tsx`)
- **Visuals:** Space Mono font, fluid scale `clamp(3rem, 10vw, 9rem)`, tracking-tighter (`tracking-[-0.04em]`), leading-none.
- **GSAP Scramble Strategy:**
  - GSAP `ScrambleTextPlugin` is free to use. Register once in `lib/gsap.ts`.
  - In `components/HeroTitle.tsx`, use the `@gsap/react` `useGSAP` hook scoped to a title container.
  - Setup: Start with randomized, technical characters (symbols, hex numbers, matrix character sets) scrambling rapidly, then smoothly resolve to `Lohith Tarikere Prasanna` character-by-character over a `600ms - 800ms` window.
  - Fallback option: If there is any dependency resolving error with ScrambleTextPlugin, implement a custom robust typing/scramble utility using simple frame-based text swapping in the `useGSAP` scope to preserve zero dependency weight.

### 3. ScrollTrigger Fade Interface
- Wire the opacity scroll hook inside `app/[locale]/page.tsx` or `components/HeroSection.tsx`.
- Create a ScrollTrigger that pins or monitors the Hero section (`trigger: "#hero"`, `start: "top top"`, `end: "bottom top"`, `scrub: true`).
- Animate the shader canvas element from `opacity: 1` at scroll position `0` to `opacity: 0` when the top of the viewport reaches the bottom of the hero.
- Ensure the canvas unmounts or stops drawing completely when opacity is `0` if possible, or is set to `display: none` to release GPU cycles.

---

## Proposed Changes

### [NEW] `components/ShaderCanvas.tsx`
Self-contained client component that hosts the `@shadergradient/react` Canvas.

### [NEW] `components/HeroSection.tsx`
The full hero layout wrapper container. Hosts the name, contact links, and scroll-down indicator.

### [MODIFY] `lib/gsap.ts`
Register GSAP ScrollTrigger and ScrambleText plugins, ensuring they only initialize in client-side runtime environments.

### [MODIFY] `app/[locale]/page.tsx`
Mount `ShaderCanvas` and place the `HeroSection` above the `AboutSection`. Setup the ScrollTrigger linking the two sections.

---

## Verification Plan

### Automated Checks
- **Lighthouse Performance Scan (Mobile):** Confirm that loading the dynamic canvas doesn't push the score below 85.
- **GPU Resource Audit:** Inspect GPU frame rates via Chrome DevTools. Ensure idle GPU rendering stays below 15% utilization due to slow animation speeds.

### Manual Verification
- **Scramble Animation verification:** Refresh the page 5 times. Ensure the text resolves cleanly without breaking layouts or leaving scrambled characters.
- **Scroll fade verification:** Scroll slowly from Hero to About. Verify the shader canvas opacity decreases linearly with scroll, and becomes fully `#0A0A0A` pure black exactly when the About section is fully on screen.
- **Resize verification:** Test transition on mobile viewports. Check that the canvas scales correctly and doesn't leak bounds.
