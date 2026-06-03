'use client'

/**
 * SkipIntro — a fixed button (lower-right) that smooth-scrolls to #about,
 * letting the user bypass the scroll-driven descent entirely.
 */
export function SkipIntro() {
  const skip = () => {
    const about = document.getElementById('about')
    about?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <button
      id="skip-intro"
      onClick={skip}
      className="fixed bottom-6 right-6 z-50 pointer-events-auto font-body text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
      aria-label="Skip intro and jump to About section"
    >
      Skip intro →
    </button>
  )
}
