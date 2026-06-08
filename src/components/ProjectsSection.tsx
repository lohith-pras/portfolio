'use client'

import { useTranslations } from 'next-intl'

import { ProjectCard } from './ProjectCard'

const PROJECTS = [
  { key: 'ni_agent', number: '01', category: 'AI Agents', githubUrl: '#', metric: 'Production deploy for NI Nigel', color: 'oklch(0.38 0.10 255)' },
  { key: 'mimo', number: '02', category: 'AI / ML', githubUrl: 'https://github.com/lohith-pras/mimo', metric: 'Lower MSE vs MMSE baseline at mid-SNR', color: 'oklch(0.40 0.09 70)' },
  { key: 'vlc', number: '03', category: 'Hardware', githubUrl: 'https://github.com/lohith-pras/vlc-v2v', metric: 'High-speed VLC link demonstrated at close range in direct sunlight', color: 'oklch(0.39 0.13 25)' },
] as const

export function ProjectsSection() {
  const t = useTranslations('work')
  const tp = useTranslations('projects')

  return (
    <section id="projects" className="relative z-10 bg-paper-2 py-32 md:py-48">
      <div className="mx-auto max-w-5xl px-6 md:px-16">
        <h2 className="hero-heading font-display text-heading">{t('heading')}</h2>

        {/* Separate cards in a vertical column — each reveals on scroll (GSAP). */}
        <div className="mt-20 flex flex-col gap-12 md:mt-32 md:gap-24">
          {PROJECTS.map((p, i) => (
            <ProjectCard
              key={p.key}
              index={i}
              number={p.number}
              category={p.category}
              name={tp(`${p.key}.name`)}
              tech={tp(`${p.key}.tech`)}
              description={tp(`${p.key}.description`)}
              whatWentWrong={tp(`${p.key}.what_went_wrong`)}
              whatIdChange={tp(`${p.key}.what_id_change`)}
              githubUrl={p.githubUrl}
              metric={p.metric}
              color={p.color}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
