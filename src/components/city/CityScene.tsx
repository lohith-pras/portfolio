'use client'
import { useEffect } from 'react'
import { useDescentCamera } from './useDescentCamera'
import { useDescent } from './DescentContext'

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

  // Temporary debug content — replaced as subsystems land (porthole, clouds, city).
  return <gridHelper args={[64, 16, 0x00f5ff, 0x113333]} />
}
