'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface ProjectProgressBarProps {
  phasesCompleted: number
  totalPhases: number
}

export function ProjectProgressBar({ phasesCompleted, totalPhases }: ProjectProgressBarProps) {
  const shouldReduceMotion = useReducedMotion()
  const percentage = (phasesCompleted / totalPhases) * 100

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="font-mono text-xs text-white/50 uppercase tracking-widest">
        {phasesCompleted} / {totalPhases} Phases
      </span>
      <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: '#FF1E00' }}
          initial={{ width: shouldReduceMotion ? `${percentage}%` : '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }
          }
        />
      </div>
    </div>
  )
}
