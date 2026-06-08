'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function ModalClient({ slug, children }: { slug: string, children: React.ReactNode }) {
  const router = useRouter()
  const reduce = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Enter animation.
  useGSAP(
    () => {
      if (reduce) return
      gsap.from(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power1.out' })
      gsap.from(panelRef.current, { opacity: 0, scale: 0.96, y: 16, duration: 0.45, ease: 'power3.out' })
    },
    { scope: rootRef },
  )

  // Animate out, then navigate back.
  const onDismiss = useCallback(() => {
    if (reduce) {
      router.back()
      return
    }
    gsap.to(panelRef.current, { opacity: 0, scale: 0.98, y: -8, duration: 0.25, ease: 'power2.in' })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power1.in', onComplete: () => router.back() })
  }, [router, reduce])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  return (
    <div
      ref={rootRef}
      key={slug}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden bg-background/80 backdrop-blur-md"
    >
      {/* Background overlay click dismisses */}
      <div ref={overlayRef} onClick={onDismiss} className="absolute inset-0 cursor-zoom-out" />

      <div
        ref={panelRef}
        className="w-full h-full max-w-7xl max-h-full glass-card rounded-xl overflow-y-auto z-10"
      >
        <button
          onClick={onDismiss}
          className="absolute top-6 right-6 p-2 z-50 glass-pill rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}
