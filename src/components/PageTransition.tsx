'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { usePathname } from '@/i18n/navigation'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  // Fade each route in on navigation (keyed remount per pathname).
  useGSAP(
    () => {
      if (reduce || !ref.current) return
      // Animate y (transform) and opacity for GPU accelerated transition.
      // Safe to use transform now that the complex 3D city scene canvas is retired.
      gsap.from(ref.current, { opacity: 0, y: 10, duration: 0.25, ease: 'power2.out' })
    },
    { dependencies: [pathname] },
  )

  return (
    <div key={pathname} ref={ref} className="min-h-screen flex flex-col flex-1 relative">
      {children}
    </div>
  )
}
