---
status: "issues_found"
files_reviewed: 2
critical: 0
warning: 3
info: 1
total: 4
---
# Code Review Report

## Summary
The review of Phase 08 components (`PageTransition.tsx` and `PhaseTimeline.tsx`) uncovered a few logic issues with the animation sequencing in both components. The GSAP timeline is out of sync with its nodes, and the framer-motion transition creates a visual flash due to unmounting behavior. Additionally, there is a minor React encapsulation anti-pattern and a missing accessibility attribute. 

## Findings

### [WR-01] React Anti-Pattern: Direct DOM Selection
**File**: `/Users/lohith/Projects/Personal/portfolio_v2/src/components/PhaseTimeline.tsx`
**Description**: The component uses `document.getElementById('timeline-line')` to select the SVG line. This breaks React component encapsulation, bypasses the `useGSAP` hook's scoped selector mechanism, and will cause ID conflicts if multiple instances of `PhaseTimeline` are ever rendered on the same page.
**Recommendation**: Replace the `id` with a class name (e.g., `className="timeline-line"`) and use GSAP's scoped selector (e.g., `gsap.utils.toArray('.timeline-line')`), or attach a React `useRef` directly to the `<line>` element.

### [WR-02] Animation Timing Mismatch
**File**: `/Users/lohith/Projects/Personal/portfolio_v2/src/components/PhaseTimeline.tsx`
**Description**: The scroll-triggered GSAP timeline is out of sync. The line drawing animation uses GSAP's default duration (0.5s), but the nodes are scheduled at `0.25s`, `0.5s`, and `0.75s`. Furthermore, these uniformly calculated times do not visually align with the nodes' physical CSS positions (`top-[20%]`, `top-[50%]`, `top-[80%]`), meaning the line will bypass the nodes before they actually scale.
**Recommendation**: Assign an explicit duration to the line (e.g., `duration: 1`) and align the nodes' timeline insertion times with their visual positions (e.g., insert at time `0.2`, `0.5`, and `0.8` seconds).

### [WR-03] Visual Glitch in Page Transition Sequence
**File**: `/Users/lohith/Projects/Personal/portfolio_v2/src/components/PageTransition.tsx`
**Description**: Using `<AnimatePresence mode="wait">` causes the outgoing page to completely unmount before the incoming page mounts. Since the outgoing page overlay exits to `x: '0%'` (covering the screen), its sudden unmount will instantly reveal the background before the incoming page overlay slides in from `initial={{ x: '100%' }}`. This uncoordinated gap produces a jarring visual flash.
**Recommendation**: To maintain a continuous slide effect with `mode="wait"`, change the incoming overlay's `initial` state to `{ x: '0%' }` so it mounts exactly where the outgoing overlay left off, before animating to `-100%`.

### [IN-01] Missing ARIA Attributes on Decorative Elements
**File**: `/Users/lohith/Projects/Personal/portfolio_v2/src/components/PageTransition.tsx`
**Description**: The transition overlay (`<motion.div className="fixed inset-0 ...">`) is a purely decorative element but lacks an `aria-hidden="true"` attribute, which may cause screen readers to incorrectly perceive it as part of the page content structure.
**Recommendation**: Add the `aria-hidden="true"` attribute to the overlay `<motion.div>`.
