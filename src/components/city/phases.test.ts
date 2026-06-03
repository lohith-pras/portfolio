import { describe, it, expect } from 'vitest'
import { PHASE, envelope, localProgress, REVEAL_END } from '@/components/city/phases'

describe('phases', () => {
  it('boundaries ascend', () => {
    const b = [PHASE.porthole, PHASE.enter, PHASE.clouds, PHASE.reveal, PHASE.beat1, PHASE.beat2, PHASE.beat3]
    for (let i = 1; i < b.length; i++) expect(b[i][0]).toBeGreaterThanOrEqual(b[i - 1][0])
  })
  it('REVEAL_END inside reveal', () => {
    expect(REVEAL_END).toBeGreaterThan(PHASE.reveal[0]); expect(REVEAL_END).toBeLessThanOrEqual(PHASE.reveal[1])
  })
  it('envelope ramps 0→1→0', () => {
    expect(envelope(0.0, [0.2, 0.6], 0.05)).toBe(0)
    expect(envelope(0.4, [0.2, 0.6], 0.05)).toBe(1)
    expect(envelope(0.9, [0.2, 0.6], 0.05)).toBe(0)
  })
  it('localProgress maps window to 0..1', () => {
    expect(localProgress(0.4, [0.2, 0.6])).toBeCloseTo(0.5)
  })
})
