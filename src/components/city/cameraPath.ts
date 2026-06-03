import { PHASE } from './phases'

export type Vec3 = [number, number, number]
export interface CamPose { position: Vec3; lookAt: Vec3 }

// Keyframes at phase boundaries. Camera lives in front of the porthole (high +Y,
// +Z back), then dives down toward the city on the XZ plane.
interface Key { p: number; pos: Vec3; look: Vec3 }
const KEYS: Key[] = [
  { p: PHASE.porthole[0], pos: [0, 0, 14],   look: [0, 0, 0] },     // facing the ring
  { p: PHASE.enter[1],    pos: [0, 4, 4],     look: [0, 0, -20] },   // punched through, tilting down
  { p: PHASE.clouds[1],   pos: [0, 30, 0],    look: [0, 0, -30] },   // falling through cloud deck
  { p: PHASE.reveal[1],   pos: [0, 22, 34],   look: [0, 0, 0] },     // high wide over the city
  { p: PHASE.beat1[1],    pos: [-14, 6, 18],  look: [0, 1, 0] },     // low over streets
  { p: PHASE.beat2[1],    pos: [10, 26, 20],  look: [0, 8, 0] },     // lifted toward neural plane
  { p: PHASE.beat3[1],    pos: [16, 12, -2],  look: [10, 2, -8] },   // panned to charging cluster
]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t) // smoothstep for eased segments
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

/** Sample the camera pose at progress p (0..1). */
export function sampleCamera(p: number): CamPose {
  const x = Math.min(1, Math.max(0, p))
  let i = 0
  while (i < KEYS.length - 1 && x > KEYS[i + 1].p) i++
  const a = KEYS[i]
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)]
  const span = b.p - a.p || 1
  const t = smooth(Math.min(1, Math.max(0, (x - a.p) / span)))
  return { position: lerp3(a.pos, b.pos, t), lookAt: lerp3(a.look, b.look, t) }
}
