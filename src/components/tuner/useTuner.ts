'use client'

/**
 * useTuner — circular knob-drag → angle → clarity, with magnetic snap.
 *
 * State lives in refs (no React state) so the R3F frame loop can read/write it
 * under `frameloop="demand"` without re-rendering. The consumer (TunerDevice)
 * supplies the knob's screen-space pivot on drag start (computed by projecting
 * the knob mesh), then this hook tracks the pointer angle around that pivot.
 */

import { useRef, useCallback, useEffect } from 'react'

const TWO_PI = Math.PI * 2
// Sweet-spot phase within each revolution. The knob spins freely (no clamp);
// the lock recurs once per full turn at this phase.
export const SWEET_SPOT = 0.9
// Width of the clarity ramp around the sweet-spot.
const TOLERANCE = 0.55
// On release within this angular distance of a sweet-spot, snap to lock.
const SNAP_RANGE = 0.42

// Wrap an angle into [-π, π] — used for the shortest signed distance to the
// nearest sweet-spot, which makes the lock recur every revolution.
function wrapToPi(a: number) {
  let x = (a + Math.PI) % TWO_PI
  if (x < 0) x += TWO_PI
  return x - Math.PI
}

// FM dial range mapped across the arc.
const FREQ_MIN = 88.0
const FREQ_MAX = 108.0

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

/** Map a knob angle to its FM frequency readout (e.g. 104.7). Cycles every
 *  full revolution since the knob spins freely. */
export function angleToFreq(angle: number) {
  let norm = (angle % TWO_PI) / TWO_PI // -1..1
  if (norm < 0) norm += 1 // 0..1
  return FREQ_MIN + norm * (FREQ_MAX - FREQ_MIN)
}

export function useTuner(reducedMotion: boolean) {
  // Reduced motion: start locked. Otherwise start mid-arc and detuned —
  // draggable in both directions, invites tuning.
  const knobAngle = useRef(reducedMotion ? SWEET_SPOT : -0.6)
  const targetAngle = useRef(knobAngle.current)
  const clarity = useRef(reducedMotion ? 1 : 0)
  const interacting = useRef(false)

  // Drag pivot (screen px) + last pointer angle around it.
  const pivot = useRef({ x: 0, y: 0 })
  const lastPointerAngle = useRef(0)

  const beginDrag = useCallback(
    (pivotX: number, pivotY: number, clientX: number, clientY: number) => {
      interacting.current = true
      pivot.current = { x: pivotX, y: pivotY }
      lastPointerAngle.current = Math.atan2(clientY - pivotY, clientX - pivotX)
    },
    [],
  )

  // Window-level move/up so the drag survives the pointer leaving the knob.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!interacting.current) return
      const cur = Math.atan2(
        e.clientY - pivot.current.y,
        e.clientX - pivot.current.x,
      )
      let delta = cur - lastPointerAngle.current
      // Wrap delta into [-PI, PI] so crossing the ±PI seam doesn't jump.
      if (delta > Math.PI) delta -= 2 * Math.PI
      if (delta < -Math.PI) delta += 2 * Math.PI
      lastPointerAngle.current = cur
      // No clamp — the knob spins freely in both directions, accumulating.
      targetAngle.current += delta
    }
    function onUp() {
      if (!interacting.current) return
      interacting.current = false
      // Magnetic snap to the NEAREST sweet-spot orientation (SWEET + k·2π) when
      // released near it — preserves the per-revolution lock.
      const dist = wrapToPi(targetAngle.current - SWEET_SPOT)
      if (Math.abs(dist) < SNAP_RANGE) {
        targetAngle.current -= dist
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  /**
   * Advance the knob spring + recompute clarity. Call once per frame.
   * Returns true while still animating (so the caller keeps invalidating).
   */
  const update = useCallback(() => {
    knobAngle.current += (targetAngle.current - knobAngle.current) * 0.2
    // Clarity from the shortest distance to the nearest sweet-spot (mod 2π),
    // so the lock recurs once per full revolution.
    const dist = wrapToPi(knobAngle.current - SWEET_SPOT)
    clarity.current = 1 - smoothstep(0, TOLERANCE, Math.abs(dist))

    const settling = Math.abs(targetAngle.current - knobAngle.current) > 0.0005
    const ambient = clarity.current < 0.99 // static still animating while detuned
    return interacting.current || settling || ambient
  }, [])

  return { knobAngle, clarity, interacting, beginDrag, update }
}
