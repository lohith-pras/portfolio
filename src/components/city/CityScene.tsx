'use client'
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDescentCamera } from './useDescentCamera'
import { useDescent } from './DescentContext'
import { Porthole } from './Porthole'
import { CloudField } from './CloudField'
import { City } from './City'

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
      <Porthole />
      <CloudField />
      <City />
    </>
  )
}
