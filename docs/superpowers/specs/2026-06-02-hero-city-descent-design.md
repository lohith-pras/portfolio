# Hero — Orbital Descent into the Autonomous City Twin

**Date:** 2026-06-02
**Branch:** `feat/hero-bg`
**Status:** Design approved, ready for implementation plan
**Ambition:** Tier 2 (hero-anchored, pinned camera beats) + cinematic cold-open. Timeline ~1–2 months, build it properly.

---

## 1. Concept

A scroll-driven cinematic descent that opens the portfolio. We start in a black void looking at a holographic porthole, dive through it, fall through clouds, and break through to reveal a living wireframe autonomous-city digital twin below. The camera then flies three beats through the city — one per tagline pillar (Connectivity → AI → Electromobility) — before handing off to the normal content sections.

Metaphor: **"We model the real world, then dive into our model."** The descent from orbit through atmosphere onto the digital twin is the narrative spine. The three-word tagline *is* the camera path.

This replaces `SignalField` as the hero background.

### Locked decisions

| Decision | Choice |
|---|---|
| Ambition tier | Tier 2 — hero-anchored, pinned beats (not site-wide, not full sim) |
| Beat structure | 3 beats = 3 pillars: Connectivity → AI → Electromobility |
| Cold-open | Porthole → dive → clouds → city reveal → beats |
| Porthole look | Holographic brand-match (cyan/dark-metal ring, node-bolts on black) |
| Porthole fate | Dissolves on entry; re-forms on scroll-back (free with scrubbed timeline) |
| Clouds | Literal soft clouds, rendered as layered sprite billboards (not volumetrics) |
| City render style | Pure wireframe (LineSegments / Points / instanced + additive blending) |
| Dimensionality | Fully 3D — real depth, vehicles + drones move in true 3D space |
| Palette | Black `#000000`, electric cyan `#00F5FF`, white, subtle gray `#111111` |

### Not negotiable (constraints)

- It is a **background / hero**: cheap, must not steal focus from content, must degrade gracefully.
- Respect `prefers-reduced-motion`.
- Phone-safe: ≥30fps on mid-range mobile, 60fps desktop.

---

## 2. Experience storyboard

Hero pins; scroll scrubs a single master progress value `0→1`. Every subsystem reads off that one value.

```
prog     phase            what happens
──────────────────────────────────────────────────────────────────────────
.00–.10  PORTHOLE   Black void. Holographic cyan ring centered. Breathes,
                    faint scanline sweep. Small "scroll to enter" caret.
.10–.28  ENTER      Camera dollies into the ring. Ring scales past the frame,
                    glass flares, dissolves. (scroll up here → porthole re-forms)
.28–.50  CLOUDS     Fly through layered soft clouds, cyan-rimmed, on a dark sky
                    that dissolves toward black as we punch through.
.50–.65  REVEAL     Clouds part below → city draws itself in, far down.
                    "Systems ignite" glow wave sweeps out. Title scrambles in:
                       Lohith Tarikere Prasanna
                       Electromobility · AI · Connectivity
.65–.77  BEAT 1 ⟶ CONNECTIVITY  descend toward streets; V2X links pulse between
                    vehicles + roadside nodes; data packets travel the links.
.77–.89  BEAT 2 ⟶ AI            camera lifts; wireframe neural-net plane rises
                    ABOVE the city, nodes wired to ground points, pulses run edges.
.89–1.0  BEAT 3 ⟶ ELECTROMOBILITY  pan to a charging cluster; cyan energy streams
                    flow grid → station → vehicle in 3D arcs.
──────────────────────────────────────────────────────────────────────────
unpin → About / Projects / Places (existing sections, unchanged)
ALWAYS ON: slow camera idle drift + mouse parallax. Never fully static.
```

Title timing: porthole phase shows only a minimal "scroll to enter" cue; the full name + tagline resolve during REVEAL (`.50–.65`) and stay pinned + readable across all three beats.

---

## 3. Architecture

Reuses the existing single-Canvas + drei `View` model ([R3FRoot.tsx](../../../src/components/R3FRoot.tsx)). No new canvas. One `View` on a pinned stage, one camera, phase-gated subsystems.

```
src/components/hero/
  HeroStage.tsx        pinned scroll container; GSAP ScrollTrigger scrub → progress 0..1
src/components/city/
  CityView.tsx         drei <View> on the sticky stage; owns the single camera
  CityScene.tsx        orchestrates phases by progress; useFrame ambient motion
  Porthole.tsx         holographic ring               (visible .00–.28)
  CloudField.tsx       layered soft-cloud sprites      (visible .28–.55)
  City.tsx             wireframe city geometry         (visible .50–1.0)
  Vehicles.tsx         instanced 3D vehicles on fixed lanes
  Drones.tsx           instanced 3D drones on altitude arcs
  Overlays.tsx         V2X links · neural plane · energy streams — each beat-gated
  cityData.ts          seeded procedural layout (deterministic → testable)
  useDescentCamera.ts  camera keyframes vs progress + parallax + idle drift
```

`HeroSection` wires `HeroStage` + the title overlay.

