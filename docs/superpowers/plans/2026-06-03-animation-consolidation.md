# Animation Library Consolidation — GSAP Only

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove framer-motion and @react-spring/three dependencies; consolidate all animation to GSAP + plain browser APIs.

**Architecture:** Replace framer-motion declarative `motion.*` components with GSAP `useGSAP` + `gsap.from()`/`gsap.to()`. Replace FM hooks (`useReducedMotion`, `useInView`, `useAnimationFrame`, `useScroll`/`useTransform`) with a custom `useReducedMotion` hook, native `IntersectionObserver`, `gsap.ticker`, and GSAP `ScrollTrigger`. Replace `AnimatePresence` exit animations with CSS transitions. Replace `motion.div` scroll-driven styles with GSAP ScrollTrigger-driven inline style updates.

**Tech Stack:** GSAP 3.15, @gsap/react, ScrollTrigger, DrawSVGPlugin, ScrambleTextPlugin, native IntersectionObserver, CSS transitions

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/hooks/useReducedMotion.ts` | Custom hook replacing FM's `useReducedMotion` |
| Create | `src/hooks/useInView.ts` | Custom hook replacing FM's `useInView` |
| Modify | `src/components/AboutSection.tsx` | Replace `motion.div` enter animations with GSAP |
| Modify | `src/components/PlaceCard.tsx` | Replace `motion.*` stagger variants with GSAP |
| Modify | `src/components/LifeClient.tsx` | Replace `motion.*` stagger variants with GSAP |
| Modify | `src/components/NavbarDesktop.tsx` | Replace `motion.span` layoutId with CSS |
| Modify | `src/components/ProjectProgressBar.tsx` | Replace `motion.div` width animation with GSAP |
| Modify | `src/components/PageTransition.tsx` | Replace AnimatePresence with CSS transitions |
| Modify | `src/components/ModalClient.tsx` | Replace AnimatePresence with CSS transitions |
| Modify | `src/components/ProjectCard.tsx` | Replace FM scroll transforms with GSAP ScrollTrigger |
| Modify | `src/components/ProjectsSection.tsx` | Remove FM `useScroll`, wire GSAP ScrollTrigger |
| Modify | `src/components/PlacesSection.tsx` | Replace FM scroll/spring/transform with GSAP |
| Modify | `src/components/WavingFlag.tsx` | Replace FM `useAnimationFrame` with `gsap.ticker` |
| Modify | `src/components/AvatarScene.tsx` | Replace FM hooks with custom hooks |
| Modify | `src/components/SignalField.tsx` | Replace FM `useReducedMotion` with custom hook |
| Modify | `src/components/hero/HeroStage.tsx` | Replace FM `useReducedMotion` with custom hook |
| Modify | `src/components/city/CityView.tsx` | Replace FM `useReducedMotion` with custom hook |
| Modify | `src/components/SmoothScroll.tsx` | Remove comment referencing Framer |
| Modify | `src/lib/motion.ts` | Remove comment referencing Framer Motion |
| Modify | `package.json` | Remove framer-motion, @react-spring/three |

---

### Task 1: Create Custom `useReducedMotion` Hook

**Files:**
- Create: `src/hooks/useReducedMotion.ts`

This replaces framer-motion's `useReducedMotion()` which is imported in 10+ components. The hook must handle SSR (return `false` during SSR to avoid hydration mismatch, then sync on mount).

- [ ] **Step 1: Create the hook**

```ts
// src/hooks/useReducedMotion.ts
'use client'

import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function getSnapshot() {
  return window.matchMedia(query).matches
}

