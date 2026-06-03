import { describe, it, expect } from 'vitest'
import { buildLanes, sampleLane, buildDroneArcs, sampleArc } from '@/components/city/lanes'
import { buildCity, CITY_SEED } from '@/components/city/cityData'

const city = buildCity(CITY_SEED)

describe('lanes', () => {
  it('builds one lane per road line', () => {
    const lanes = buildLanes(city)
    expect(lanes.length).toBe(city.roadsX.length + city.roadsZ.length)
  })
  it('samples a point on the ground plane (y≈0)', () => {
    const p = sampleLane(buildLanes(city)[0], 0.5)
    expect(p[1]).toBeCloseTo(0, 5)
  })
  it('wraps t (loops): t=0 ≈ t=1', () => {
    const lane = buildLanes(city)[0]
    const a = sampleLane(lane, 0); const b = sampleLane(lane, 1)
    expect(Math.hypot(a[0] - b[0], a[2] - b[2])).toBeLessThan(0.001)
  })
  it('drone arcs rise above ground', () => {
    const arcs = buildDroneArcs(city, 6)
    expect(arcs.length).toBe(6)
    expect(sampleArc(arcs[0], 0.5)[1]).toBeGreaterThan(0)
  })
})
