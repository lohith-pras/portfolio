import { mulberry32, range, rangeInt } from '@/lib/rng'

export const CITY_SEED = 0xC17

export const BUILDING_CATEGORIES = ['residential', 'commercial', 'civic', 'industrial'] as const
export type BuildingCategory = (typeof BUILDING_CATEGORIES)[number]
export type RoofProp = 'tank' | 'vent' | 'helipad'

export interface Building {
  x: number; z: number; w: number; d: number; h: number; twin: boolean
  category: BuildingCategory   // skin hint; wireframe ignores it
  antenna?: boolean            // tall buildings may carry an antenna mast
  roofProp?: RoofProp          // optional rooftop detail for the stylized skin
}
export interface Charger { x: number; z: number }
export interface CityLayout {
  half: number          // half-extent of the city square (world units)
  cell: number          // block size
  buildings: Building[]
  roadsX: number[]      // z-positions of roads running along X
  roadsZ: number[]      // x-positions of roads running along Z
  chargers: Charger[]
}

const ROOF_PROPS: RoofProp[] = ['tank', 'vent', 'helipad']

/**
 * Grid city: roads on a fixed lattice, buildings inset within blocks. A few
 * buildings flagged `twin` (the hero digital-twin landmarks the camera targets).
 * Detail fields (`category`/`antenna`/`roofProp`) are populated for a future
 * stylized skin; the wireframe skin ignores them.
 */
export function buildCity(seed: number): CityLayout {
  const r = mulberry32(seed)
  const blocks = 8
  const cell = 8
  const half = (blocks * cell) / 2
  const lines: number[] = []
  for (let i = 0; i <= blocks; i++) lines.push(-half + i * cell)

  const buildings: Building[] = []
  for (let bx = 0; bx < blocks; bx++) {
    for (let bz = 0; bz < blocks; bz++) {
      if (r() < 0.18) continue // gaps / plazas
      const cx = -half + bx * cell + cell / 2
      const cz = -half + bz * cell + cell / 2
      const w = range(r, cell * 0.4, cell * 0.7)
      const d = range(r, cell * 0.4, cell * 0.7)
      const h = range(r, 2, 12)
      const category = BUILDING_CATEGORIES[rangeInt(r, 0, BUILDING_CATEGORIES.length - 1)]
      const antenna = h > 8 && r() < 0.6
      const roofProp = r() < 0.35 ? ROOF_PROPS[rangeInt(r, 0, ROOF_PROPS.length - 1)] : undefined
      buildings.push({ x: cx, z: cz, w, d, h, twin: false, category, antenna, roofProp })
    }
  }
  // Promote a few tall central buildings to "twin" landmarks.
  buildings
    .filter((b) => b.h > 8)
    .slice(0, 5)
    .forEach((b) => (b.twin = true))

  const chargers: Charger[] = []
  const nChargers = rangeInt(r, 4, 7)
  for (let i = 0; i < nChargers; i++) {
    chargers.push({ x: range(r, -half, half), z: range(r, -half, half) })
  }

  return { half, cell, buildings, roadsX: lines, roadsZ: lines, chargers }
}
