'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useScroll } from 'framer-motion'

import { ProjectCard } from './ProjectCard'

const PROJECTS = [
  { key: 'mimo', number: '01', category: 'AI / ML', githubUrl: 'https://github.com/lohith-pras/mimo' },
  { key: 'vlc', number: '02', category: 'Hardware', githubUrl: 'https://github.com/lohith-pras/vlc-v2v' },
  { key: 'iot', number: '03', category: 'Security', githubUrl: 'https://github.com/lohith-pras/iot-security' },
] as const

export function ProjectsSection() {
  const t = useTranslations('work')
  const tp = useTranslations('projects')
  // Tall container — provides scroll distance. All cards sticky inside, sharing this scroll.
  const containerRef = useRef<HTMLDivElement>(null)

  // Single scroll subscription drives every card. progress 0 when container top hits
  // viewport top, 1 when container bottom hits viewport top.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 sm:-mt-12 md:-mt-14 bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-6 md:px-16 pt-20 pb-32 [--stack-top:6rem] md:[--stack-top:8rem]"
    >
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="hero-heading font-display text-heading mb-16">{t('heading')}</h2>

        {/* Height = n*120vh so scroll distance gives ~100vh per card transition */}
        <div ref={containerRef} style={{ height: `${PROJECTS.length * 120}vh` }} className="relative">
          {PROJECTS.map((p, i) => (
            <ProjectCard
              key={p.key}
              index={i}
              totalCards={PROJECTS.length}
              scrollYProgress={scrollYProgress}
              number={p.number}
              category={p.category}
              name={tp(`${p.key}.name`)}
              tech={tp(`${p.key}.tech`)}
              description={tp(`${p.key}.description`)}
              githubUrl={p.githubUrl}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
