import { PHASE } from './phases'

export type Vec3 = [number, number, number]
export interface CamPose { position: Vec3; lookAt: Vec3 }

// Keyframes at phase boundaries. City is framed across the entire scroll — the
// camera flies a slow approach arc from a wide establishing shot into the beats.
// (The old porthole/cloud descent geometry was removed; keyframes now track the
// city itself so it's visible from p=0.)
interface Key { p: number; pos: Vec3; look: Vec3 }
const KEYS: Key[] = [
  { p: PHASE.porthole[0], pos: [0, 58, 86],  look: [0, 10, -4] },  // high establishing over the dense city
  { p: PHASE.enter[1],    pos: [0, 44, 76],  look: [0, 12, -5] },  // descending in, centred on the tower
  { p: PHASE.clouds[1],   pos: [0, 32, 66],  look: [0, 15, -6] },  // dropping toward the immersive across-view
  { p: PHASE.reveal[1],   pos: [0, 26, 60],  look: [0, 16, -7] },  // IMMERSIVE — across the city, tower centred (name reveal)
  { p: PHASE.beat1[1],    pos: [-8, 25, 58], look: [-2, 15, -7] }, // gentle drift left (city fading out)
  { p: PHASE.beat2[1],    pos: [6, 24, 56],  look: [2, 15, -7] },  // drift right
  { p: PHASE.beat3[1],    pos: [0, 23, 54],  look: [0, 14, -8] },  // settle centred, low
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
