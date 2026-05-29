'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { Place } from '@/lib/places'

const PlaceScene = dynamic(
  () => import('@/components/chibi/PlaceScene').then((m) => m.PlaceScene),
  { ssr: false }
)

const textVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

interface PlaceCardProps {
  place: Place
  index: number
  mobile?: boolean
}

export function PlaceCard({ place, mobile = false }: PlaceCardProps) {
  const t = useTranslations('places')

  return (
    <div
      className={
        mobile
          ? 'w-full flex flex-col'
          : 'w-screen h-full flex-shrink-0 flex flex-col px-8 py-4 gap-4'
      }
    >
      <div
        className="glass-card rounded-xl overflow-hidden flex-shrink-0"
        style={{ height: mobile ? '300px' : '55%' }}
      >
        <PlaceScene placeholderColor={place.placeholderColor} />
      </div>

      <motion.div
        className={mobile ? 'mt-4 flex flex-col gap-2' : 'flex flex-col gap-2'}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.h3
          className="hero-heading font-display"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          variants={textVariants}
        >
          {place.city}
        </motion.h3>
        <motion.p
          className="text-white/50 font-body text-sm tracking-widest uppercase"
          variants={textVariants}
        >
          {place.country} · {place.years}
        </motion.p>
        <motion.p
          className="text-accent font-display text-lg mt-1"
          variants={textVariants}
        >
          {t(`${place.key}.tagline`)}
        </motion.p>
        <motion.p
          className="text-white/70 font-body leading-relaxed max-w-prose mt-1"
          variants={textVariants}
        >
          {t(`${place.key}.story`)}
        </motion.p>
      </motion.div>
    </div>
  )
}
