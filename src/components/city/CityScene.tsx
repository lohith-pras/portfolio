'use client'
import { useEffect } from 'react'
import { useDescentCamera } from './useDescentCamera'
import { useDescent } from './DescentContext'
import { City } from './City'
import { Vehicles } from './Vehicles'
import { Drones } from './Drones'
import { Overlays } from './Overlays'

export function CityScene() {
  const { mouse, visible } = useDescent()
  useDescentCamera()

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [mouse])

  // Offscreen pause: stop driving any work when the hero section is off-screen.
  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const obs = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting }, { threshold: 0 })
    obs.observe(hero)
    return () => obs.disconnect()
  }, [visible])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#4db8ff" />
      <City />
      <Vehicles />
      <Drones />
      <Overlays />
    </>
  )
}
