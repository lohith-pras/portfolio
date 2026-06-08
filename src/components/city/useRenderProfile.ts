'use client'
import { useState, useEffect } from 'react'

// Render-skin selector (spec §11: DATA ⊥ MOTION ⊥ SKIN). Every visual subsystem
// (City, Vehicles, Drones, Overlays) picks its skin through this hook, so a
// stylized skin can bolt on later behind a device/GPU-tier branch. Only the
// wireframe skin exists today; the capability branch is intentionally dormant.
export type RenderProfile = 'wireframe' | 'stylized'

export function useRenderProfile(): RenderProfile {
  return 'wireframe'
}

export type DeviceTier = 'low' | 'high'

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('high')

  useEffect(() => {
    const checkTier = () => {
      // Return 'low' for mobile devices to save GPU/performance, 'high' for desktop
      const isMobile = window.innerWidth < 768
      setTier(isMobile ? 'low' : 'high')
    }
    checkTier()
    window.addEventListener('resize', checkTier)
    return () => window.removeEventListener('resize', checkTier)
  }, [])

  return tier
}
