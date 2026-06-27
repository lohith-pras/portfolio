'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * GrainCanvas — animated red-tinted film grain spanning the whole page.
 *
 * Replaces the static feTurbulence CSS overlay (.grain-overlay) with a fixed
 * canvas that shimmers continuously across every section, so the dark surface
 * reads as one living atmosphere. Tint matches the old overlay (R=1, G=0.12,
 * B=0) and the Hero shader's warm red.
 *
 * Perf: a handful of pre-rendered noise tiles are cycled at a capped ~24fps and
 * tiled via a repeat pattern (cheap fill, no per-pixel work per frame). The
 * noise buffer stays at DPR 1 — grain needs no retina. Under reduced motion it
 * paints a single static frame and never loops.
 */
const TILE = 180 // px — noise tile, repeated across the viewport
const TILE_COUNT = 4 // distinct frames cycled to fake motion
const FPS = 24
const ALPHA_MAX = 18 // per-pixel max alpha (~0.07) — subtle on pure black

export function GrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Pre-render the noise tiles once. Each is sparse red specks at random alpha.
    const tiles = Array.from({ length: TILE_COUNT }, () => {
      const off = document.createElement('canvas')
      off.width = TILE
      off.height = TILE
      const octx = off.getContext('2d')!
      const img = octx.createImageData(TILE, TILE)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 // R
        d[i + 1] = 255 // G
        d[i + 2] = 255 // B
        d[i + 3] = Math.random() * ALPHA_MAX // A
      }
      octx.putImageData(img, 0, 0)
      return off
    })

    const patterns = tiles.map((t) => ctx.createPattern(t, 'repeat')!)

    let frame = 0
    const paint = (idx: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = patterns[idx]
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const resize = () => {
      // DPR 1 on purpose — grain is sub-pixel noise; retina buys nothing here.
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      paint(frame % TILE_COUNT)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    if (!reduce) {
      const interval = 1000 / FPS
      let last = 0
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop)
        if (document.hidden) return
        if (now - last < interval) return
        last = now
        frame++
        paint(frame % TILE_COUNT)
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      window.removeEventListener('resize', resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduce])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  )
}
