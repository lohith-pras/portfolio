'use client'

import { useState, useEffect } from 'react'

/**
 * SkipIntro — a fixed button (lower-right) that smooth-scrolls to #about,
 * letting the user bypass the scroll-driven descent entirely.
 */
export function SkipIntro() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const about = document.getElementById('about')
      if (about) {
        setShow(about.getBoundingClientRect().top > window.innerHeight * 0.6)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const skip = () => {
    const about = document.getElementById('about')
    about?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <button
      id="skip-intro"
      onClick={skip}
      className={`fixed bottom-6 right-6 z-50 font-body text-xs tracking-widest uppercase transition-all duration-500 ${
        show ? 'opacity-60 hover:opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-label="Skip intro and jump to About section"
    >
      Skip intro →
    </button>
  )
}
