'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { WaveformDivider } from './WaveformDivider'
import { ProjectCard } from './ProjectCard'

export function WorkSection() {
  const t = useTranslations('work')
  const tp = useTranslations('projects')
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    // Stagger reveal project cards
    gsap.from('.project-card', {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#work-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })
  }, { scope: containerRef })

  return (
    <section id="work" ref={containerRef} className="w-full flex flex-col pt-12 pb-32">
      <WaveformDivider />
      
      <div className="px-6 md:px-16 max-w-7xl mx-auto w-full mt-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-16">
          {t('heading')}
        </h2>

        <div id="work-grid" className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {/* MIMO AI Channel Quality Tool */}
          <ProjectCard 
            id="PROJ-01"
            name={tp('mimo.name')}
            problem={tp('mimo.problem')}
            status={tp('mimo.status')}
            href="/projects/mimo-ai-channel-quality-tool"
          />

          {/* VLC-based V2V Communication Prototype */}
          <ProjectCard 
            id="PROJ-02"
            name={tp('vlc.name')}
            problem={tp('vlc.problem')}
            status={tp('vlc.status')}
            href="/projects/vlc-v2v-communication"
          />

          {/* IoT Security Project */}
          <ProjectCard 
            id="PROJ-03"
            name={tp('iot.name')}
            problem={tp('iot.problem')}
            status={tp('iot.status')}
            href="/projects/iot-security-project"
          />
        </div>
      </div>
    </section>
  )
}
