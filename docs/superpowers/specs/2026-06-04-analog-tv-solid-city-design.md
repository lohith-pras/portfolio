# Analog TV Static + Solid City Vehicles Design

**Date:** 2026-06-04
**Status:** Approved
**Scope:** Hero city descent — replace porthole/clouds with analog TV static, make buildings/vehicles/drones solid with procedural geometry

---

## 1. Analog TV Static Overlay (replaces Porthole + CloudField)

### Concept

Full-screen analog TV static noise covers the R3F canvas at scroll start. As user scrolls, static "tunes in" — noise decreases, horizontal hold stabilizes, city reveals underneath. Ties into existing RF/signal engineering identity (RF Tuner widget, grain toggle).

### Implementation

- **New component:** `TVStatic.tsx` — full-screen quad (plane geometry filling camera frustum) with custom `ShaderMaterial`
- **Fragment shader** generates real-time static:
  - White noise (hash-based, per-pixel per-frame)
  - Horizontal scanlines (~2px spacing, subtle)
  - Occasional horizontal tear/glitch (random timing, ~every 2-4 seconds)
  - Faint green/cyan tint (CRT phosphor feel)
- **Uniform `uClearProgress`** driven by scroll progress via `useDescent()`:
  - `PHASE.porthole` [0.0–0.1] — full static, city not visible
  - `PHASE.enter` [0.1–0.28] — static breaks up, city bleeds through (noise amplitude decreases, alpha drops)
  - `PHASE.clouds` [0.28–0.5] — static mostly gone, faint scanlines linger, city fully visible
- **renderOrder:** high value so it renders on top of city geometry
- **Stencil system removed** — no longer needed, static is a simple alpha overlay

### Files Changed

- **Delete:** `Porthole.tsx`, `CloudField.tsx`
- **Create:** `TVStatic.tsx`
- **Edit:** `CityScene.tsx` — swap `<Porthole />` + `<CloudField />` for `<TVStatic />`

---

## 2. Solid Buildings (Hybrid Overlay)

### Concept

Buildings get physical presence: dark solid fill underneath + existing glowing wireframe edges on top. "Digital twin" aesthetic.

### Implementation

Two merged geometry layers in `CityWireframe.tsx`:

1. **Solid fill layer:**
   - `BufferGeometry` with actual box faces for all buildings (merged into one `Mesh`)
   - `MeshBasicMaterial` — dark fill color (`#1a0a00`), opaque, `depthWrite: true`
   - `polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1` (prevents z-fighting with edge lines)

2. **Wireframe edge layer:**
   - Existing `EdgesGeometry` / `LineSegments` unchanged
   - `LineBasicMaterial` with accent color + additive blending (as-is)

**Ground plane:** Flat dark plane under the city so roads/gaps don't show void. Same dark fill color.

Draw calls remain at 3 total (solid mesh + edge lines + ground plane).

### Files Changed

- **Edit:** `skins/CityWireframe.tsx` — add solid fill geometry + ground plane

---

## 3. Procedural Cars with Wheels

### Concept

Replace instanced boxes with procedural car groups — body + cabin + 4 spinning wheels. Lane-aware driving with turning at intersections.

### Geometry (per car)

- Body: `BoxGeometry(1.2, 0.35, 0.6)`
- Cabin: `BoxGeometry(0.5, 0.25, 0.5)` — offset up and back
- 4 wheels: `CylinderGeometry(0.12, 0.12, 0.08, 8)` — rotated 90deg on Z, positioned at body corners
- All hybrid material: dark solid fill + accent wireframe edges (EdgesGeometry overlay per part)

### Count

- Desktop: 12 cars
- Mobile: 6 cars

### Movement — Lane-Aware Driving

- **Refactor `lanes.ts`** — current lanes are single straight segments
- **New file: `carRoutes.ts`:**
  - Grid intersections (where roadsX meets roadsZ) become waypoints
  - Each car gets a route: ordered list of connected segments
  - At intersections, car picks next segment (random: turn or straight)
  - Route loops seamlessly
- **Body rotation:** car group rotates to face travel direction. Smooth quaternion slerp for turning at intersections.
- **Speed variation:** slight deceleration approaching intersections, accelerate out
- **Wheel spin:** `wheel.rotation.x += speed * dt * WHEEL_SPIN_FACTOR` — proportional to forward speed

### Files Changed

- **Delete/Rewrite:** `Vehicles.tsx` — replace InstancedMesh with mapped `<Car />` groups
- **Create:** `Car.tsx` — single car component
- **Create:** `carRoutes.ts` — route builder using city grid intersections
- **Edit:** `lanes.ts` — add intersection waypoint data export

