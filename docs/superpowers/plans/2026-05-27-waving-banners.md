# Waving Banners ("In the Stands") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an "In the Stands" section to the Life page with two waving vertical banners (RBR and RCB), placed immediately after the page intro, with photos moved to the bottom.

**Architecture:** A new `WavingFlag` client component renders a single banner as 10 stacked horizontal strips. Framer Motion `useAnimationFrame` drives `translateX` on each strip imperatively (no re-renders). `LifeClient.tsx` imports `WavingFlag` twice and reorders its sections.

**Tech Stack:** Next.js 15, React 19, Framer Motion 12 (`useAnimationFrame`, `useReducedMotion`)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/WavingFlag.tsx` | Create | Single animated banner — strips, wave RAF loop, reduced-motion fallback |
| `src/components/LifeClient.tsx` | Modify | Add "In the Stands" section (top), reorder sections, move photos to bottom |

---

### Task 1: Source logo URLs

**Files:**
- No code changes — research step only

- [ ] **Step 1: Find Red Bull Racing logo URL**

  Navigate to `https://www.formula1.com/en/teams/red-bull-racing` or `https://www.redbullracing.com` in a browser. Right-click the team logo → "Copy image address". You want a PNG or SVG on a transparent background, ideally square. Note the URL.

  Alternatively, use this Formula 1 CDN pattern (verify it resolves):
  `https://media.formula1.com/image/upload/f_auto/q_auto/v1677244987/content/dam/fom-website/teams/2023/red-bull-racing.png`

- [ ] **Step 2: Find Royal Challengers Bengaluru logo URL**

  Navigate to `https://www.iplt20.com/teams/royal-challengers-bengaluru` or `https://www.rcbofficial.com`. Right-click the team crest → "Copy image address". Note the URL.

- [ ] **Step 3: Verify both URLs load**

  Paste each URL into a browser address bar. Confirm both images render correctly. If either is broken, try the team's official site directly and locate the logo in their media/assets section.

- [ ] **Step 4: Note the two URLs for use in Task 3**

  Keep them accessible — you will pass them as `logoUrl` props in Task 3.

---

### Task 2: Create `WavingFlag.tsx`

**Files:**
- Create: `src/components/WavingFlag.tsx`

- [ ] **Step 1: Create the file with the component**

  Create `src/components/WavingFlag.tsx` with the following content:

  ```tsx
  'use client'

  import { useRef } from 'react'
  import { useAnimationFrame, useReducedMotion } from 'framer-motion'

  interface WavingFlagProps {
    bgColor: string
    accentColor: string
    number: string
    logoUrl: string
    logoAlt: string
    phaseOffset?: number
  }

  const SPEED = 1.5
  const MAX_AMPLITUDE = 7
  const STRIP_COUNT = 10
  const BANNER_WIDTH = 70
  const BANNER_HEIGHT = 180
  const STRIP_HEIGHT = BANNER_HEIGHT / STRIP_COUNT // 18

  export function WavingFlag({
    bgColor,
    accentColor,
    number,
    logoUrl,
    logoAlt,
    phaseOffset = 0,
  }: WavingFlagProps) {
    const stripsRef = useRef<(HTMLDivElement | null)[]>([])
    const isReducedMotion = useReducedMotion()

    useAnimationFrame((t) => {
      if (isReducedMotion) return
      stripsRef.current.forEach((el, i) => {
        if (!el) return
        const tNorm = i / (STRIP_COUNT - 1)
        const amplitude = tNorm * MAX_AMPLITUDE
        const phase = tNorm * Math.PI * 2
        const tSec = t * 0.001
        el.style.transform = `translateX(${amplitude * Math.sin(SPEED * tSec + phase + phaseOffset)}px)`
      })
    })

    return (
      <div className="flex flex-col items-center">
        {/* Hanging rod */}
        <div
          style={{
            width: BANNER_WIDTH,
            height: 2,
            backgroundColor: 'rgba(255,255,255,0.3)',
          }}
        />
        {/* Banner strips */}
        <div style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT }}>
          {Array.from({ length: STRIP_COUNT }).map((_, i) => (
            <div
              key={i}
              ref={(el) => { stripsRef.current[i] = el }}
              style={{ overflow: 'hidden', height: STRIP_HEIGHT, position: 'relative' }}
            >
              {/* Full banner content, clipped by parent overflow:hidden */}
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
                  style={{ width: '100%', objectFit: 'contain', maxHeight: 72 }}
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

- [ ] **Step 2: Type-check**

  ```bash
  rtk tsc
  ```

  Expected: no errors for `WavingFlag.tsx`. (Other pre-existing errors are acceptable.)

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/WavingFlag.tsx
  git commit -m "feat: add WavingFlag component with RAF wave animation"
  ```

