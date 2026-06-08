'use client'

import { useState } from 'react'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '@/lib/gsap'

/**
 * SkipIntro — a fixed button (lower-right) that smooth-scrolls to #about,
 * letting the user bypass the scroll-driven descent entirely.
 */
export function SkipIntro() {
  const [show, setShow] = useState(true)

  useGSAP(() => {
    const about = document.getElementById('about')
    if (about) {
      ScrollTrigger.create({
        trigger: about,
        start: 'top 60%',
        onEnter: () => setShow(false),
        onLeaveBack: () => setShow(true),
      })
    }
  }, [])

  const skip = () => {
    const about = document.getElementById('about')
    about?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <button
      id="skip-intro"
      onClick={skip}
      className={`fixed bottom-6 right-6 z-50 font-body text-xs tracking-widest uppercase transition-opacity duration-500 ${
        show ? 'opacity-60 hover:opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-label="Skip intro and jump to About section"
    >
      Skip intro →
    </button>
  )
}
