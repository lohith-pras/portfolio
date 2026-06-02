// Central motion-token library — GSAP, Framer Motion, and CSS all draw from here.
// No bare ease/ease-in-out strings anywhere in the project; import from '@/lib/motion'.

type EasingArray = readonly [number, number, number, number]

export interface EasingToken {
  /** CSS cubic-bezier string, e.g. for Tailwind / inline styles */
  css: string
  /** [x1, y1, x2, y2] tuple — usable directly as Framer Motion `ease` prop */
  array: EasingArray
}

export const easing = {
  /** expo-out — section enters, card lifts, stagger */
  enter: {
    css: 'cubic-bezier(0.22, 1, 0.36, 1)',
    array: [0.22, 1, 0.36, 1] as const,
  },
  /** ease-in — section leaves / disperse */
  exit: {
    css: 'cubic-bezier(0.4, 0, 1, 1)',
    array: [0.4, 0, 1, 1] as const,
  },
  /** slight overshoot — hover lift, speedMultiplier ramp */
  hover: {
    css: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
    array: [0.34, 1.3, 0.64, 1] as const,
  },
  /** linear — GSAP ScrollTrigger camera (scroll-driven, not time-driven) */
  scrub: {
    css: 'linear',
    array: [0, 0, 1, 1] as const,
  },
} as const satisfies Record<string, EasingToken>

/** Framer Motion spring for pointer-follow card tilt — no wobble */
export const signatureSpring = {
  type: 'spring',
  stiffness: 200,
  damping: 26,
  bounce: 0,
} as const

/** Durations in seconds (Framer Motion's unit) */
export const durations = {
  section: 0.45,
  hover: 0.18,
  heroConverge: 1.5,
} as const
