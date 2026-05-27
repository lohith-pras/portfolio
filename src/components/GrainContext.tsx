'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type GrainContextValue = {
  grainEnabled: boolean
  toggleGrain: () => void
}

const GrainContext = createContext<GrainContextValue | null>(null)

export function GrainProvider({ children }: { children: ReactNode }) {
  const [grainEnabled, setGrainEnabled] = useState(true)

  function toggleGrain() {
    setGrainEnabled((prev) => !prev)
  }

  return (
    <GrainContext.Provider value={{ grainEnabled, toggleGrain }}>
      {children}
    </GrainContext.Provider>
  )
}

export function useGrain() {
  const ctx = useContext(GrainContext)
  if (!ctx) throw new Error('useGrain must be used within GrainProvider')
  return ctx
}
