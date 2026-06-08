import { mulberry32, rangeInt } from '@/lib/rng'
import type { CityLayout } from './cityData'

export type Vec3 = [number, number, number]

/** A closed loop of grid-intersection corners a car drives around. */
export interface CarRoute {
  points: Vec3[] // corners; last point connects back to first
  segLen: number[] // planar length of each segment
  total: number // loop perimeter
}

function makeRoute(points: Vec3[]): CarRoute {
  const segLen: number[] = []
  let total = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length]
    const l = Math.hypot(b[0] - a[0], b[2] - a[2])
    segLen.push(l)
    total += l
  }
  return { points, segLen, total }
}

/**
 * Each car loops a rectangle of grid lines: straight along block edges, turning
 * at the four corner intersections. Seamless because the loop is closed.
 */
export function buildCarRoutes(city: CityLayout, n: number, seed = 0xCA12): CarRoute[] {
  const r = mulberry32(seed)
  const xs = city.roadsZ // x-positions of roads running along Z
  const zs = city.roadsX // z-positions of roads running along X
  const routes: CarRoute[] = []
  for (let k = 0; k < n; k++) {
    const i0 = rangeInt(r, 0, xs.length - 3)
    const j0 = rangeInt(r, 0, zs.length - 3)
    const i1 = i0 + rangeInt(r, 1, Math.min(3, xs.length - 1 - i0))
    const j1 = j0 + rangeInt(r, 1, Math.min(3, zs.length - 1 - j0))
    const A: Vec3 = [xs[i0], 0, zs[j0]]
    const B: Vec3 = [xs[i1], 0, zs[j0]]
    const C: Vec3 = [xs[i1], 0, zs[j1]]
    const D: Vec3 = [xs[i0], 0, zs[j1]]
    // Randomize orientation (clockwise / counter-clockwise).
    routes.push(makeRoute(r() < 0.5 ? [A, B, C, D] : [A, D, C, B]))
  }
  return routes
}

/**
 * Sample a route by travelled distance (wraps). Returns position, unit heading
 * on XZ, and `u` (0..1 fraction along the current segment, for speed easing).
 */
export function sampleCarRoute(route: CarRoute, d: number): { pos: Vec3; dir: Vec3; u: number } {
  let dist = ((d % route.total) + route.total) % route.total
  let i = 0
  while (i < route.segLen.length - 1 && dist > route.segLen[i]) {
    dist -= route.segLen[i]
    i++
  }
  const a = route.points[i], b = route.points[(i + 1) % route.points.length]
  const u = route.segLen[i] === 0 ? 0 : dist / route.segLen[i]
  const dx = b[0] - a[0], dz = b[2] - a[2]
  const len = Math.hypot(dx, dz) || 1
  return {
    pos: [a[0] + dx * u, 0, a[2] + dz * u],
    dir: [dx / len, 0, dz / len],
    u,
  }
}
