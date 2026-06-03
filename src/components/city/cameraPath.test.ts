import { describe, it, expect } from 'vitest'
import { sampleCamera } from '@/components/city/cameraPath'
import { PHASE } from '@/components/city/phases'

describe('sampleCamera', () => {
  it('peaks at the cloud deck then descends to fly over the city', () => {
    const peakY = sampleCamera(PHASE.clouds[1]).position[1] // highest point, falling through clouds
    const end = sampleCamera(1)
    expect(end.position[1]).toBeLessThan(peakY) // descended from the cloud-deck peak
    expect(end.position[1]).toBeGreaterThan(0) // stays above ground, over the city
  })
  it('is continuous (no large jumps between adjacent samples)', () => {
    let prev = sampleCamera(0)
    for (let p = 0.02; p <= 1; p += 0.02) {
      const cur = sampleCamera(p)
      const d = Math.hypot(cur.position[0] - prev.position[0], cur.position[1] - prev.position[1], cur.position[2] - prev.position[2])
      expect(d).toBeLessThan(8) // no teleport between 2% steps
      prev = cur
    }
  })
  it('returns finite numbers across the range', () => {
    for (let p = 0; p <= 1; p += 0.1) {
      const c = sampleCamera(p)
      ;[...c.position, ...c.lookAt].forEach((n) => expect(Number.isFinite(n)).toBe(true))
    }
  })
})