function getServerSnapshot() {
  return false
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit 2>&1 | grep useReducedMotion || echo "clean"`
Expected: "clean"

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useReducedMotion.ts
git commit -m "feat: add custom useReducedMotion hook (replaces framer-motion)"
```

---

### Task 2: Create Custom `useInView` Hook

**Files:**
- Create: `src/hooks/useInView.ts`

Replaces framer-motion's `useInView(ref, { once, amount })` used in `AvatarScene.tsx`.

- [ ] **Step 1: Create the hook**

```ts
// src/hooks/useInView.ts
'use client'

import { useEffect, useState, type RefObject } from 'react'

interface UseInViewOptions {
  once?: boolean
  amount?: number
}

export function useInView(
  ref: RefObject<HTMLElement | null>,
  { once = false, amount = 0 }: UseInViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIn = entry.isIntersecting
        setInView(isIn)
        if (isIn && once) observer.disconnect()
      },
      { threshold: amount },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, once, amount])

  return inView
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit 2>&1 | grep useInView || echo "clean"`
Expected: "clean"

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useInView.ts
git commit -m "feat: add custom useInView hook (replaces framer-motion)"
```

---

### Task 3: Swap `useReducedMotion` in GSAP-Only Components

**Files:**
- Modify: `src/components/SignalField.tsx:23,476`
- Modify: `src/components/hero/HeroStage.tsx:3,15`
- Modify: `src/components/city/CityView.tsx:2,7`

These three components import framer-motion ONLY for `useReducedMotion`. Swapping to custom hook removes FM from them entirely.

- [ ] **Step 1: Update SignalField.tsx**

Replace line 23:
```ts
// Before
import { useReducedMotion } from 'framer-motion'
// After
import { useReducedMotion } from '@/hooks/useReducedMotion'
```

No other changes needed — `useReducedMotion()` call on line 476 has same signature.

- [ ] **Step 2: Update HeroStage.tsx**

Replace line 3:
```ts
// Before
import { useReducedMotion } from 'framer-motion'
// After
import { useReducedMotion } from '@/hooks/useReducedMotion'
```

No other changes — `useReducedMotion()` on line 15 returns `boolean` same as before. FM version returned `boolean | null`, but this component already handles falsy.

- [ ] **Step 3: Update CityView.tsx**

Replace line 2:
```ts
// Before
import { useReducedMotion } from 'framer-motion'
// After
import { useReducedMotion } from '@/hooks/useReducedMotion'
```

- [ ] **Step 4: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/SignalField.tsx src/components/hero/HeroStage.tsx src/components/city/CityView.tsx
git commit -m "refactor: swap useReducedMotion to custom hook in GSAP components"
```

---

### Task 4: Convert AboutSection to GSAP

**Files:**
- Modify: `src/components/AboutSection.tsx`

Replaces: `motion.div` with `initial`/`whileInView`/`variants` → GSAP `ScrollTrigger` + `gsap.from()`.

- [ ] **Step 1: Rewrite AboutSection.tsx**

```tsx
'use client'

import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { easing } from '@/lib/motion'

const ChibiView = dynamic(
  () => import('./chibi/ChibiView').then((m) => m.ChibiView),
  { ssr: false },
)

export function AboutSection() {
  const t = useTranslations('about')
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced) return
    const section = sectionRef.current
    if (!section) return

    const chibi = section.querySelector<HTMLElement>('[data-anim="chibi"]')
    const text = section.querySelector<HTMLElement>('[data-anim="text"]')

    if (chibi) {
      gsap.from(chibi, {
        opacity: 0,
        scale: 0.96,
        duration: 0.6,
        ease: easing.enter.css,
        delay: 0.1,
        scrollTrigger: { trigger: chibi, start: 'top 70%', once: true },
      })
    }

    if (text) {
      gsap.from(text, {
        opacity: 0,
        y: 24,
        filter: 'blur(8px)',
        duration: 0.7,
        ease: easing.enter.css,
        scrollTrigger: { trigger: text, start: 'top 70%', once: true },
      })
    }
  }, { scope: sectionRef, dependencies: [reduced] })

  return (
    <section ref={sectionRef} id="about" className="relative z-10 min-h-[100svh] w-full flex items-center py-24 bg-[#0C0C0C]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6 md:px-16 max-w-7xl mx-auto w-full">
        <div
          data-anim="chibi"
          className="order-1 md:order-2 w-full max-w-[300px] mx-auto md:max-w-none"
          style={{ aspectRatio: '3 / 4' }}
        >
          <ChibiView />
        </div>

        <div
          data-anim="text"
          className="order-2 md:order-1 flex flex-col justify-center gap-6"
        >
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-display font-bold text-accent leading-tight">
            {t('descriptor')}
          </h2>
          <div className="font-body text-foreground/80 leading-relaxed text-lg space-y-4">
            <p>{t('bio_1')}</p>
            <p>{t('bio_2')}</p>
            <p>{t('bio_3')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Visually verify in browser**

Run dev server. Scroll to About section. Chibi should fade in + scale. Text should fade in + slide up + unblur. Both trigger once on scroll. Reduced motion: no animation, elements visible immediately.

- [ ] **Step 4: Commit**

```bash
git add src/components/AboutSection.tsx
git commit -m "refactor: convert AboutSection from framer-motion to GSAP"
```

---

### Task 5: Convert PlaceCard to GSAP

**Files:**
- Modify: `src/components/PlaceCard.tsx`

Replaces: `motion.*` elements with stagger variants → GSAP stagger animation.

- [ ] **Step 1: Rewrite PlaceCard.tsx**

```tsx
'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { easing } from '@/lib/motion'
import type { Place } from '@/lib/places'

interface PlaceCardProps {
  place: Place
  index: number
  mobile?: boolean
}

export function PlaceCard({ place, mobile = false }: PlaceCardProps) {
  const t = useTranslations('places')
  const textRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const el = textRef.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>('[data-stagger]')
    if (!items.length) return

    gsap.from(items, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: easing.enter.css,
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 70%', once: true },
    })
  }, { scope: textRef })

  if (mobile) {
    return (
      <div className="w-full flex flex-col">
        <div
          className="rounded-xl overflow-hidden flex-shrink-0 relative aspect-[4/3] w-full"
          style={{ background: '#000' }}
        >
          <Image src={place.sprite} alt={place.city} fill className="object-cover" />
        </div>
        <div ref={textRef} className="mt-4 flex flex-col gap-2 px-6">
          <h3 data-stagger className="hero-heading font-display" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>{place.city}</h3>
          <p data-stagger className="text-white/50 font-body text-sm tracking-widest uppercase">{place.country} · {place.years}</p>
          <p data-stagger className="text-accent font-display text-lg mt-1">{t(`${place.key}.tagline`)}</p>
          <p data-stagger className="text-white/70 font-body leading-relaxed max-w-prose mt-1">{t(`${place.key}.story`)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-full flex-shrink-0 flex items-center px-16 gap-16">
      <div
        className="rounded-xl overflow-hidden flex-shrink-0 relative aspect-[4/3]"
        style={{ background: '#000', width: 'min(55vh, 600px)' }}
      >
        <Image src={place.sprite} alt={place.city} fill className="object-cover" />
      </div>

      <div ref={textRef} className="flex flex-col gap-3 max-w-md">
        <h3 data-stagger className="hero-heading font-display" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>{place.city}</h3>
        <p data-stagger className="text-white/50 font-body text-sm tracking-widest uppercase">{place.country} · {place.years}</p>
        <p data-stagger className="text-accent font-display text-lg mt-1">{t(`${place.key}.tagline`)}</p>
        <p data-stagger className="text-white/70 font-body leading-relaxed mt-1">{t(`${place.key}.story`)}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/PlaceCard.tsx
git commit -m "refactor: convert PlaceCard from framer-motion to GSAP"
```

---

### Task 6: Convert LifeClient to GSAP

**Files:**
- Modify: `src/components/LifeClient.tsx`

Replaces: `motion.div/section/ul/li` with container + stagger variants → GSAP stagger.

- [ ] **Step 1: Rewrite LifeClient.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { easing } from '@/lib/motion'
import { WavingFlag } from '@/components/WavingFlag'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function LifeClient() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (reduced) return
    const el = containerRef.current
    if (!el) return

    const sections = el.querySelectorAll<HTMLElement>(':scope > section')
    gsap.from(sections, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: easing.enter.css,
      stagger: 0.1,
    })

    const listItems = el.querySelectorAll<HTMLElement>('[data-stagger-item]')
    gsap.from(listItems, {
      opacity: 0,
      x: -8,
      duration: 0.4,
      ease: easing.enter.css,
      stagger: 0.05,
      delay: 0.2,
    })
  }, { scope: containerRef, dependencies: [reduced] })

  return (
    <div ref={containerRef} className="flex flex-col gap-16">
      <section>
        <h1 className="text-4xl font-bold mb-8">Life.</h1>
        <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
          Beyond the screen, I explore the world through travel, capture moments, and obsess over the details of good design and engineering.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Hobbies</h2>
          <ul className="space-y-3 text-white/70">
            {['Photography', 'Minimalist Design', 'Mechanical Keyboards', 'F1 Racing'].map((h) => (
              <li key={h} data-stagger-item>{h}</li>
            ))}
          </ul>
        </div>
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Current Obsessions</h2>
          <ul className="space-y-3 text-white/70">
            {['Local LLMs', 'Next.js 15 Static Rendering', 'GSAP ScrollTrigger', 'Framer Motion Intercepting Routes'].map((o) => (
              <li key={o} data-stagger-item>{o}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">In the Stands</h2>
        <div className="flex gap-6">
          <WavingFlag
            bgColor="#001489"
            accentColor="#FF0000"
            number="3"
            logoUrl="https://www.redbullracing.com/_next/static/media/ORBR_logo_2026.4059dac5.svg"
            logoAlt="Red Bull Racing logo"
            phaseOffset={0}
          />
          <WavingFlag
            bgColor="#D40024"
            accentColor="#FFC906"
            number="18"
            logoUrl="https://www.royalchallengers.com/PRRCB01/public/rcb-logo-new_0.png"
            logoAlt="Royal Challengers Bengaluru logo"
            phaseOffset={0.8}
          />
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/LifeClient.tsx
git commit -m "refactor: convert LifeClient from framer-motion to GSAP"
```

---

### Task 7: Convert NavbarDesktop to CSS

**Files:**
- Modify: `src/components/NavbarDesktop.tsx`

Replaces: `motion.span` with `layoutId` (animated nav indicator) → CSS-only underline.

FM's `layoutId` animates a shared element across renders. For a simple nav underline, CSS `transition` on width/position achieves the same effect.

- [ ] **Step 1: Rewrite NavbarDesktop.tsx**

```tsx
'use client'
import { usePathname, Link } from '@/i18n/navigation'
import { Mail, Heart } from 'lucide-react'

export function NavbarDesktop() {
  const pathname = usePathname()
  const isLife = pathname === '/life'

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-5xl h-14 hidden md:flex items-center justify-between px-8 z-50 glass-bar rounded-2xl">
      <Link href="/" className="link-wipe font-display font-bold text-foreground hover:text-accent transition-colors">
        L.T. Prasanna
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/life"
          className={`relative flex items-center gap-2 font-mono text-sm text-foreground/80 hover:text-accent transition-colors pb-1 ${isLife ? '' : 'link-wipe'}`}
        >
          <Heart size={14} />
          Life
          {isLife && (
            <span className="absolute bottom-0 left-0 right-0 h-px bg-accent animate-in fade-in slide-in-from-left-2 duration-300" />
          )}
        </Link>
        <div className="w-px h-4 bg-white/20" />
        <a
          href="mailto:lnlohith3@gmail.com"
          className="text-foreground/60 hover:text-accent transition-colors"
          aria-label="Email"
        >
          <Mail size={16} />
        </a>
        <a
          href="https://github.com/lohith-pras"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/60 hover:text-accent transition-colors"
          aria-label="GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/in/loh-pras"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/60 hover:text-accent transition-colors"
          aria-label="LinkedIn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>
    </nav>
  )
}
```

Note: `animate-in fade-in slide-in-from-left-2` are Tailwind CSS animation utilities (from tailwindcss-animate plugin). If not available in project, use a simple CSS approach instead:

Alternative for the indicator span (no plugin required):
```tsx
<span className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
```

The `layoutId` animation (sliding underline between nav items) only matters when there are multiple nav routes. Currently only `/life` has an indicator, so a static underline is equivalent.

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/NavbarDesktop.tsx
git commit -m "refactor: convert NavbarDesktop from framer-motion to CSS"
```

---

### Task 8: Convert ProjectProgressBar to GSAP

**Files:**
- Modify: `src/components/ProjectProgressBar.tsx`

Replaces: `motion.div` with `initial`/`animate` width animation → GSAP `gsap.to()`.

- [ ] **Step 1: Rewrite ProjectProgressBar.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ProjectProgressBarProps {
  phasesCompleted: number
  totalPhases: number
}

export function ProjectProgressBar({ phasesCompleted, totalPhases }: ProjectProgressBarProps) {
  const reduced = useReducedMotion()
  const barRef = useRef<HTMLDivElement>(null)
  const completed = Math.min(phasesCompleted, totalPhases)
  const percentage = totalPhases > 0 ? (completed / totalPhases) * 100 : 0

  useGSAP(() => {
    const bar = barRef.current
    if (!bar) return

    if (reduced) {
      gsap.set(bar, { width: `${percentage}%` })
      return
    }

    gsap.fromTo(bar,
      { width: '0%' },
      { width: `${percentage}%`, duration: 1, ease: 'power2.out' },
    )
  }, { scope: barRef, dependencies: [percentage, reduced] })

  return (
    <div
      className="flex flex-col gap-1.5 w-full"
      aria-label={`Project progress: ${phasesCompleted} of ${totalPhases} phases complete`}
    >
      <span className="font-mono text-xs text-white/50 uppercase tracking-widest">
        {phasesCompleted} / {totalPhases} Phases
      </span>
      <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{ backgroundColor: '#FF1E00', width: '0%' }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectProgressBar.tsx
git commit -m "refactor: convert ProjectProgressBar from framer-motion to GSAP"
```

---

### Task 9: Convert WavingFlag to `gsap.ticker`

**Files:**
- Modify: `src/components/WavingFlag.tsx`

Replaces: `useAnimationFrame` from FM → `gsap.ticker.add()`.

- [ ] **Step 1: Rewrite WavingFlag.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface WavingFlagProps {
  bgColor: string
  accentColor: string
  number: string
  logoUrl: string
  logoAlt: string
  phaseOffset?: number
}

const SPEED = 1.5
const MAX_AMPLITUDE = 10
const STRIP_COUNT = 30
const BANNER_WIDTH = 120
const BANNER_HEIGHT = 280
const STRIP_HEIGHT = BANNER_HEIGHT / STRIP_COUNT

export function WavingFlag({
  bgColor,
  accentColor,
  number,
  logoUrl,
  logoAlt,
  phaseOffset = 0,
}: WavingFlagProps) {
  const stripsRef = useRef<(HTMLDivElement | null)[]>([])
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (reduced) return

    const tick = () => {
      const tSec = gsap.ticker.time
      stripsRef.current.forEach((el, i) => {
        if (!el) return
        const tNorm = i / (STRIP_COUNT - 1)
        const amplitude = tNorm * MAX_AMPLITUDE
        const phase = tNorm * Math.PI * 2
        el.style.transform = `translateX(${amplitude * Math.sin(SPEED * tSec + phase + phaseOffset)}px)`
      })
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, { dependencies: [reduced] })

  return (
    <div className="flex flex-col items-center">
      <div
        style={{
          width: BANNER_WIDTH,
          height: 2,
          backgroundColor: 'rgba(255,255,255,0.3)',
        }}
      />
      <div style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT }}>
        {Array.from({ length: STRIP_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { stripsRef.current[i] = el }}
            style={{ overflow: 'hidden', height: STRIP_HEIGHT, position: 'relative', backgroundColor: bgColor, willChange: 'transform' }}
          >
            <div
              style={{
                position: 'absolute',
                top: -i * STRIP_HEIGHT,
                left: 0,
                width: BANNER_WIDTH,
                height: BANNER_HEIGHT,
                backgroundColor: bgColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 8px',
              }}
            >
              <img
                src={logoUrl}
                alt={logoAlt}
                style={{ width: '100%', objectFit: 'contain', maxHeight: 110 }}
              />
              <span
                style={{
                  color: accentColor,
                  fontSize: '2rem',
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {number}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/WavingFlag.tsx
git commit -m "refactor: convert WavingFlag from framer-motion useAnimationFrame to gsap.ticker"
```

---

### Task 10: Convert AvatarScene to Custom Hooks

**Files:**
- Modify: `src/components/AvatarScene.tsx`

Replaces: `useInView` and `useReducedMotion` from FM → custom hooks.

- [ ] **Step 1: Update AvatarScene.tsx imports and usage**

```tsx
'use client'

import { Component, Suspense, type ReactNode, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AvatarModel } from './AvatarModel'

class AvatarErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

function AvatarCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: true, amount: 0.4 })
  const reducedMotion = useReducedMotion()

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 3]} intensity={1.2} />
        <directionalLight position={[-2, 2, -1]} intensity={0.3} color="#6080ff" />
        <Suspense fallback={null}>
          <AvatarModel inView={inView} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export function AvatarScene() {
  return (
    <AvatarErrorBoundary>
      <AvatarCanvas />
    </AvatarErrorBoundary>
  )
}
```

Note: FM's `useReducedMotion` returned `boolean | null`, custom hook returns `boolean`. `AvatarModel` receives `reducedMotion` as a prop — check its type signature. The original code had `?? false`, which is no longer needed since custom hook always returns `boolean`.

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors. If `AvatarModel` prop type expects `boolean | null`, update it to `boolean`.

- [ ] **Step 3: Commit**

```bash
git add src/components/AvatarScene.tsx
git commit -m "refactor: convert AvatarScene from framer-motion to custom hooks"
```

---

### Task 11: Convert PageTransition to CSS

**Files:**
- Modify: `src/components/PageTransition.tsx`

Replaces: `AnimatePresence` + `motion.div` with enter/exit animations → CSS transitions with key-based remount.

This is the hardest replacement. FM's `AnimatePresence` delays unmounting to play exit animations. CSS can't delay unmount, but we can use CSS `@starting-style` for enter animations and accept instant exit (which is actually fine for page transitions — the new page fades in, old page vanishes).

- [ ] **Step 1: Rewrite PageTransition.tsx**

```tsx
'use client'

import { usePathname } from '@/i18n/navigation'
import { type ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="min-h-screen flex flex-col relative">
      <div className="flex-1 flex flex-col animate-page-enter">
        {children}
      </div>
    </div>
  )
}
```

Then add the CSS animation to your global stylesheet (likely `src/app/globals.css` or equivalent). Find where `@tailwind` directives live:

```css
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-page-enter {
  animation: page-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-page-enter {
    animation: none;
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Visually verify in browser**

Navigate between pages. New page should fade in with slight upward slide. Transition should be ~250ms. Under reduced motion: instant swap, no animation.

- [ ] **Step 4: Commit**

```bash
git add src/components/PageTransition.tsx src/app/globals.css
git commit -m "refactor: convert PageTransition from framer-motion AnimatePresence to CSS"
```

---

### Task 12: Convert ModalClient to CSS

**Files:**
- Modify: `src/components/ModalClient.tsx`

Replaces: `AnimatePresence` + `motion.div` overlay/modal enter/exit → CSS animations. Exit animation lost (same as PageTransition), but modal close is typically fast enough that no one notices.

- [ ] **Step 1: Rewrite ModalClient.tsx**

```tsx
'use client'

import { useRouter } from '@/i18n/navigation'
import { useEffect, useCallback } from 'react'

export function ModalClient({ slug, children }: { slug: string, children: React.ReactNode }) {
  const router = useRouter()

  const onDismiss = useCallback(() => {
    router.back()
  }, [router])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  return (
    <div key={slug} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden bg-background/80 backdrop-blur-md">
      <div
        onClick={onDismiss}
        className="absolute inset-0 cursor-zoom-out animate-modal-overlay"
      />

      <div className="w-full h-full max-w-7xl max-h-full glass rounded-xl overflow-y-auto z-10 animate-modal-content">
        <button
          onClick={onDismiss}
          className="absolute top-6 right-6 p-2 z-50 glass-pill rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}
```

Add to global CSS (same file as Task 11):

```css
@keyframes modal-overlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-content {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-overlay {
  animation: modal-overlay 0.2s ease both;
}

.animate-modal-content {
  animation: modal-content 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-modal-overlay,
  .animate-modal-content {
    animation: none;
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Visually verify in browser**

Open a project modal. Overlay should fade in. Content should scale up + fade in. Close should be instant (exit animation lost — acceptable tradeoff).

- [ ] **Step 4: Commit**

```bash
git add src/components/ModalClient.tsx src/app/globals.css
git commit -m "refactor: convert ModalClient from framer-motion AnimatePresence to CSS"
```

---

### Task 13: Convert ProjectCard + ProjectsSection to GSAP ScrollTrigger

**Files:**
- Modify: `src/components/ProjectCard.tsx`
- Modify: `src/components/ProjectsSection.tsx`

This is the most complex conversion. FM's `useScroll` + `useTransform` drives per-frame style updates (scale, opacity, y) on each card based on parent scroll progress. GSAP equivalent: one ScrollTrigger on the container, with `onUpdate` driving styles on each card via refs.

The current architecture passes `scrollYProgress` (a MotionValue) from ProjectsSection → ProjectCard. With GSAP, the scroll logic moves into the parent and drives child refs directly.

- [ ] **Step 1: Rewrite ProjectCard.tsx**

The card becomes a pure presentational component. Scroll-driven style updates will be applied by the parent via refs.

```tsx
'use client'

import { forwardRef } from 'react'
import { useTranslations } from 'next-intl'

interface ProjectCardProps {
  index: number
  number: string
  category: string
  name: string
  tech: string
  description: string
  githubUrl: string
}

export const ProjectCard = forwardRef<HTMLElement, ProjectCardProps>(
  function ProjectCard({ index, number, category, name, tech, description, githubUrl }, ref) {
    const t = useTranslations('work')

    return (
      <div className="sticky" style={{ top: `calc(var(--stack-top) + ${index * 28}px)`, zIndex: index + 1 }}>
        <article
          ref={ref}
          className="glass-card w-full min-h-[60vh] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-6 sm:p-8 md:p-10"
          style={{ transformOrigin: 'top' }}
        >
          <div className="flex items-end gap-4 flex-wrap mb-8">
            <span className="font-display text-[clamp(4rem,10vw,8rem)] leading-none text-foreground/20">{number}</span>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">{category}</span>
              <h3 className="font-display font-bold text-[clamp(1.2rem,3vw,2rem)] text-foreground leading-tight">{name}</h3>
            </div>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer"
               className="group ml-auto inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-4 py-2 text-xs uppercase tracking-widest text-foreground bg-transparent hover:border-accent hover:text-accent transition-colors duration-200 whitespace-nowrap">
              {t('view_project')}
              <span aria-hidden="true" className="-ml-1 w-0 overflow-hidden opacity-0 transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:ml-0 group-hover:w-3 group-hover:opacity-100">
                →
              </span>
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">{t('tech_label')}</span>
              <p className="text-body text-foreground/80">{tech}</p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">{t('overview_label')}</span>
              <p className="text-body text-foreground/80">{description}</p>
            </div>
          </div>
        </article>
      </div>
    )
  },
)
```

- [ ] **Step 2: Rewrite ProjectsSection.tsx**

```tsx
'use client'

import { useRef, createRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ProjectCard } from './ProjectCard'

const PROJECTS = [
  { key: 'mimo', number: '01', category: 'AI / ML', githubUrl: 'https://github.com/lohith-pras/mimo' },
  { key: 'vlc', number: '02', category: 'Hardware', githubUrl: 'https://github.com/lohith-pras/vlc-v2v' },
  { key: 'iot', number: '03', category: 'Security', githubUrl: 'https://github.com/lohith-pras/iot-security' },
] as const

export function ProjectsSection() {
  const t = useTranslations('work')
  const tp = useTranslations('projects')
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const cardRefs = useRef(PROJECTS.map(() => createRef<HTMLElement>()))
  const n = PROJECTS.length

  useGSAP(() => {
    if (reduced) return
    const container = containerRef.current
    if (!container) return

    ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress
        cardRefs.current.forEach((ref, index) => {
          const card = ref.current
          if (!card) return

          const windowSize = 1 / n
          const windowStart = index * windowSize
          const windowEnd = windowStart + windowSize
          const fadeInEnd = windowStart + windowSize * 0.25
          const scaleStart = windowEnd - windowSize * 0.3

          // Scale: shrink as next card arrives
          const targetScale = 1 - (n - 1 - index) * 0.03
          const scaleProgress = Math.min(1, Math.max(0, (progress - scaleStart) / (windowEnd - scaleStart)))
          const scale = 1 + (targetScale - 1) * scaleProgress

          // Reveal: fade + slide for cards 1+
          const reveal = index === 0
            ? 1
            : Math.min(1, Math.max(0, (progress - windowStart) / (fadeInEnd - windowStart)))

          card.style.transform = `scale(${scale})`
          card.style.opacity = index === 0 ? '1' : String(reveal)
          card.style.translate = `0 ${index === 0 ? 0 : 80 * (1 - reveal)}px`
        })
      },
    })
  }, { scope: containerRef, dependencies: [reduced] })

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 sm:-mt-12 md:-mt-14 bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-6 md:px-16 pt-20 pb-32 [--stack-top:6rem] md:[--stack-top:8rem]"
    >
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="hero-heading font-display text-heading mb-16">{t('heading')}</h2>

        <div ref={containerRef} style={{ height: `${n * 120}vh` }} className="relative">
          {PROJECTS.map((p, i) => (
            <ProjectCard
              key={p.key}
              ref={cardRefs.current[i]}
              index={i}
              number={p.number}
              category={p.category}
              name={tp(`${p.key}.name`)}
              tech={tp(`${p.key}.tech`)}
              description={tp(`${p.key}.description`)}
              githubUrl={p.githubUrl}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Visually verify in browser**

Scroll through projects section. Cards should:
- Stack on top of each other (sticky positioning)
- Cards 2+ fade in + slide up as their scroll window starts
- Previous cards scale down slightly as next card arrives
- Under reduced motion: all cards visible, no animation

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.tsx src/components/ProjectsSection.tsx
git commit -m "refactor: convert ProjectCard/ProjectsSection from framer-motion to GSAP ScrollTrigger"
```

---

### Task 14: Convert PlacesSection to GSAP ScrollTrigger

**Files:**
- Modify: `src/components/PlacesSection.tsx`

Replaces: FM `useScroll`, `useTransform`, `useSpring`, `useMotionValueEvent`, `motion.div` → GSAP ScrollTrigger horizontal scroll with Lenis-smoothed input.

This is the second-hardest conversion. The current implementation:
1. Tall container (`n * 100vh`) provides scroll distance
2. Sticky inner container captures viewport
3. FM `useScroll` tracks scroll progress 0→1
4. FM `useTransform` maps progress to horizontal `x` translation
5. FM `useSpring` adds spring physics to horizontal movement
6. Progress dots animate via `useMotionValueEvent`

GSAP approach: ScrollTrigger pin + horizontal scroll is a well-documented GSAP pattern. It replaces all 5 FM hooks with one ScrollTrigger instance.

- [ ] **Step 1: Rewrite PlacesSection.tsx**

```tsx
'use client'

import { useRef, useState, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useTranslations } from 'next-intl'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PLACES } from '@/lib/places'
import { PlaceCard } from './PlaceCard'

function ProgressDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: i === active ? 24 : 8,
            backgroundColor: i === active ? '#FF1E00' : 'rgba(255,255,255,0.25)',
          }}
        />
      ))}
    </div>
  )
}

