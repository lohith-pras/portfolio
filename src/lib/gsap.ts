'use client'

// Central GSAP import surface — ALL components import from '@/lib/gsap', NEVER from 'gsap' directly.
// This guarantees plugins are registered exactly once before first use.
// Registering inside a hook (useEffect/useGSAP) re-registers every render — PITFALL.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, ScrambleTextPlugin)
}

export { gsap, ScrollTrigger, DrawSVGPlugin, ScrambleTextPlugin }

