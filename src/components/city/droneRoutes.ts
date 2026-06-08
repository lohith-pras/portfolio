import * as THREE from 'three'
import { mulberry32, range, rangeInt } from '@/lib/rng'
import type { CityLayout } from './cityData'

/** Closed smooth flight circuit (3–5 waypoints) above the city per drone. */
export function buildDroneRoutes(city: CityLayout, n: number, seed = 0xD20E): THREE.CatmullRomCurve3[] {
  const r = mulberry32(seed)
  const routes: THREE.CatmullRomCurve3[] = []
  const reach = city.half * 0.8
  for (let k = 0; k < n; k++) {
    const wp = rangeInt(r, 3, 5)
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < wp; i++) {
      pts.push(new THREE.Vector3(range(r, -reach, reach), range(r, 6, 14), range(r, -reach, reach)))
    }
    routes.push(new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5))
  }
  return routes
}
