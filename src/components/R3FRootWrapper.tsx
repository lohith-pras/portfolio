'use client'

import dynamic from 'next/dynamic'

const R3FRoot = dynamic(
  () => import('./R3FRoot').then((mod) => mod.R3FRoot),
  { ssr: false }
)

export function R3FRootWrapper() {
  return <R3FRoot />
}
