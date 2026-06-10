'use client'
import { useEffect } from 'react'
import { useDescentCamera } from './useDescentCamera'
import { useDescent } from './DescentContext'
import { useDeviceTier } from './useRenderProfile'
import { City } from './City'
import { Drones } from './Drones'
import { Overlays } from './Overlays'
import { AvenueTraffic } from './AvenueTraffic'

import { Environment } from '@react-three/drei'

export function CityScene() {
  const { mouse, visible } = useDescent()
  useDescentCamera()
  const tier = useDeviceTier()

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
      <fogExp2 args={[0x061828, 0.007]} />
      <hemisphereLight args={[0x061828, 0x020508, 0.25]} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.6}
        color="#4db8ff"
        castShadow
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0005}
      />
      {tier === 'high' && (
        <>
          <pointLight position={[0, 2, 0]} color={0x4db8ff} intensity={12} distance={60} decay={2} />
          <pointLight position={[15, 2, 15]} color={0x00ffcc} intensity={8} distance={40} decay={2} />
        </>
      )}
      <Environment preset="night" />
      <City />
      <AvenueTraffic />
      <Drones />
      <Overlays />
    </>
  )
}
