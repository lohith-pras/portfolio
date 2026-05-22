'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from '@/i18n/navigation'
import { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const transitionKey = pathname

  return (
    <AnimatePresence mode="wait">
      <motion.div key={transitionKey} className="min-h-screen flex flex-col relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
