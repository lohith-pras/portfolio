# Portfolio Vision & Ideas Board

Living document. Edit freely. No section is final — this is a thinking tool.

---

## Current State (v2 — active)

**Stack:** Next.js 15 · React 19 · React Three Fiber · Framer Motion · GSAP · shadergradient
**Palette:** `#FF4500` electric orange · `#C0001A` deep crimson · `#0A0A0A` near-black bg
**URL:** portfolio_v2

---

## Work In Progress — Quirky Elements (v2 additions)

Designed in brainstorm session 2026-05-23. Approach C selected (right tool per element).

### 1. Shader Gradient Tweak
- Add Red Bull Racing dark navy undertone to `color3`
- Change: `color3="#0A0A0A"` → `color3="#030B1A"`
- File: `src/components/ShaderCanvas.tsx`

### 2. EV Charging Scroll Transition
- Fixed overlay, active during Hero scroll zone (`z-10`, `pointer-events-none`)
- Minimal geometric SVG: angular EV silhouette + charging station post
- GSAP timeline, `scrub: true`, tied to `#hero` ScrollTrigger
- Scroll timeline:
  - 0–20%: EV drives in from right (`translateX: 200% → 0`)
  - 20–50%: cable extends + plugs in (SVG `stroke-dashoffset`)
  - 50–70%: charge pulse — lightning bolt + radial glow rings
  - 70–85%: cable retracts, EV drives off left
  - 85–100%: scene fades, About section fully revealed
- `prefers-reduced-motion`: hide or show static at 20% opacity
- New file: `src/components/EVTransitionScene.tsx`

### 3. MIMO Beamforming Simulator (homepage section, after Work)
- Stack: React Three Fiber (R3F) + HTML controls
- Component tree:
  ```
  MIMOSection.tsx
    SimulatorHeader.tsx
    MIMOSimulatorClient.tsx  ('use client')
      SimulatorCanvas.tsx    (dynamic import, ssr: false)
        AntennaArray.tsx     (4-element ULA, glowing cylinders)
        BeamPattern.tsx      (mode-aware cone geometry)
      SimulatorControls.tsx  (HTML controls)
  ```
- 3D scene: fixed perspective camera ~45° elevation, faint wireframe floor grid
- Antenna: 4 white cylinders with orange (`#FF4500`) point light glow
- Three interactive modes (tab switcher):

  | Mode | Geometry | Controls |
  |------|----------|----------|
  | Beamforming | Single `#FF4500` semi-transparent cone | Slider: steering angle −60° → +60° |
  | Null Steering | Orange cone + narrow inverse notch | Angle slider + draggable red jammer node |
  | MU-MIMO | 2–4 colored cones (orange, `#1434CB` RBR-blue, green, yellow) | Click floor to place/move up to 4 user nodes |

- Beam: `ConeGeometry` + `MeshBasicMaterial`, opacity 0.25–0.4, additive blending
- Steering: Framer Motion `useSpring` on `rotation.z`
- `prefers-reduced-motion`: static pose, controls still functional (instant position)
- New files: `src/components/mimo/` directory

### 4. Waving Flags (Life page)
- Location: `LifeClient.tsx` — new "Fandoms" subsection near hobbies
- Style: **vertical hanging banners** (candy bar / arena rafter style) — tall narrow portrait rectangles (~70px wide × 180px tall), suspended from a horizontal rod at the top
- Two banners in a horizontal row with gap:
  - **Red Bull Racing** — dark navy `#001489` bg, "MV3" in white/red, text centered
  - **RCB** — red `#D40024` bg, "VK18" in gold `#FFC906`, text centered
- Wave animation: vertical travelling wind wave — top anchored (zero amplitude), bottom free (~7px max)
  - 10 horizontal strips per banner, each `overflow: hidden`
  - Framer Motion `useAnimationFrame(t)`: `translateX = (i/9) * 7 * sin(SPEED * t + phase_i)`
  - Each banner has a different base phase offset (~0.8 rad) so they don't wave in sync
