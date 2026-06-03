'use client'
import { createContext, useContext, useRef, type ReactNode, type MutableRefObject } from 'react'
import * as THREE from 'three'

interface Descent {
  progress: MutableRefObject<number>       // 0..1, written by HeroStage
  mouse: MutableRefObject<THREE.Vector2>    // -1..1 parallax target
}
const Ctx = createContext<Descent | null>(null)

export function DescentProvider({ children }: { children: ReactNode }) {
  const progress = useRef(0)
  const mouse = useRef(new THREE.Vector2(0, 0))
  return <Ctx.Provider value={{ progress, mouse }}>{children}</Ctx.Provider>
}

export function useDescent(): Descent {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDescent must be used within <DescentProvider>')
  return v
}
