'use client'
import { useEffect } from 'react'
import { useDescentCamera } from './useDescentCamera'
import { useDescent } from './DescentContext'
import { Porthole } from './Porthole'
import { CloudField } from './CloudField'

export function CityScene() {
  const { mouse } = useDescent()
  useDescentCamera()

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [mouse])

  // Debug grid stays until the city wireframe lands (M8); porthole opens the descent.
  return (
    <>
      <gridHelper args={[64, 16, 0x00f5ff, 0x113333]} />
      <Porthole />
      <CloudField />
    </>
  )
}