- No trademarked logos — colors + numbers only
- `prefers-reduced-motion`: banners render flat, no sway
- New file: `src/components/WavingFlag.tsx` — accepts `{ bgColor, accentColor, label, number }` props

---

## Future Vision — v3 Ideation

> Stack shift: Astro + React islands. Different from current Next.js v2.
> Palette shift: neon cyan `#00f5ff` + violet `#bf5fff`, Aurora UI aesthetic.
> These are ideas to revisit when starting v3 from scratch.

### Palette (unchanged from v2)
- Keep `#FF4500` + `#C0001A` + `#030B1A` — no palette shift for v3.

### Identity
- Owner: Lo — Electromobility M.Sc., FAU Erlangen-Nuremberg (AI & Connectivity)
- Domain: 5G/6G, MIMO, ISAC, cognitive radar, edge AI, LLM tooling

### Hero 3D Scene — Cognitive ISAC World Model
- Three.js radar point cloud + neural network overlay
- Hover: particles drift toward cursor, nearest cluster highlights with confidence tooltip
- Scroll: GSAP ScrollTrigger drives camera dolly into point cloud
- Click: glassmorphism overlay explaining ISAC, links to project

### Other 3D Scenes
- Projects section: live spectrogram sculpture (Three.js mesh, ML anomaly detection)
- About section: LLM agent workflow DAG with particle token flows
- Research section: Radar Environment Map builder with Bayesian update visual

### Easter Eggs (discoverable, never cheesy)
- **Loading:** F1 red lights sequence — 5 lights, 200ms apart, then site loads
- **Konami code:** "Chase Mode" — RCB red/gold palette flash, "Chase is ON" terminal line
- **Contact sent:** animated SVG dosa micro-animation, 2.5s then fades
- **Cursor idle 30s:** tiny F1 car drives across viewport bottom
- **Footer:** live IST clock + Kannada glyph ಬ at 10% opacity

### Tech Stack (v3)
- Framework: Astro + React islands
- 3D: Three.js r165+ with `InstancedMesh` for particles, Postprocessing lib for bloom
- Animation: GSAP 3 + ScrollTrigger only (no mixing)
- Glassmorphism: pure CSS `backdrop-filter`, Perlin noise breathing on cards

### Code Conventions (v3)
- All Three.js scenes lazy-loaded as Astro islands
- Keep draw calls under 100 per scene
- GSAP ScrollTrigger as single source of truth for scroll-driven animation
- CSS variables for all colors (never hardcode hex outside design tokens file)

---

## Color Reference

| Token | Hex | Use |
|-------|-----|-----|
| Electric orange | `#FF4500` | v2 primary accent, beam color |
| Deep crimson | `#C0001A` | v2 secondary accent |
| Near-black navy | `#030B1A` | v2 bg (updated — RBR dark blue bias) |
| RBR racing blue | `#001489` | Flag bg, MU-MIMO secondary beam |
| RBR beam secondary | `#1434CB` | Lighter blue for 3D beam in MU-MIMO |
| RCB red | `#D40024` | RCB flag bg |
| RCB gold | `#FFC906` | RCB flag text/number |
| *(v3 keeps v2 palette — no shift)* | — | — |

---

## Open Questions / Things to Decide Later

- [ ] EV car SVG: hand-craft or use an existing open-license illustration?
- [ ] MIMO section title: "Signal Explorer"? "MIMO Lab"? Something more personal?
- [ ] MU-MIMO max users: 4 feels right, but 3 might be cleaner visually
- [ ] Life page "Fandoms" section heading — keep that word or rename?
- [ ] v3: Astro vs staying on Next.js with a bigger redesign?
- [ ] v3: Aurora UI — which component library or custom?
- [ ] Easter eggs for v2 or wait for v3?
