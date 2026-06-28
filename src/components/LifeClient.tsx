'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PlacesSection } from '@/components/PlacesSection'

export function LifeClient() {
  const t = useTranslations('life')
  const reduce = useReducedMotion()

  const containerRef = useRef<HTMLDivElement>(null)

  // Filmstrip scroll handlers
  const filmstripRef = useRef<HTMLDivElement>(null)
  const isDownRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = filmstripRef.current
    if (!el) return
    isDownRef.current = true
    startXRef.current = e.pageX - el.offsetLeft
    scrollLeftRef.current = el.scrollLeft
  }

  const handleMouseLeaveOrUp = () => {
    isDownRef.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = filmstripRef.current
    if (!el || !isDownRef.current) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startXRef.current) * 1.5
    el.scrollLeft = scrollLeftRef.current - walk
  }

  useGSAP(
    () => {
      if (reduce || !containerRef.current) return

      // Simple reveal of sections as they enter viewport
      const fadeUpElements = containerRef.current.querySelectorAll('.fade-up-element')
      fadeUpElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      })
    },
    { scope: containerRef, dependencies: [reduce] }
  )

  const logItems = [
    { key: 'watching', label: t('currently.watching_label'), value: t('currently.watching_value') },
    { key: 'reading', label: t('currently.reading_label'), value: t('currently.reading_value') },
    { key: 'building', label: t('currently.building_label'), value: t('currently.building_value') },
    { key: 'eating', label: t('currently.eating_label'), value: t('currently.eating_value') },
    { key: 'learning', label: t('currently.learning_label'), value: t('currently.learning_value') },
  ]

  return (
    <div ref={containerRef} className="w-full bg-[#0A0A0A] text-[#F5E6C8] selection:bg-accent selection:text-white">
      
      {/* Section 1: Intro */}
      <section className="min-h-[70vh] flex flex-col justify-center px-[10vw] py-12 md:py-24" id="intro">
        <h1 className="font-display text-hero mb-8 text-[#F5E6C8] uppercase tracking-tight">
          {t('heading')}
        </h1>
        <p className="max-w-2xl text-xl md:text-2xl leading-relaxed text-[#F5E6C8]/80 font-body font-light">
          {t('intro')}
        </p>
      </section>

      {/* Section 2: Journey (Interactive Scroll-Driven Flight Path Simulator) */}
      <PlacesSection />

      {/* Section 3: Currently Log */}
      <section className="px-[10vw] py-24 md:py-32 fade-up-element" id="log">
        <span className="font-mono text-accent text-xs tracking-[0.3em] mb-12 block uppercase">
          {t('currently_eyebrow')}
        </span>
        <div className="space-y-12 max-w-4xl">
          {logItems.map((item) => (
            <div key={item.key} className="border-t border-rule pt-6">
              <span className="font-mono text-accent text-xs uppercase tracking-widest block mb-2">
                {item.label}
              </span>
              <p className={`font-body text-ink text-lg md:text-xl font-light ${item.key === 'reading' ? 'italic' : ''}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Filmstrip */}
      <section className="py-24 md:py-32 overflow-hidden fade-up-element" id="filmstrip-section">
        <div className="px-[10vw] mb-8">
          <span className="font-mono text-accent text-xs tracking-[0.3em] uppercase">
            {t('road_eyebrow')}
          </span>
        </div>

        <div
          ref={filmstripRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className="cursor-grab active:cursor-grabbing flex gap-12 px-[10vw] py-12 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {/* Saxon Switzerland */}
          <div className="min-w-[300px] flex flex-col items-center rotate-[-2deg] transition-transform duration-500 hover:rotate-0 select-none">
            <div className="w-full aspect-[4/5] relative bg-[#141313] p-1.5 border border-rule shadow-xl">
              <div className="w-full h-full relative overflow-hidden">
                <Image
                  src="/road_saxon.jpg"
                  alt="Saxon Switzerland"
                  fill
                  className="object-cover pointer-events-none"
                />
              </div>
            </div>
            <span className="font-mono text-[10px] mt-4 tracking-tighter opacity-50 uppercase">
              {t('road.saxon')}
            </span>
          </div>

          {/* Alps, Austria */}
          <div className="min-w-[400px] flex flex-col items-center rotate-[3deg] transition-transform duration-500 hover:rotate-0 select-none">
            <div className="w-full aspect-video relative bg-[#141313] p-1.5 border border-rule shadow-xl">
              <div className="w-full h-full relative overflow-hidden">
                <Image
                  src="/road_alps.jpg"
                  alt="Alps, Austria"
                  fill
                  className="object-cover pointer-events-none"
                />
              </div>
            </div>
            <span className="font-mono text-[10px] mt-4 tracking-tighter opacity-50 uppercase">
              {t('road.alps')}
            </span>
          </div>

          {/* Berlin */}
          <div className="min-w-[300px] flex flex-col items-center rotate-[-1deg] transition-transform duration-500 hover:rotate-0 select-none">
            <div className="w-full aspect-[4/5] relative bg-[#141313] p-1.5 border border-rule shadow-xl">
              <div className="w-full h-full relative overflow-hidden">
                <Image
                  src="/road_berlin.jpg"
                  alt="Berlin"
                  fill
                  className="object-cover pointer-events-none"
                />
              </div>
            </div>
            <span className="font-mono text-[10px] mt-4 tracking-tighter opacity-50 uppercase">
              {t('road.berlin')}
            </span>
          </div>
        </div>
      </section>

      {/* Section 5: Quote & Kannada */}
      <section className="px-[10vw] py-24 md:py-32 fade-up-element" id="quotes">
        <span className="font-mono text-[#F5E6C8]/40 text-xs tracking-[0.3em] mb-12 block uppercase">
          {t('quotes_eyebrow')}
        </span>
        <div className="max-w-4xl space-y-12">
          <blockquote className="font-body text-3xl md:text-5xl text-[#F5E6C8]/80 leading-tight font-light">
            {t('quote')}
          </blockquote>
        </div>
      </section>

      {/* Kannada Phrase Section */}
      <section className="py-32 flex justify-center items-center overflow-hidden">
        <div className="text-5xl md:text-8xl font-bold kannada-glow cursor-default select-none text-[#F5E6C8] opacity-20 hover:opacity-100 transition-all duration-300 tracking-wide text-center px-6">
          ದ ಲೆಸ್ ಐ Know ದ Better
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center w-full px-[10vw] py-8 gap-4 border-t border-rule font-mono text-[11px] uppercase tracking-widest bg-[#0A0A0A] text-[#F5E6C8]">
        <div>{t('footer.designed_as')}</div>
        <div className="flex gap-8">
          <span className="text-[#F5E6C8]/50">{t('footer.find_me')}</span>
          <a
            className="text-[#F5E6C8] hover:text-accent transition-colors underline decoration-accent underline-offset-4"
            href="https://instagram.com/lohith_pras"
            target="_blank"
            rel="noopener noreferrer"
          >
            INSTAGRAM
          </a>
          <a
            className="text-[#F5E6C8] hover:text-accent transition-colors underline decoration-accent underline-offset-4"
            href="https://github.com/lohith-pras"
            target="_blank"
            rel="noopener noreferrer"
          >
            GITHUB
          </a>
        </div>
      </footer>

    </div>
  )
}
