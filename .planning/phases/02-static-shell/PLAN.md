# Phase 2 Plan: Static Shell

## Goal
Establish the static layout and visual composition of the Navigation (desktop and mobile) and the About section. All content is driven by static i18n strings (`next-intl`), with no animations or dynamic WebGL components mounted yet. This allows review of typography, layouts, responsive scaling, and copy in isolation.

---

## Requirements Mapping
This phase addresses the following requirements from `.planning/REQUIREMENTS.md`:
- [ ] **NAV-01**: Desktop shows transparent top nav — site name left, links right (`About / Work / Life / Contact`), EN/DE toggle.
- [ ] **NAV-02**: Mobile shows fixed bottom bar with same links as icons or short labels + EN/DE toggle.
- [ ] **NAV-03**: Resume/CV is downloadable from nav or contact section.
- [ ] **ABOUT-01**: About section renders a static illustration (SVG or PNG) that occupies the model's position — visible on all screen sizes in v1.
- [ ] **ABOUT-02**: About section displays a short Space Mono descriptor line (1–2 lines) plus 3–4 sentences in Plus Jakarta Sans — authentic voice.

---

## Technical Design & Component Hierarchy

### 1. Navigation Components
We will implement a responsive `Navigation` component that splits into a desktop-only top navbar and a mobile-only fixed bottom navbar.

- **Desktop Top Nav (`components/NavbarDesktop.tsx`):**
  - Container: `fixed top-0 left-0 w-full h-16 flex items-center justify-between px-8 md:px-16 z-50 bg-transparent backdrop-blur-sm border-b border-white/5`
  - Left: Brand Name (`L.T. Prasanna` or `Lohith`) in Space Mono bold, clicking scrolls to top.
  - Right: Horizontal list of links (`About`, `Work`, `Life`, `Contact`) in Space Mono, styled with a minimal hover underline.
  - Locale Switcher: Standard clean select or toggle buttons (`EN / DE`) next-intl-compliant.

- **Mobile Bottom Nav (`components/NavbarMobile.tsx`):**
  - Container: `fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md h-14 flex items-center justify-around px-6 z-50 bg-[#0A0A0A]/90 border border-white/10 rounded-full backdrop-blur-md shadow-2xl`
  - Elements: Minimal icons (e.g., Lucide React icons for User, Briefcase, Heart, Mail) paired with small text labels or standalone sleek icons, plus a miniature language toggle.
  - Ensures compliance with "no floaty pills on desktop" while providing an extremely thumb-friendly app-like experience on mobile devices.

### 2. About Section Component (`components/AboutSection.tsx`)
- Container: `min-height: 100svh`, full-width section with a responsive grid.
- Layout: 
  - Desktop: 2-column grid (`grid grid-cols-2 gap-12 items-center px-16 max-w-7xl mx-auto`).
  - Mobile: 1-column layout (`flex flex-col-reverse justify-center gap-8 px-6`).
- Left Column (Text Content):
  - Descriptor: 1-2 lines of large text (e.g., `clamp(2rem, 4vw, 3rem)`) in Space Mono bold, using the brand accent color `#FF1E00`.
  - Body: 3-4 highly engaging sentences in Plus Jakarta Sans, styled with premium line-height (`leading-relaxed`) and subtle opacity (`text-white/80`) to emphasize hierarchy.
- Right Column (Illustration Column):
  - In v1, this contains a high-quality static vector illustration or optimized PNG placeholder representing the developer persona (abstract outline, schematic representation, or sleek line drawing).
  - Designed with explicit aspect ratio bounding box (`aspect-square w-full max-w-[400px] mx-auto`) to reserve space so when the Spline 3D character is added in v2, it does not cause any layout shift.

### 3. File Infrastructure
- **PDF Resume:** Put a placeholder or static `resume.pdf` in `/public/Lohith_Prasanna_Resume.pdf`.
- **i18n Translation Schema:**
  - Add navigation and bio translations in `messages/en.json` and `messages/de.json`.
  
---

## Proposed Changes

### [NEW] `components/NavbarDesktop.tsx`
Desktop transparent top navigation component. Consumes next-intl routing for seamless EN/DE switching.

### [NEW] `components/NavbarMobile.tsx`
Mobile bottom-fixed tab bar with smooth touch targets and locale toggle.

### [NEW] `components/AboutSection.tsx`
The static layout of the About section, displaying the bio copy and the vector illustration placeholder.

### [MODIFY] `app/[locale]/page.tsx`
Mount the static sections sequentially in the home page template.

---

## Verification Plan

### Automated Checks
- **Lighthouse Performance Scan:** Ensure standard paint scores are 100 on desktop and >= 90 on mobile (no JS-heavy scripts, no WebGL).
- **TypeScript & ESLint compilation:** Ensure strict typings compile cleanly without any `any` type escapes.
- **Build Output:** Run `npm run build` and ensure route paths are statically built as `○` (Static).

### Manual Verification
- **Responsive Layout check:** Resize viewport from `320px` to `2560px` to ensure zero overlapping or broken layouts.
- **i18n segment check:** Navigate manually to `/en` and `/de` and verify nav labels and about descriptions change correctly.
- **Resume Download link:** Click the resume link on desktop and mobile and confirm the browser initiates the download of `/Lohith_Prasanna_Resume.pdf`.
