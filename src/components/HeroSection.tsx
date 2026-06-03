'use client'

/**
 * HeroSection.tsx — Full hero layout wrapper.
 *
 * HERO-02: Displays full name via HeroTitle (through DescentTitle).
 *
 * Layout:
 *   - Outer <section> (#hero) hosts the pinned HeroStage (≈500vh scroll → progress).
 *   - DescentTitle manages caret + title fade-in + dock entirely via rAF.
 *   - SkipIntro is mounted outside HeroStage (fixed, always reachable).
 */

import { HeroStage } from '@/components/hero/HeroStage'
import { DescentTitle } from '@/components/hero/DescentTitle'
import { SkipIntro } from '@/components/hero/SkipIntro'

export function HeroSection() {
  return (
    <section id="hero" className="relative w-full">
      <HeroStage>
        <div className="relative z-10 h-full w-full">
          <DescentTitle />
        </div>
      </HeroStage>
      <SkipIntro />
    </section>
  )
}
