'use client'

import { useEffect, useState } from 'react'

/**
 * Reactive `prefers-reduced-motion`. Drop-in replacement for framer-motion's
 * `useReducedMotion` so the project depends only on GSAP for motion.
 * Returns false during SSR / first paint, then the live value after mount.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