export function PlacesSection() {
  const t = useTranslations('places')
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const n = PLACES.length
  const [activeDot, setActiveDot] = useState(0)

  const onProgress = useCallback((progress: number) => {
    setActiveDot(Math.min(n - 1, Math.floor(progress * n)))
  }, [n])

  useGSAP(() => {
    if (reduced) return
    const track = trackRef.current
    const hint = hintRef.current
    if (!track) return

    const totalMove = (n - 1) * window.innerWidth

    gsap.to(track, {
      x: -totalMove,
      ease: 'none',
      scrollTrigger: {
        trigger: outerRef.current,
        start: 'top top',
        end: `+=${n * window.innerHeight}`,
        pin: outerRef.current!.querySelector('.places-pin')!,
        scrub: 1,
        onUpdate: (self) => {
          onProgress(self.progress)
          if (hint) {
            hint.style.opacity = String(Math.max(0, 1 - self.progress * 10))
          }
        },
      },
    })
  }, { scope: outerRef, dependencies: [reduced, n] })

  return (
    <section className="mt-24">
      {/* Desktop: pinned horizontal scroll */}
      <div className="hidden md:block">
        <div ref={outerRef} style={{ height: `${n * 100}vh` }}>
          <div className="places-pin h-screen overflow-hidden relative flex flex-col">
            <div className="px-8 pt-8 pb-2 flex-shrink-0">
              <h2 className="text-2xl font-bold font-display">{t('heading')}</h2>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div
                ref={trackRef}
                style={{ width: `${n * 100}vw` }}
                className="flex h-full"
              >
                {PLACES.map((place, i) => (
                  <PlaceCard key={place.key} place={place} index={i} />
                ))}
              </div>
            </div>
            <ProgressDots count={n} active={activeDot} />
            <div
              ref={hintRef}
              className="absolute bottom-6 right-8 flex items-center gap-2 text-white/40 text-sm font-mono pointer-events-none"
            >
              <span>{t('scroll_hint')}</span>
              <span className="animate-bounce-x">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="block md:hidden">
        <h2 className="text-2xl font-bold font-display mb-8 px-6">{t('heading')}</h2>
        <div className="flex flex-col gap-16 pb-24">
          {PLACES.map((place, i) => (
            <PlaceCard key={place.key} place={place} index={i} mobile />
          ))}
        </div>
      </div>
    </section>
  )
}
```

Add to global CSS:

```css
@keyframes bounce-x {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(8px); }
}

