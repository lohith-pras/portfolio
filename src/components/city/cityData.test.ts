import { describe, it, expect } from 'vitest'
import { buildCity, CITY_SEED, BUILDING_CATEGORIES } from '@/components/city/cityData'

describe('buildCity', () => {
  it('is deterministic for the seed', () => {
    const a = buildCity(CITY_SEED); const b = buildCity(CITY_SEED)
    expect(a.buildings.length).toBe(b.buildings.length)
    expect(a.buildings[0]).toEqual(b.buildings[0])
  })
  it('produces buildings within the grid bounds', () => {
    const c = buildCity(CITY_SEED)
    expect(c.buildings.length).toBeGreaterThan(20)
    c.buildings.forEach((bld) => {
      expect(Math.abs(bld.x)).toBeLessThanOrEqual(c.half + 0.01)
      expect(Math.abs(bld.z)).toBeLessThanOrEqual(c.half + 0.01)
      expect(bld.h).toBeGreaterThan(0)
    })
  })
  it('places at least a few charging stations', () => {
    expect(buildCity(CITY_SEED).chargers.length).toBeGreaterThanOrEqual(3)
  })
  it('populates detail fields (category always; antenna + roofProp present somewhere)', () => {
    const c = buildCity(CITY_SEED)
    c.buildings.forEach((b) => expect(BUILDING_CATEGORIES).toContain(b.category))
    expect(c.buildings.some((b) => b.antenna === true)).toBe(true)
    expect(c.buildings.some((b) => b.roofProp !== undefined)).toBe(true)
  })
})
