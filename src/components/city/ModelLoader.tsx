'use client'
import { useGLTF } from '@react-three/drei'

export const ASSETS = {
  car: '/models/car.glb',
  drone: '/models/drone.glb',
  building: '/models/building.glb',
}

// Preload the assets so they are ready when components mount
useGLTF.preload(ASSETS.car)
useGLTF.preload(ASSETS.drone)
useGLTF.preload(ASSETS.building)

// Centralized loader component if we want to manage suspense boundaries or global progress
export function ModelLoader() {
  return null // Useful later if we need to track loading progress globally
}
