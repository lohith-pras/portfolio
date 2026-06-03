'use client'

/**
 * HeroSection.tsx — Full hero layout wrapper.
 *
 * HERO-02: Displays full name via HeroTitle.
 *
 * Layout:
 *   - Outer <section> (#hero) hosts the pinned HeroStage (≈500vh scroll → progress).
 *   - Content sits in the pinned screen, lower-left, above the city background (z-10).
 *
 * The old scroll-indicator caret + gradient-fade are dropped here — the scroll
 * descent replaces them (re-added with the title sequence in a later milestone).
 */

import { HeroTitle } from '@/components/HeroTitle'
import { HeroStage } from '@/components/hero/HeroStage'

export function HeroSection() {
  return (
    <section id="hero" className="relative w-full">
      <HeroStage>
        <div className="relative z-10 h-full max-w-7xl w-full mx-auto flex flex-col justify-end pb-24 px-6 md:px-16">
          <HeroTitle />
        </div>
      </HeroStage>
    </section>
  )
}