---

## 4. Procedural Drones with Spinning Blades

### Concept

Replace instanced octahedrons with procedural quadcopter groups — body + 4 arms + 4 spinning rotors. Waypoint-based flight with banking.

### Geometry (per drone)

- Central body: `BoxGeometry(0.4, 0.12, 0.4)`
- 4 arms: `BoxGeometry(0.35, 0.04, 0.06)` — extending diagonally from body corners
- 4 rotors: `CylinderGeometry(0.15, 0.15, 0.02, 8)` — at arm tips, spinning on Y axis
- All hybrid material: dark solid fill + accent wireframe edges. Rotors get brighter accent.

### Count

- Desktop: 4-6 drones
- Mobile: 3 drones

### Movement — Realistic Flight

- **New file: `droneRoutes.ts`:**
  - Waypoint circuits: 3-5 waypoints per drone above the city
  - Waypoints chosen from building rooftops or road intersections
  - Smooth interpolation between waypoints (lerp or catmull-rom)
  - Looping path
- **Banking:** drone group tilts into turns — `rotation.z` based on lateral velocity change, ~10-15 degrees max
- **Altitude variation:** gentle sine-wave bob `+-0.3` units layered on path height
- **Height range:** 6-14 units (same as current), stays above buildings
- **Rotor spin:** `rotor.rotation.y += ROTOR_SPEED * dt` — fast constant (~15-20 rad/s). Speed increases slightly during altitude gain.

### Files Changed

- **Delete/Rewrite:** `Drones.tsx` — replace InstancedMesh with mapped `<Drone />` groups
- **Create:** `Drone.tsx` — single drone component
- **Create:** `droneRoutes.ts` — waypoint route builder

---

## 5. Shared Material System

Both buildings and vehicles use the same hybrid material approach:

- **Fill:** `MeshBasicMaterial` — dark color, opaque, depthWrite true
- **Edges:** `EdgesGeometry` → `LineSegments` with `LineBasicMaterial` — accent color, additive blending, depthWrite false
- No lights needed in scene
- Consistent "digital twin" aesthetic across all geometry

Consider extracting shared material constants to a `cityMaterials.ts` file to avoid duplication.

---

## 6. Phase Mapping

| Phase | Range | Old Behavior | New Behavior |
|-------|-------|-------------|--------------|
| porthole | 0.0–0.1 | Porthole ring visible | Full TV static |
| enter | 0.1–0.28 | Camera punches through porthole | Static breaks up, city bleeds through |
| clouds | 0.28–0.5 | Cloud puffs drift, fade | Static mostly gone, faint scanlines |
| reveal | 0.5–0.65 | City wireframe fades in | City solid+wireframe fades in (unchanged trigger) |
| beat1-3 | 0.65–1.0 | V2X, neural, energy overlays | Unchanged |

Vehicles and drones remain gated on `PHASE.reveal[0]` as current.

---

## 7. Performance Budget

| Entity | Old Count | New Count (Desktop) | New Count (Mobile) | Draw Calls |
|--------|-----------|--------------------|--------------------|------------|
| Buildings | 1 LineSegments | 1 Mesh + 1 LineSegments | Same | 2 → 3 |
| Cars | 1 InstancedMesh (40) | 12 groups x ~10 meshes | 6 groups | 1 → ~120 |
| Drones | 1 InstancedMesh (10) | 4-6 groups x ~9 meshes | 3 groups | 1 → ~36-54 |
| TV Static | 2 components (Porthole+CloudField) | 1 ShaderMaterial quad | Same | ~3 → 1 |

**Total draw call increase:** ~5 → ~180 (desktop worst case). Acceptable for a hero section — all geometry is trivially small (few triangles each). Main cost is shader for TV static (per-pixel noise) which is cheap on modern GPUs.

**Mitigations if needed:**
- Merge car sub-part geometries (body+cabin) into single BufferGeometry, keep only wheels separate
- Reduce car/drone counts
- LOD: simplify distant cars to single box

---

## 8. File Summary

| Action | File |
|--------|------|
| Delete | `Porthole.tsx` |
| Delete | `CloudField.tsx` |
| Create | `TVStatic.tsx` |
| Create | `Car.tsx` |
| Create | `Drone.tsx` |
| Create | `carRoutes.ts` |
| Create | `droneRoutes.ts` |
| Create | `cityMaterials.ts` (optional shared constants) |
| Edit | `CityScene.tsx` |
| Edit | `skins/CityWireframe.tsx` |
| Edit | `Vehicles.tsx` |
| Edit | `Drones.tsx` |
| Edit | `lanes.ts` |
