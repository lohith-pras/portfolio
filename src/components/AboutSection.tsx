'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { motion, useReducedMotion } from 'framer-motion'

const ChibiCanvas = dynamic(
  () => import('./chibi/ChibiCanvas').then((m) => m.ChibiCanvas),
  { ssr: false },
)

export function AboutSection() {
  const t = useTranslations('about')
  const shouldReduce = useReducedMotion()

  const textVariants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24, filter: shouldReduce ? 'blur(0px)' : 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: shouldReduce ? 1 : 0.96 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <section id="about" className="min-h-[100svh] w-full flex items-center py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6 md:px-16 max-w-7xl mx-auto w-full">

        {/* Chibi — top on mobile, right on desktop */}
        <motion.div
          className="order-1 md:order-2 w-full max-w-[300px] mx-auto md:max-w-none"
          style={{ aspectRatio: '3 / 4' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={imageVariants}
          transition={{ type: 'spring', duration: shouldReduce ? 0 : 0.6, bounce: 0, delay: shouldReduce ? 0 : 0.1 }}
        >
          <ChibiCanvas />
        </motion.div>

        {/* Text */}
        <motion.div
          className="order-2 md:order-1 flex flex-col justify-center gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={textVariants}
          transition={{ type: 'spring', duration: shouldReduce ? 0 : 0.7, bounce: 0 }}
        >
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-display font-bold text-accent leading-tight">
            {t('descriptor')}
          </h2>
          <div className="font-body text-foreground/80 leading-relaxed text-lg space-y-4">
            <p>{t('bio_1')}</p>
            <p>{t('bio_2')}</p>
            <p>{t('bio_3')}</p>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
