'use client'

import { useTranslations } from 'next-intl'
import { motion, useTransform, useReducedMotion, type MotionValue } from 'framer-motion'

interface ProjectCardProps {
  index: number
  totalCards: number
  scrollYProgress: MotionValue<number>
  number: string
  category: string
  name: string
  tech: string
  description: string
  githubUrl: string
}

export function ProjectCard({ index, totalCards, scrollYProgress, number, category, name, tech, description, githubUrl }: ProjectCardProps) {
  const t = useTranslations('work')
  const reduce = useReducedMotion()

  // Each card owns 1/n of the total scroll range
  const windowSize = 1 / totalCards
  const windowStart = index * windowSize
  const windowEnd = windowStart + windowSize
  const fadeInEnd = windowStart + windowSize * 0.25  // first 25% of window: fade+slide in
  const scaleStart = windowEnd - windowSize * 0.3    // last 30% of window: scale down (next card coming)

  // Scale down as next card slides in (last card stays at 1)
  const targetScale = 1 - (totalCards - 1 - index) * 0.03
  const scale = useTransform(scrollYProgress, [scaleStart, windowEnd], [1, targetScale])

  // Cards 02+ are invisible until their window starts, then fade+slide in.
  // Scrolling back up reverses the animation — they fade away.
  // Callback form: derive a 0→1 reveal fraction for this card's fade-in window.
  const reveal = (v: number) =>
    Math.min(1, Math.max(0, (v - windowStart) / (fadeInEnd - windowStart)))

  const opacity = useTransform(scrollYProgress, (v) => (index === 0 ? 1 : reveal(v)))
  const y = useTransform(scrollYProgress, (v) => (index === 0 ? 0 : 80 * (1 - reveal(v))))

  return (
    <div className="sticky" style={{ top: `calc(var(--stack-top) + ${index * 28}px)`, zIndex: index + 1 }}>
    <motion.article
      className="glass-card w-full min-h-[60vh] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-6 sm:p-8 md:p-10"
      style={reduce
        ? {}
        : { scale, y, opacity, transformOrigin: 'top' }
      }
    >
      <div className="flex items-end gap-4 flex-wrap mb-8">
        <span className="font-display text-[clamp(4rem,10vw,8rem)] leading-none text-foreground/20">{number}</span>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">{category}</span>
          <h3 className="font-display font-bold text-[clamp(1.2rem,3vw,2rem)] text-foreground leading-tight">{name}</h3>
        </div>
        <a href={githubUrl} target="_blank" rel="noopener noreferrer"
           className="group ml-auto inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-4 py-2 text-xs uppercase tracking-widest text-foreground bg-transparent hover:border-accent hover:text-accent transition-colors duration-200 whitespace-nowrap">
          {t('view_project')}
          <span aria-hidden="true" className="-ml-1 w-0 overflow-hidden opacity-0 transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:ml-0 group-hover:w-3 group-hover:opacity-100">
            →
          </span>
        </a>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">{t('tech_label')}</span>
          <p className="text-body text-foreground/80">{tech}</p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">{t('overview_label')}</span>
          <p className="text-body text-foreground/80">{description}</p>
        </div>
      </div>
    </motion.article>
    </div>
  )
}
