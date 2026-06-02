'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { Place } from '@/lib/places'

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

  if (mobile) {
    return (
      <div className="w-full flex flex-col">
        <div
          className="rounded-xl overflow-hidden flex-shrink-0 relative aspect-[4/3] w-full"
          style={{ background: '#000' }}
        >
          <Image src={place.sprite} alt={place.city} fill className="object-cover" />
        </div>
        <motion.div
          className="mt-4 flex flex-col gap-2 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.h3 className="hero-heading font-display" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }} variants={textVariants}>{place.city}</motion.h3>
          <motion.p className="text-white/50 font-body text-sm tracking-widest uppercase" variants={textVariants}>{place.country} · {place.years}</motion.p>
          <motion.p className="text-accent font-display text-lg mt-1" variants={textVariants}>{t(`${place.key}.tagline`)}</motion.p>
          <motion.p className="text-white/70 font-body leading-relaxed max-w-prose mt-1" variants={textVariants}>{t(`${place.key}.story`)}</motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-screen h-full flex-shrink-0 flex items-center px-16 gap-16">
      <div
        className="rounded-xl overflow-hidden flex-shrink-0 relative aspect-[4/3]"
        style={{ background: '#000', width: 'min(55vh, 600px)' }}
      >
        <Image src={place.sprite} alt={place.city} fill className="object-cover" />
      </div>

      <motion.div
        className="flex flex-col gap-3 max-w-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.h3 className="hero-heading font-display" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }} variants={textVariants}>{place.city}</motion.h3>
        <motion.p className="text-white/50 font-body text-sm tracking-widest uppercase" variants={textVariants}>{place.country} · {place.years}</motion.p>
        <motion.p className="text-accent font-display text-lg mt-1" variants={textVariants}>{t(`${place.key}.tagline`)}</motion.p>
        <motion.p className="text-white/70 font-body leading-relaxed mt-1" variants={textVariants}>{t(`${place.key}.story`)}</motion.p>
      </motion.div>
    </div>
  )
}