---

### Task 3: Update `LifeClient.tsx`

**Files:**
- Modify: `src/components/LifeClient.tsx`

- [ ] **Step 1: Add WavingFlag import**

  At the top of `src/components/LifeClient.tsx`, add:

  ```tsx
  import { WavingFlag } from '@/components/WavingFlag'
  ```

- [ ] **Step 2: Reorder sections and add "In the Stands"**

  Replace the entire `return` block with the following. Use the two logo URLs you sourced in Task 1 for the `logoUrl` props:

  ```tsx
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-16"
    >
      {/* 1. Intro */}
      <motion.section variants={item}>
        <h1 className="text-4xl font-bold mb-8">Life.</h1>
        <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
          Beyond the screen, I explore the world through travel, capture moments, and obsess over the details of good design and engineering.
        </p>
      </motion.section>

      {/* 2. In the Stands — waving banners */}
      <motion.section variants={item}>
        <h2 className="text-2xl font-bold mb-6">In the Stands</h2>
        <div className="flex gap-6">
          <WavingFlag
            bgColor="#001489"
            accentColor="#FF0000"
            number="3"
            logoUrl="PASTE_RBR_LOGO_URL_HERE"
            logoAlt="Red Bull Racing logo"
            phaseOffset={0}
          />
          <WavingFlag
            bgColor="#D40024"
            accentColor="#FFC906"
            number="18"
            logoUrl="PASTE_RCB_LOGO_URL_HERE"
            logoAlt="Royal Challengers Bengaluru logo"
            phaseOffset={0.8}
          />
        </div>
      </motion.section>

      {/* 3. Hobbies + Current Obsessions */}
      <motion.section variants={item} className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Hobbies</h2>
          <ul className="space-y-3 text-white/70">
            <li>Photography</li>
            <li>Minimalist Design</li>
            <li>Mechanical Keyboards</li>
            <li>F1 Racing</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Current Obsessions</h2>
          <ul className="space-y-3 text-white/70">
            <li>Local LLMs</li>
            <li>Next.js 15 Static Rendering</li>
            <li>GSAP ScrollTrigger</li>
            <li>Framer Motion Intercepting Routes</li>
          </ul>
        </div>
      </motion.section>

      {/* 4. Photos — moved to bottom */}
      <motion.section variants={item} className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            className="aspect-square bg-white/5 rounded-lg border border-white/10 overflow-hidden relative flex items-center justify-center"
            style={{ rotate: photo.rot }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          >
            <span className="text-white/20">Photo {i+1}</span>
          </motion.div>
        ))}
      </motion.section>
    </motion.div>
  )
  ```

  **Replace** `PASTE_RBR_LOGO_URL_HERE` and `PASTE_RCB_LOGO_URL_HERE` with the actual URLs from Task 1 before saving.

- [ ] **Step 3: Type-check**

  ```bash
  rtk tsc
  ```

  Expected: no new errors.

- [ ] **Step 4: Visual verification in browser**

  Open `http://localhost:3000/en/life` (or `/life` depending on locale setup). Verify:
  - "In the Stands" heading appears immediately below the intro paragraph
  - Two banners visible side-by-side — dark navy (RBR) and red (RCB)
  - Team logos render in top portion of each banner
  - Numbers "3" and "18" in accent colors at bottom
  - Banners wave independently (different phase, not in sync)
  - Top strips barely move, bottom strips move ~7px
  - Photos grid appears at the bottom, after Hobbies + Obsessions

- [ ] **Step 5: Verify reduced-motion**

  In browser DevTools → Rendering panel → check "Emulate CSS media feature prefers-reduced-motion: reduce". Reload page. Verify banners render flat (no wave), still visible with correct colors and logos.

  Uncheck to restore.

- [ ] **Step 6: Commit**

  ```bash
  git add src/components/LifeClient.tsx
  git commit -m "feat: add In the Stands section to Life page with waving banners"
  ```
