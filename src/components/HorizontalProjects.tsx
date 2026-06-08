'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

const PROJECTS = [
  { key: 'ni_agent', number: '01', category: 'AI Agents', githubUrl: '#', metric: 'Production deploy for NI Nigel' },
  { key: 'mimo', number: '02', category: 'AI / ML', githubUrl: 'https://github.com/lohith-pras/mimo', metric: 'Lower MSE vs MMSE baseline at mid-SNR' },
  { key: 'vlc', number: '03', category: 'Hardware', githubUrl: 'https://github.com/lohith-pras/vlc-v2v', metric: 'High-speed VLC link demonstrated at close range in direct sunlight' },
] as const

export function HorizontalProjects() {
  const t = useTranslations('work')
  const tp = useTranslations('projects')
  
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollPrev = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -window.innerWidth, behavior: 'smooth' })
    }
  }

  const scrollNext = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: window.innerWidth, behavior: 'smooth' })
    }
  }

  return (
    <section id="projects" className="relative z-10 bg-paper-2 overflow-hidden">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Intro Header & Nav Arrows */}
      <div className="absolute top-12 left-6 md:left-16 z-20 w-[calc(100%-3rem)] md:w-[calc(100%-8rem)] flex justify-between items-center pointer-events-none mix-blend-difference">
        <h2 className="hero-heading font-display text-white">{t('heading')}</h2>
        
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={scrollPrev}
            aria-label="Previous Project"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-[transform,background-color,border-color] backdrop-blur-md"
          >
            &larr;
          </button>
          <button 
            onClick={scrollNext}
            aria-label="Next Project"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-[transform,background-color,border-color] backdrop-blur-md"
          >
            &rarr;
          </button>
        </div>
      </div>

      <div 
        ref={trackRef} 
        className="flex h-[100dvh] items-center pt-24 pb-12 w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth"
      >
        {PROJECTS.map((p) => {
          const name = tp(`${p.key}.name`)
          const description = tp(`${p.key}.description`)
          const techString = tp(`${p.key}.tech`)
          const techArray = techString.split(',').map((t) => t.trim())
          
          return (
            <div
              key={p.key}
              className="w-[100vw] h-full shrink-0 flex items-center justify-center px-6 md:px-16 snap-center overflow-y-auto"
            >
              {/* Bento Grid */}
              <div className="w-full max-w-7xl h-auto lg:h-full lg:max-h-[80vh] grid grid-cols-1 lg:grid-cols-12 gap-4 py-8 lg:py-0">
                
                {/* Cell 1: Image (Col span 7) */}
                <div className="min-h-[240px] md:min-h-[300px] lg:min-h-0 lg:h-full lg:col-span-7 bg-white/[0.02] rounded-2xl overflow-hidden relative border border-white/5 group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <img
                    src={`/projects/${p.key}.png`}
                    alt={name}
                    className="object-cover w-full h-full opacity-70 transition-transform duration-1000 group-hover:scale-[1.03] group-hover:opacity-90"
                  />
                  <div className="absolute bottom-8 left-8 z-20">
                    <div className="font-display text-6xl text-white/90 drop-shadow-lg">{p.number}</div>
                  </div>
                </div>

                {/* Cell 2 & 3: Info & Actions (Col span 5) */}
                <div className="lg:col-span-5 grid grid-rows-3 gap-4">
                  
                  {/* Top: Context */}
                  <div className="row-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex flex-col">
                    <p className="text-xs font-mono uppercase tracking-[0.15em] text-foreground/50 mb-4">{p.category}</p>
                    <h3 className="text-2xl md:text-3xl leading-tight font-medium mb-6 text-foreground/90">{name}</h3>
                    <p className="text-sm md:text-base text-foreground/70 leading-relaxed mb-auto">
                      {description}
                    </p>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      {techArray.slice(0, 4).map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-foreground/80">
                          {tech}
                        </span>
                      ))}
                      {techArray.length > 4 && (
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-foreground/50">
                          +{techArray.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Link & Metric */}
                  <div className="row-span-1 grid grid-cols-2 gap-4">
                    {/* Metric / Tech cell */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                      <p className="text-sm text-foreground/50 mb-2">Highlight</p>
                      <p className="font-medium text-foreground/90 leading-tight">{p.metric}</p>
                    </div>

                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-full bg-white text-black rounded-2xl p-6 flex flex-col justify-center items-center group transition-transform hover:scale-[0.98] duration-300"
                    >
                      <span className="text-sm font-mono uppercase tracking-[0.1em] text-black/60 mb-2 text-center">View Source</span>
                      <span className="font-display text-2xl group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </a>
                  </div>

                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
