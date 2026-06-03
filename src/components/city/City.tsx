'use client'
import { useRenderProfile } from './useRenderProfile'
import { CityWireframe } from './skins/CityWireframe'

/**
 * City selector — spec §11 skin seam.
 * Picks the correct skin via `useRenderProfile()` so a stylized skin
 * can bolt on later without touching callers.
 */
export function City() {
  const profile = useRenderProfile()
  if (profile === 'wireframe') return <CityWireframe />
  // 'stylized' skin is a future milestone — intentionally dormant.
  return null
}
