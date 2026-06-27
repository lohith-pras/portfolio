'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { Place } from '@/lib/places'

interface PlaceCardProps {
  place: Place
  index: number
  mobile?: boolean
}

export function PlaceCard({ place, mobile = false }: PlaceCardProps) {
  const t = useTranslations('places')
  const reduce = useReducedMotion()
  const textRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduce || !textRef.current) return
      gsap.from(textRef.current.children, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: textRef.current, start: 'top 85%', once: true },
      })
    },
    { scope: textRef, dependencies: [reduce] },
  )

  if (mobile) {
    return (
      <div className="w-full flex flex-col">
        <div className="rounded-xl overflow-hidden flex-shrink-0 relative aspect-[4/3] w-full bg-paper">
          <Image src={place.sprite} alt={place.city} fill className="object-cover" />
        </div>
        <div ref={textRef} className="mt-4 flex flex-col gap-2 px-6">
          <h3 className="hero-heading font-display text-[clamp(2rem,5vw,4rem)]">{place.city}</h3>
          <p className="text-foreground/50 font-body text-sm tracking-widest uppercase">{place.country} · {place.years}</p>
          <p className="text-accent font-display text-lg mt-1">{t(`${place.key}.tagline`)}</p>
          <p className="text-foreground/70 font-body leading-relaxed max-w-prose mt-1">{t(`${place.key}.story`)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-full flex-shrink-0 flex items-center px-16 gap-16">
      <div
        className="rounded-xl overflow-hidden flex-shrink-0 relative aspect-[4/3] bg-paper"
        style={{ width: 'min(55vh, 600px)' }}
      >
        <Image src={place.sprite} alt={place.city} fill className="object-cover" />
      </div>

      <div ref={textRef} className="flex flex-col gap-3 max-w-md">
        <h3 className="hero-heading font-display text-[clamp(2rem,5vw,4rem)]">{place.city}</h3>
        <p className="text-foreground/50 font-body text-sm tracking-widest uppercase">{place.country} · {place.years}</p>
        <p className="text-accent font-display text-lg mt-1">{t(`${place.key}.tagline`)}</p>
        <p className="text-foreground/70 font-body leading-relaxed mt-1">{t(`${place.key}.story`)}</p>
      </div>
    </div>
  )
}
