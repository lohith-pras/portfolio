'use client'

/**
 * ShaderCanvas.tsx — WebGL animated gradient background for the Hero section.
 *
 * Design constraints (HERO-01):
 *  - Palette: #FF4500 (electric orange) → #C0001A (deep crimson) → #0A0A0A (bg)
 *  - Slow, deliberate movement (uSpeed: 0.15) — protects integrated GPUs
 *  - Fixed, full-bleed, behind all content (z-0, pointer-events-none)
 *  - Loaded dynamically with ssr: false — WebGL requires browser canvas context
 *
 * Performance notes:
 *  - powerPreference: "low-power" keeps frame rate sane on integrated graphics
 *  - pixelDensity: 1 caps render resolution (default is devicePixelRatio, costly on HiDPI)
 *  - On mobile, a parent component may hide this element and show a static fallback
 */

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '@/lib/gsap'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

export function ShaderCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const canvas = containerRef.current
    const hero = document.getElementById('hero')

    if (!canvas || !hero) return

    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress // 0 at top, 1 at bottom of hero
        const opacity = 1 - progress

        // Show canvas when it has visible opacity
        if (opacity > 0 && canvas.style.display === 'none') {
          canvas.style.display = ''
        }
        canvas.style.opacity = String(opacity)

        // Release GPU when fully faded
        if (opacity <= 0) {
          canvas.style.display = 'none'
        }
      },
    })

    return () => {
      // Clean up ScrollTrigger
      trigger.kill()
      // Restore canvas to visible state on unmount
      if (canvas) {
        canvas.style.opacity = '1'
        canvas.style.display = ''
      }
    }
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      id="shader-canvas"
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      aria-hidden="true"
      style={{ opacity: 1 }}
    >
      <ShaderGradientCanvas
        className="w-full h-full"
        pixelDensity={1}
        fov={45}
        pointerEvents="none"
        powerPreference="low-power"
        preserveDrawingBuffer={false}
      >
        <ShaderGradient
          type="waterPlane"
          animate="on"
          uTime={0}
          uSpeed={0.15}
          uStrength={2.0}
          uDensity={1.5}
          uFrequency={3.5}
          color1="#FF4500"
          color2="#C0001A"
          color3="#0A0A0A"
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={50}
          rotationY={0}
          rotationZ={-60}
          cAzimuthAngle={180}
          cPolarAngle={80}
          cDistance={2.8}
        />
      </ShaderGradientCanvas>
    </div>
  )
}
