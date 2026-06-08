'use client'

import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'

export function R3FRoot() {
  // Mount-gate: this component is 'use client' but still prerenders on the
  // server, where `document` is undefined. eventSource={document.body} would
  // throw during SSR, so render nothing until after hydration.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    // drei <View> caches its scissor from the tracked div's bounds and only
    // remeasures on a window 'resize'. First paint can measure stale/partial
    // bounds (ScrollTrigger pin setup, next/font swap, the route-fade) and stick
    // — leaving the city rendered into a small top-left sub-rect. Re-fire the
    // synthetic resize across the whole settle window, and whenever the document
    // actually changes size, so the View always lands on the real viewport.
    const fire = () => window.dispatchEvent(new Event('resize'))
    const rafs = [
      requestAnimationFrame(fire),
      requestAnimationFrame(() => requestAnimationFrame(fire)),
    ]
    const timers = [120, 360, 800].map((ms) => window.setTimeout(fire, ms))
    const ro = new ResizeObserver(fire)
    ro.observe(document.documentElement)
    document.fonts?.ready.then(fire)
    window.addEventListener('load', fire)
    return () => {
      rafs.forEach(cancelAnimationFrame)
      timers.forEach(clearTimeout)
      ro.disconnect()
      window.removeEventListener('load', fire)
    }
  }, [])

  // Frameloop gate: only render while #hero is on-screen. The scene animates
  // continuously (cars/drones/scan/bloom), so frameloop="never" off-screen stops
  // all GPU work instead of paying a full render+bloom pass every frame.
  const [active, setActive] = useState(true)
  useEffect(() => {
    if (!mounted) return
    const hero = document.getElementById('hero')
    if (!hero) return
    const obs = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 })
    obs.observe(hero)
    return () => obs.disconnect()
  }, [mounted])

  if (!mounted) return null

  // z-0 (NOT negative): the canvas must paint ABOVE main's opaque bg so Views are
  // visible; it stays below the navbar (z-50). pointer-events:none keeps page
  // content interactive — tracked View divs opt back in individually.
  // The style prop duplicates className on purpose: R3F injects its own inline style
  // on the Canvas, so the style prop is needed to win — don't remove as "duplication".
  return (
    <Canvas
      eventSource={document.body}
      eventPrefix="client"
      className="!fixed inset-0 z-0 pointer-events-none"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: 0, stencil: true }}
      onCreated={(state) => {
        state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      }}
      frameloop={active ? 'always' : 'never'}
    >
      <View.Port />
    </Canvas>
  )
}
