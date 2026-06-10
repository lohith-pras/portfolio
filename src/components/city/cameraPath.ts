import { PHASE } from './phases'

export type Vec3 = [number, number, number]
export interface CamPose { position: Vec3; lookAt: Vec3 }

// Keyframes at phase boundaries. City is framed across the entire scroll — the
// camera flies a slow approach arc from a wide establishing shot into the beats.
// (The old porthole/cloud descent geometry was removed; keyframes now track the
// city itself so it's visible from p=0.)
interface Key { p: number; pos: Vec3; look: Vec3 }
const KEYS: Key[] = [
  { p: PHASE.porthole[0], pos: [0, 90, 40], look: [0, 5, 10] },   // angled top-down, city reads as circuit board
  { p: 0.12,              pos: [0, 65, 55], look: [0, 8, 0] },    // swoop begins
  { p: PHASE.clouds[0],   pos: [0, 35, 65], look: [0, 10, -2] },  // descending fast (0.30 ≈ clouds start)
  { p: PHASE.reveal[0],   pos: [0, 18, 58], look: [0, 10, -5] },  // near street level (0.50 = reveal start)
  { p: PHASE.reveal[1],   pos: [0, 8, 52],  look: [0, 8, -8] },   // STREET LEVEL — name reveal beat (0.65)
  { p: PHASE.beat1[1],    pos: [-8, 9, 50], look: [-2, 8, -8] },  // drift left (0.77)
  { p: PHASE.beat2[1],    pos: [6, 8, 48],  look: [2, 8, -8] },   // drift right (0.89)
  { p: PHASE.beat3[1],    pos: [0, 8, 46],  look: [0, 7, -10] },  // settle (1.00)
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
