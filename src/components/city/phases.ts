export type Window = readonly [start: number, end: number]
export const PHASE = {
  porthole: [0.0, 0.1] as Window, enter: [0.1, 0.28] as Window, clouds: [0.28, 0.5] as Window,
  reveal: [0.5, 0.65] as Window, beat1: [0.65, 0.77] as Window, beat2: [0.77, 0.89] as Window, beat3: [0.89, 1.0] as Window,
} as const
export const REVEAL_END = 0.62
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export function envelope(p: number, [s, e]: Window, fade: number): number {
  if (p <= s || p >= e) return 0
  return Math.min(clamp01((p - s) / fade), clamp01((e - p) / fade))
}
export function localProgress(p: number, [s, e]: Window): number { return clamp01((p - s) / (e - s)) }
