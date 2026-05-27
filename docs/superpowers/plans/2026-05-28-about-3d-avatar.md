# 3D Animated Avatar — About Section Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the SVG placeholder in the About section's glass card with a personalized Ready Player Me chibi avatar, rendered via React Three Fiber, with a looping idle animation and a one-shot wave when the section scrolls into view.

**Spec:** `docs/superpowers/specs/2026-05-28-about-3d-avatar-design.md`

**Approach:**
- Load RPM full-body GLB via `useGLTF`
- Idle: oscillate whole avatar group (Y-rotation sway + Y-position float) via `useFrame`
- Wave: rotate `RightArm` / `RightForeArm` bones via `useFrame` for ~2.5s on first inView
- No external animation files — fully programmatic, no Mixamo/CDN dependency
- `useInView` (Framer Motion) on the Canvas container div; boolean passed as prop into `AvatarModel`
- Canvas: `alpha: true`, camera at `[0, 0, 2.5]`, `fov: 35`, avatar group offset `[0, -0.85, 0]`

**Tech Stack:** Next.js 15, React 19, @react-three/fiber, @react-three/drei, three, framer-motion (all already installed)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/avatar.ts` | Create | RPM avatar URL constant |
| `src/components/AvatarModel.tsx` | Create | GLB loader, bone refs, idle + wave animation logic |
| `src/components/AvatarScene.tsx` | Create | R3F Canvas + lighting + Suspense + useInView |
| `src/components/AboutSection.tsx` | Modify | dynamic import AvatarScene, swap placeholder div |

---

### Task 1: Create RPM Avatar (manual step — user does this)

**Files:** None — setup step only

- [ ] **Step 1: Create avatar at Ready Player Me**

  Go to `https://readyplayer.me/hub` and sign in or create an account. Use the avatar creator to build a chibi-style avatar that resembles you. Use a selfie or manually customize hair, skin, face, outfit.

  When finished, your avatar will have a URL like:
  `https://readyplayer.me/avatar/{YOUR_AVATAR_ID}`

- [ ] **Step 2: Get the GLB URL**

  Your avatar's GLB download URL follows this pattern:
  ```
  https://models.readyplayer.me/{YOUR_AVATAR_ID}.glb?quality=medium&textureSizeLimit=512
  ```

  The `quality=medium` and `textureSizeLimit=512` params reduce file size for faster load. Test the URL by pasting it in a browser — it should download a `.glb` file.

- [ ] **Step 3: Note your avatar ID**

  Keep the full GLB URL handy — you will paste it into `src/lib/avatar.ts` in Task 2.

---

### Task 2: Create `src/lib/avatar.ts`

**Files:**
- Create: `src/lib/avatar.ts`

- [ ] **Step 1: Create the constants file**

  Create `src/lib/avatar.ts` with your RPM GLB URL:

  ```ts
  export const AVATAR_URL =
    'https://models.readyplayer.me/YOUR_AVATAR_ID.glb?quality=medium&textureSizeLimit=512'
  ```

  Replace `YOUR_AVATAR_ID` with the actual ID from Task 1.

- [ ] **Step 2: Type-check**

  ```bash
  rtk tsc
  ```

  Expected: no new errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/avatar.ts
  git commit -m "feat: add RPM avatar URL constant"
  ```

---

### Task 3: Create `src/components/AvatarModel.tsx`

**Files:**
- Create: `src/components/AvatarModel.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  'use client'

  import { useEffect, useRef } from 'react'
  import { useFrame } from '@react-three/fiber'
  import { useGLTF } from '@react-three/drei'
  import * as THREE from 'three'
  import { AVATAR_URL } from '@/lib/avatar'

  interface AvatarModelProps {
    inView: boolean
    reducedMotion: boolean
  }

  export function AvatarModel({ inView, reducedMotion }: AvatarModelProps) {
    const { scene } = useGLTF(AVATAR_URL)
    const groupRef = useRef<THREE.Group>(null)
    const rightArmRef = useRef<THREE.Object3D | null>(null)
    const rightForeArmRef = useRef<THREE.Object3D | null>(null)
    const wavingRef = useRef(false)
    const wavedRef = useRef(false)
    const waveStartRef = useRef(0)

    useEffect(() => {
      // RPM avatars use Mixamo rig bone names
      rightArmRef.current = scene.getObjectByName('RightArm') ?? null
      rightForeArmRef.current = scene.getObjectByName('RightForeArm') ?? null
      // Ensure shadow casting
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true
        }
      })
    }, [scene])

    useEffect(() => {
      if (inView && !wavedRef.current && !reducedMotion) {
        wavedRef.current = true
        wavingRef.current = true
        setTimeout(() => { wavingRef.current = false }, 2500)
      }
    }, [inView, reducedMotion])

    useFrame(({ clock }) => {
      if (reducedMotion) return
      const t = clock.elapsedTime

      // Idle: subtle whole-body sway + float
      if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.04
        groupRef.current.position.y = -0.85 + Math.sin(t * 0.8) * 0.015
      }

      // Wave: right arm oscillation
      if (wavingRef.current) {
        const elapsed = t - waveStartRef.current
        if (elapsed === 0) waveStartRef.current = t
        const arm = rightArmRef.current
        const foreArm = rightForeArmRef.current
        if (arm) {
          // Raise arm and oscillate
          arm.rotation.z = -(Math.PI / 3) + Math.sin(t * 4) * 0.25
          arm.rotation.x = -0.3
        }
        if (foreArm) {
          foreArm.rotation.z = Math.sin(t * 4 + 0.5) * 0.15
        }
      } else {
        // Return to rest
        const arm = rightArmRef.current
        const foreArm = rightForeArmRef.current
        if (arm) {
          arm.rotation.z = THREE.MathUtils.lerp(arm.rotation.z, 0, 0.05)
          arm.rotation.x = THREE.MathUtils.lerp(arm.rotation.x, 0, 0.05)
        }
        if (foreArm) {
          foreArm.rotation.z = THREE.MathUtils.lerp(foreArm.rotation.z, 0, 0.05)
        }
      }
    })

    return (
      <group ref={groupRef} position={[0, -0.85, 0]}>
        <primitive object={scene} />
      </group>
    )
  }

  useGLTF.preload(AVATAR_URL)
  ```

- [ ] **Step 2: Type-check**

  ```bash
  rtk tsc
  ```

  Expected: no errors in `AvatarModel.tsx`.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/AvatarModel.tsx
  git commit -m "feat: add AvatarModel with idle sway and wave bone animation"
  ```

