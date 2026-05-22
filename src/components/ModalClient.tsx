'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useCallback } from 'react'

export function ModalClient({ slug, children }: { slug: string, children: React.ReactNode }) {
  const router = useRouter()

  const onDismiss = useCallback(() => {
    router.back()
  }, [router])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden bg-background/80 backdrop-blur-md">
        {/* Background overlay click dismisses */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="absolute inset-0 cursor-zoom-out"
        />
        
        <motion.div
          layoutId={`project-${slug}`}
          className="relative w-full h-full max-w-7xl max-h-full bg-background border border-white/10 rounded-xl overflow-y-auto shadow-2xl z-10"
        >
          <button
            onClick={onDismiss}
            className="absolute top-6 right-6 p-2 z-50 bg-background/50 backdrop-blur-sm rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
