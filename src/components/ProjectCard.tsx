'use client'

import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { ProjectProgressBar } from './ProjectProgressBar'

interface ProjectCardProps {
  id: string
  name: string
  problem: string
  status: string
  href: string
  phasesCompleted: number
  totalPhases: number
}

export function ProjectCard({ id, name, problem, status, href, phasesCompleted, totalPhases }: ProjectCardProps) {
  return (
    <motion.article
      className="project-card flex flex-col gap-4 pb-6 border-b border-white/20 hover:border-white/60 transition-colors group"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
    >
      <Link href={href} className="flex flex-col gap-4 cursor-pointer focus:outline-none">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-[clamp(1.5rem,3vw,2.5rem)] text-foreground group-hover:text-accent transition-colors leading-tight">
              {name}
            </h3>
          </div>
          <p className="font-body font-light text-white/70 text-[clamp(1rem,1.8vw,1.2rem)] leading-relaxed line-clamp-2">
            {problem}
          </p>
        </header>

        <footer className="flex flex-col gap-3 mt-2">
          <ProjectProgressBar phasesCompleted={phasesCompleted} totalPhases={totalPhases} />
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-foreground/80 uppercase tracking-wider">
              {status}
            </span>
            <div className="font-mono text-xs text-foreground/50 uppercase tracking-widest border border-white/10 px-2 py-1 rounded-sm">
              {id}
            </div>
          </div>
        </footer>
      </Link>
    </motion.article>
  )
}
