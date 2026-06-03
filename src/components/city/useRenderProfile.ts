'use client'

// Render-skin selector (spec §11: DATA ⊥ MOTION ⊥ SKIN). Every visual subsystem
// (City, Vehicles, Drones, Overlays) picks its skin through this hook, so a
// stylized skin can bolt on later behind a device/GPU-tier branch. Only the
// wireframe skin exists today; the capability branch is intentionally dormant.
export type RenderProfile = 'wireframe' | 'stylized'

export function useRenderProfile(): RenderProfile {
  return 'wireframe'
}