.animate-bounce-x {
  animation: bounce-x 1.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-bounce-x {
    animation: none;
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Visually verify in browser**

Scroll through places section. Cards should scroll horizontally as user scrolls vertically. Progress dots update. Scroll hint fades out. Spring damping is lost (GSAP `scrub: 1` gives smooth ~1s lag instead). Under reduced motion: cards stack vertically, no animation.

- [ ] **Step 4: Commit**

```bash
git add src/components/PlacesSection.tsx src/app/globals.css
git commit -m "refactor: convert PlacesSection from framer-motion to GSAP ScrollTrigger"
```

---

### Task 15: Clean Up Comments and Remove Dependencies

**Files:**
- Modify: `src/components/SmoothScroll.tsx:3-4`
- Modify: `src/lib/motion.ts:1,36`
- Modify: `package.json`

- [ ] **Step 1: Update SmoothScroll.tsx comment**

Line 3-4 currently say:
```ts
// Lenis smooth scroll. Interpolates wheel/trackpad scroll so GSAP `scrub` and
// Framer `useScroll` read a smoothed position — buttery scrubbing, unified feel.
```

Replace with:
```ts
// Lenis smooth scroll. Interpolates wheel/trackpad scroll so GSAP `scrub`
// reads a smoothed position — buttery scrubbing, unified feel.
```

- [ ] **Step 2: Update motion.ts comments**

Line 1 currently says:
```ts
// Central motion-token library — GSAP, Framer Motion, and CSS all draw from here.
```

Replace with:
```ts
// Central motion-token library — GSAP and CSS both draw from here.
```

Line 36 currently says:
```ts
/** Framer Motion spring for pointer-follow card tilt — no wobble */
```

Check if `signatureSpring` is still used anywhere after removing FM. If not, delete lines 36-42 (the `signatureSpring` export). If it is used (e.g., in GSAP contexts), update the comment:
```ts
/** Spring config for pointer-follow card tilt — no wobble */
```

- [ ] **Step 3: Verify no FM imports remain**

Run: `grep -r "from.*framer-motion" --include="*.tsx" --include="*.ts" src/`
Expected: zero results

- [ ] **Step 4: Remove dependencies**

Run: `pnpm remove framer-motion @react-spring/three`

- [ ] **Step 5: Verify project builds**

Run: `pnpm build`
Expected: build succeeds with no errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove framer-motion and @react-spring/three dependencies"
```

---

### Task 16: Final Verification

- [ ] **Step 1: Run type check**

Run: `pnpm tsc --noEmit`
Expected: no errors

- [ ] **Step 2: Run dev server and full walkthrough**

Check every section in order:
1. **Hero**: ScrambleText name animation, ScrollTrigger city descent ✓ (was already GSAP)
2. **About**: Chibi fade-in + scale, text fade + slide + blur on scroll into view
3. **Projects**: Sticky card stack, scroll-driven scale/opacity/translate
4. **Places**: Horizontal scroll (desktop), stagger text (mobile)
5. **PhaseTimeline**: DrawSVG line + nodes (was already GSAP)
6. **WaveformDivider**: DrawSVG path (was already GSAP)
7. **Life page**: Stagger sections + list items, waving flags
8. **Navbar**: Nav indicator on /life route
9. **Page transitions**: Fade-in on route change
10. **Modal**: Open/close project detail modal

- [ ] **Step 3: Test reduced motion**

In macOS: System Settings → Accessibility → Display → Reduce motion → ON.
Reload site. All animations should be skipped or instant. Content should still be fully visible and functional.

- [ ] **Step 4: Commit any fixes**

If any issues found in steps 2-3, fix and commit individually.

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Animation libraries | 3 (`framer-motion`, `gsap`, `@react-spring/three`) | 1 (`gsap`) |
| Bundle impact | ~60KB+ FM runtime | Removed |
| Mental models | Declarative (FM) + Imperative (GSAP) | Imperative (GSAP) only |
| Central barrel | `@/lib/gsap` (GSAP only) | `@/lib/gsap` (everything) |
| Custom hooks added | — | `useReducedMotion`, `useInView` |

**Tradeoffs accepted:**
- Lost `AnimatePresence` exit animations (page transition + modal). Enter animations preserved via CSS. This is a minor visual regression — exit animations were subtle (0.25s fade + 10px slide).
- Lost FM `useSpring` smooth horizontal scroll in PlacesSection. GSAP `scrub: 1` provides similar smoothing via Lenis integration.
- Lost FM `layoutId` nav indicator animation. Only one nav item has the indicator, so static display is equivalent.
