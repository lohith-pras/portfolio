import type Lenis from 'lenis'

// Module-level holder for the single Lenis instance created in SmoothScroll.
// Lets other components scroll programmatically through Lenis (lenis.scrollTo)
// instead of fighting it with window.scrollTo. Null when Lenis is inactive
// (reduced motion, before mount, after unmount).
let instance: Lenis | null = null

export function setLenis(l: Lenis | null) {
  instance = l
}

export function getLenis(): Lenis | null {
  return instance
}
