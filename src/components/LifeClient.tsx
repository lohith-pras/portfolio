'use client'

import { motion } from 'framer-motion'
import { WavingFlag } from '@/components/WavingFlag'

export function LifeClient() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-16"
    >
      <motion.section variants={item}>
        <h1 className="text-4xl font-bold mb-8">Life.</h1>
        <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
          Beyond the screen, I explore the world through travel, capture moments, and obsess over the details of good design and engineering.
        </p>
      </motion.section>

      <motion.section variants={item} className="grid md:grid-cols-2 gap-12">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Hobbies</h2>
          <ul className="space-y-3 text-white/70">
            <li>Photography</li>
            <li>Minimalist Design</li>
            <li>Mechanical Keyboards</li>
            <li>F1 Racing</li>
          </ul>
        </div>
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Current Obsessions</h2>
          <ul className="space-y-3 text-white/70">
            <li>Local LLMs</li>
            <li>Next.js 15 Static Rendering</li>
            <li>GSAP ScrollTrigger</li>
            <li>Framer Motion Intercepting Routes</li>
          </ul>
        </div>
      </motion.section>

      <motion.section variants={item}>
        <h2 className="text-2xl font-bold mb-6">In the Stands</h2>
        <div className="flex gap-6">
          <WavingFlag
            bgColor="#001489"
            accentColor="#FF0000"
            number="3"
            logoUrl="https://www.redbullracing.com/_next/static/media/ORBR_logo_2026.4059dac5.svg"
            logoAlt="Red Bull Racing logo"
            phaseOffset={0}
          />
          <WavingFlag
            bgColor="#D40024"
            accentColor="#FFC906"
            number="18"
            logoUrl="https://www.royalchallengers.com/PRRCB01/public/rcb-logo-new_0.png"
            logoAlt="Royal Challengers Bengaluru logo"
            phaseOffset={0.8}
          />
        </div>
      </motion.section>

    </motion.div>
  )
}