---

### Task 4: Create `src/components/AvatarScene.tsx`

**Files:**
- Create: `src/components/AvatarScene.tsx`

- [ ] **Step 1: Create the component**

  ```tsx
  'use client'

  import { Suspense, useRef } from 'react'
  import { Canvas } from '@react-three/fiber'
  import { useInView, useReducedMotion } from 'framer-motion'
  import { AvatarModel } from '@/components/AvatarModel'

  export function AvatarScene() {
    const containerRef = useRef<HTMLDivElement>(null)
    const inView = useInView(containerRef, { once: true, amount: 0.5 })
    const reducedMotion = useReducedMotion() ?? false

    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} aria-hidden="true">
        <Canvas
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 2.5], fov: 35 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[-2, 3, 2]} intensity={1.2} />
          <Suspense fallback={null}>
            <AvatarModel inView={!!inView} reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>
      </div>
    )
  }
  ```

- [ ] **Step 2: Type-check**

  ```bash
  rtk tsc
  ```

  Expected: no errors in `AvatarScene.tsx`.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/AvatarScene.tsx
  git commit -m "feat: add AvatarScene with R3F Canvas and transparent background"
  ```

---

### Task 5: Update `src/components/AboutSection.tsx`

**Files:**
- Modify: `src/components/AboutSection.tsx`

- [ ] **Step 1: Add dynamic import**

  At the top of `src/components/AboutSection.tsx`, add after the existing imports:

  ```tsx
  import dynamic from 'next/dynamic'

  const AvatarScene = dynamic(
    () => import('@/components/AvatarScene').then((m) => m.AvatarScene),
    { ssr: false }
  )
  ```

- [ ] **Step 2: Replace the placeholder div**

  Find the `motion.div` that contains the SVG placeholder (lines 40–53):

  ```tsx
  <motion.div
    className="order-1 md:order-2 aspect-square w-full max-w-[400px] mx-auto glass rounded-2xl flex items-center justify-center"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={imageVariants}
    transition={{ type: 'spring', duration: shouldReduce ? 0 : 0.6, bounce: 0, delay: shouldReduce ? 0 : 0.1 }}
  >
    {/* Static illustration placeholder for v1 */}
    <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent" />
    <svg className="w-1/2 h-1/2 text-accent/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
    </svg>
  </motion.div>
  ```

  Replace with:

  ```tsx
  <motion.div
    className="order-1 md:order-2 aspect-square w-full max-w-[400px] mx-auto glass rounded-2xl overflow-hidden"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={imageVariants}
    transition={{ type: 'spring', duration: shouldReduce ? 0 : 0.6, bounce: 0, delay: shouldReduce ? 0 : 0.1 }}
  >
    <AvatarScene />
  </motion.div>
  ```

  Note: removed `flex items-center justify-center` (not needed), added `overflow-hidden` (clips canvas edges cleanly).

- [ ] **Step 3: Type-check**

  ```bash
  rtk tsc
  ```

  Expected: no errors.

- [ ] **Step 4: Visual verification**

  Start dev server and navigate to the About section:

  ```bash
  npm run dev
  ```

  Open `http://localhost:3000` (or the locale-prefixed URL). Scroll to the About section. Verify:

  - Glass card renders with avatar visible inside
  - Idle sway plays (subtle Y-rotation + float)
  - Wave triggers once when section first scrolls into view
  - Avatar disappears after ~2.5s back to idle
  - No layout shift on load (glass card holds its size while avatar loads)
  - No SSR errors in terminal

- [ ] **Step 5: Verify reduced-motion**

  In DevTools → Rendering → check "Emulate CSS media feature prefers-reduced-motion: reduce". Reload. Verify avatar renders statically (no sway, no wave). Uncheck to restore.

- [ ] **Step 6: Tweak camera/position if needed**

  If the avatar is framed poorly (cut off at top, too much empty space), adjust these values in `AvatarModel.tsx`:
  - `position={[0, -0.85, 0]}` on the group — increase magnitude to shift avatar down
  - `camera={{ position: [0, 0, 2.5], fov: 35 }}` in `AvatarScene.tsx` — increase Z for wider view, decrease fov for tighter crop

- [ ] **Step 7: Commit**

  ```bash
  git add src/components/AboutSection.tsx
  git commit -m "feat: replace about section placeholder with 3D RPM avatar"
  ```
