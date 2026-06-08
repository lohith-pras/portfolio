'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { WavingFlag } from '@/components/WavingFlag'

export function LifeClient() {
  const root = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useGSAP(
    () => {
      if (reduce || !root.current) return
      const sections = root.current.querySelectorAll(':scope > section')
      const items = root.current.querySelectorAll('li')
      const tl = gsap.timeline()
      tl.from(sections, { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: 'power3.out' })
      tl.from(items, { opacity: 0, x: -8, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, '-=0.2')
    },
    { scope: root, dependencies: [reduce] },
  )

  return (
    <div ref={root} className="flex flex-col gap-16">
      <section>
        <h1 className="font-display font-bold text-heading leading-none tracking-[-0.02em] mb-8">Life.</h1>
        <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
          Beyond the screen, I explore the world through travel, capture moments, and obsess over the details of good design and engineering.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Hobbies</h2>
          <ul className="flex flex-wrap gap-2">
            {['Photography', 'Minimalist Design', 'Mechanical Keyboards', 'F1 Racing'].map((h) => (
              <li key={h} className="list-none">
                <span className="font-mono text-xs px-3 py-1.5 rounded-full border border-white/15 text-foreground/70 bg-white/[0.04] hover:border-accent/50 hover:text-foreground transition-colors duration-150 cursor-default">
                  {h}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Current Obsessions</h2>
          <ul className="flex flex-wrap gap-2">
            {['Local LLMs', 'Next.js 15 Static Rendering', 'GSAP ScrollTrigger', 'Intercepting Routes'].map((o) => (
              <li key={o} className="list-none">
                <span className="font-mono text-xs px-3 py-1.5 rounded-full border border-accent/20 text-accent/70 bg-accent/[0.04] hover:border-accent/50 hover:text-accent transition-colors duration-150 cursor-default">
                  {o}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">In the Stands</h2>
        <div className="flex gap-6">
          <WavingFlag
            bgColor="#001489"
            accentColor="#FF0000"
            number="3"
            logoUrl="/assets/rbr-logo.svg"
            logoAlt="Red Bull Racing"
            phaseOffset={0}
          />
          <WavingFlag
            bgColor="#D40024"
            accentColor="#FFC906"
            number="18"
            logoUrl="/assets/rcb-logo.svg"
            logoAlt="Royal Challengers Bengaluru"
            phaseOffset={0.8}
          />
        </div>
      </section>
    </div>
  )
}