**Phase-gating contract:** each subsystem self-fades within its progress window and does **no per-frame work** when off-phase (clouds stop ticking after city appears; vehicles/drones don't update until REVEAL; overlays only animate inside their beat). When the hero is fully scrolled away, the whole scene's animation loop idles.

**Load strategy:** the city module is dynamic-imported. Only the `Porthole` is needed at first paint → fast LCP. City/cloud assets stream in during the PORTHOLE/ENTER phases.

---

## 4. Scene content (all real 3D, wireframe paint style)

Wireframe is a render style on real 3D geometry — every object has a true `(x,y,z)`, depth, and occlusion. "Wireframe" ≠ "2D".

### Porthole
Holographic ring: thin cyan/dark-metal torus + a circle of subtle node-bolts. Faint scanline sweep + slow breathe. On ENTER it scales toward and past the camera, a soft glass flare, then dissolves.

### Clouds
Layered soft-cloud **sprite billboards** (the classic fly-through trick — cheap, cinematic). Cyan rim light, sitting on a dark sky gradient that dissolves to black as we punch through. No true volumetrics (especially not on mobile). Desktop *may* add one light volumetric layer behind a capability check.

### City geometry
Procedural, seeded (deterministic so it's stable + testable). Built from merged `LineSegments` / `Points` / instanced meshes with additive blending:
- Wireframe buildings (glowing edge outlines), low-poly faceted forms.
- Luminous road network with lane markings.
- A few labeled "digital-twin" districts the camera targets per beat.
- City extends past the visible frame to feel like an endless ecosystem (faded with distance fog, not infinite streaming).

### Vehicles (real 3D)
Instanced low-poly wireframe vehicles driving along **fixed precomputed 3D lanes** — no traffic AI, no collision solver, just varied speeds and a short additive motion trail. Read as glowing streaks at distance, real little vehicles up close. Count: ~40 desktop / ~12 mobile.

### Drones (real 3D)
Instanced small wireframe drones flying **altitude arcs** above the streets on scripted 3D paths. Real height + motion, blinking nav glow.

### Overlays (beat-gated)
- **V2X links** (Beat 1): thin glowing lines appear/disappear between nearby vehicles + roadside nodes; small point "packets" travel along them. UV-scroll shader for flow.
- **Neural plane** (Beat 2): a translucent wireframe plane floating above the city in Z; nodes wired down to ground sensors; pulses run the edges.
- **Energy streams** (Beat 3): cyan dashed/flowing lines arcing grid → charging station → vehicle in 3D.

### Camera rig (`useDescentCamera`)
- Keyframe poses per phase; scroll progress lerps between them (smoothed).
- Mouse parallax: small positional/rotational offset added on top.
- Idle drift: continuous low-amplitude motion so it's never frozen.

---

## 5. Performance

| Lever | Target |
|---|---|
| FPS | 60 desktop, ≥30 mid mobile |
| Geometry | merge static lines into few BufferGeometries; instance vehicles/drones |
| Clouds | sprites, not volumetrics; cap overdraw |
| DPR | clamp `min(devicePixelRatio, 2)`; lower on mobile |
| Postprocessing | optional desktop-only bloom behind capability check; **off by default** (fake glow via additive + size) |
| Off-phase | subsystems do zero per-frame work outside their window |
| Off-screen | scene animation idles when hero fully scrolled past |
| Code-split | city module dynamic-imported; porthole-first paint for LCP |

---

## 6. Accessibility, mobile, scroll UX

- **`prefers-reduced-motion`:** skip the scrubbed dive entirely. Land directly on a static (or gently drifting) lit-city hero pose, title shown immediately, normal scroll. No pin, no scroll-jack.
- **Mobile:** keep the journey but with lighter counts + shorter pin distance. If a runtime perf check fails, fall back to the reduced-motion path.
- **Skip affordance:** a small "skip intro" control to jump past the pinned descent to content.
- **Scroll mechanics:** GSAP ScrollTrigger pin + scrub; `lenis` (already added in WIP) provides smooth momentum. Total pin distance kept bounded so users aren't trapped.
- **Content reachability:** keyboard/scroll always reaches the sections below; the pin has a hard end.

---

## 7. Removed / retired

- `SignalField` retired from the hero (replaced by the city). File removal decided once the city lands.
- Tuner: already removed in `feat/v4`. WIP re-added tuner files (`src/components/tuner/*`) are scratch — **do not** wire them back in; delete during cleanup.
- WIP scratch to drop during dev: `src/app/[locale]/test-bg/`, `public/Lohith Tarikere copy.png`.
- WIP to keep: `lenis` + `SmoothScroll.tsx`, wrapper-cleanup deletions, `SignalField` simplification, pnpm migration.

---

## 8. Out of scope (Tier 3 — parked, named so we don't scope-creep)

The beats **evoke** these; they are not simulated:
- Real traffic AI: merging, intersection decision-making, dynamic routing, collision solving.
- LiDAR / radar / camera sensor cones + object detection highlights.
- Transparent buildings with live animated dashboards / real data.
- Infinite streaming/procedural city.
- Full V2X taxonomy (V2P pedestrians, V2C cloud modeling) as real agents.
- Per-vehicle-type behavioral models.

If wanted later, these belong on a standalone load-on-demand `/lab` page, not behind portfolio content.

---

## 9. Verification

Visual-first (preview screenshots at each phase) + a little unit coverage:
- Screenshot/inspect each phase: porthole, enter, clouds, reveal, beat 1/2/3.
- Console clean of WebGL errors; check frame timing.
- Verify `prefers-reduced-motion` path (no pin, immediate title).
- Mobile resize: lighter counts, fallback behaves.
- Unit: deterministic `cityData` seed test (stable counts/positions).

---

## 10. Open defaults to confirm during planning

- Title placement during beats (over-city vs anchored corner).
- Exact pin scroll distance (cinematic length vs scroll-fatigue).
- Whether desktop gets optional bloom at all.
