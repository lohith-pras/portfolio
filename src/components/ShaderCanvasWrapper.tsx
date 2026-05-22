'use client'

import dynamic from 'next/dynamic'

const ShaderCanvas = dynamic(
  () => import('./ShaderCanvas').then((mod) => mod.ShaderCanvas),
  { ssr: false }
)

export function ShaderCanvasWrapper() {
  return <ShaderCanvas />
}
