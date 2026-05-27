'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { usePathname } from '@/i18n/navigation'
import { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const shouldReduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} className="min-h-screen flex flex-col relative">
        <motion.div
          initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldReduce ? 0 : -10 }}
          transition={{ duration: shouldReduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
