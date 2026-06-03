import { mulberry32, range } from '@/lib/rng'
import type { CityLayout } from './cityData'

export type Vec3 = [number, number, number]
/** A lane is a straight road centerline as [from, to] on the ground (y=0). */
export interface Lane { from: Vec3; to: Vec3 }
export interface Arc { a: Vec3; b: Vec3; height: number }

export function buildLanes(city: CityLayout): Lane[] {
  const lanes: Lane[] = []
  for (const z of city.roadsX) lanes.push({ from: [-city.half, 0, z], to: [city.half, 0, z] })
  for (const x of city.roadsZ) lanes.push({ from: [x, 0, -city.half], to: [x, 0, city.half] })
  return lanes
}

/** Sample a lane at t in [0,1], wrapping so motion loops seamlessly. */
export function sampleLane(lane: Lane, t: number): Vec3 {
  const u = t - Math.floor(t)
  return [
    lane.from[0] + (lane.to[0] - lane.from[0]) * u,
    0,
    lane.from[2] + (lane.to[2] - lane.from[2]) * u,
  ]
}

export function buildDroneArcs(city: CityLayout, n: number): Arc[] {
  const r = mulberry32(0xD2017)
  const arcs: Arc[] = []
  for (let i = 0; i < n; i++) {
    arcs.push({
      a: [range(r, -city.half, city.half), 0, range(r, -city.half, city.half)],
      b: [range(r, -city.half, city.half), 0, range(r, -city.half, city.half)],
      height: range(r, 6, 14),
    })
  }
  return arcs
}

/** Parabolic arc: ground a→b with apex `height` at t=0.5. */
export function sampleArc(arc: Arc, t: number): Vec3 {
  const u = t - Math.floor(t)
  const y = 4 * arc.height * u * (1 - u)
  return [arc.a[0] + (arc.b[0] - arc.a[0]) * u, y, arc.a[2] + (arc.b[2] - arc.a[2]) * u]
}
