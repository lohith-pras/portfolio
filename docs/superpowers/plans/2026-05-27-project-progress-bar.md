# Project Progress Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an animated framer-motion progress bar showing phase completion (phasesCompleted / totalPhases) to project cards in the work section and the project detail sidebar.

**Architecture:** Phase completion data lives in translation files (en.json, de.json). A new `ProjectProgressBar` client component animates width with framer-motion on mount. It renders in two places: inside `ProjectCard` (replacing the status dot) and above the existing GSAP timeline in `PhaseTimeline`.

**Tech Stack:** Next.js 15 App Router, framer-motion 12, next-intl 4, TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `messages/en.json` | Modify | Add `phasesCompleted`, `totalPhases` per project |
| `messages/de.json` | Modify | Same (phase counts are locale-independent) |
| `src/components/ProjectProgressBar.tsx` | Create | Animated progress bar component |
| `src/components/ProjectCard.tsx` | Modify | Accept + render progress bar, remove status dot |
| `src/components/WorkSection.tsx` | Modify | Read new translation keys, pass to ProjectCard |
| `src/components/PhaseTimeline.tsx` | Modify | Accept phase props, render bar above timeline |
| `src/app/[locale]/projects/[slug]/page.tsx` | Modify | Read phase data from translations, pass to PhaseTimeline |

---

### Task 1: Add phase data to translations

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/de.json`

- [ ] **Step 1: Update `messages/en.json`**

Add `phasesCompleted` and `totalPhases` to each project entry under `"projects"`. The file currently has `name`, `problem`, `status` per project. Add after `status`:

```json
"projects": {
  "mimo": {
    "name": "MIMO AI Channel Quality Tool",
    "problem": "Neural-network-driven channel estimation for massive MIMO systems",
    "status": "Active",
    "phasesCompleted": "1",
    "totalPhases": "3"
  },
  "vlc": {
    "name": "VLC-based V2V Communication Prototype",
    "problem": "Visible-light communication link for low-latency vehicle-to-vehicle data",
    "status": "Complete",
    "phasesCompleted": "3",
    "totalPhases": "3"
  },
  "iot": {
    "name": "IoT Security Project",
    "problem": "Lightweight security framework for resource-constrained IoT devices",
    "status": "Complete",
    "phasesCompleted": "3",
    "totalPhases": "3"
  }
}
```

Note: next-intl translation values must be strings. We parse them to numbers in the component.

- [ ] **Step 2: Update `messages/de.json`**

Same additions to the German file (phase counts are locale-independent):

```json
"projects": {
  "mimo": {
    "name": "MIMO AI Channel Quality Tool",
    "problem": "Kanalschätzung durch neuronale Netze für massive MIMO-Systeme",
    "status": "Aktiv",
    "phasesCompleted": "1",
    "totalPhases": "3"
  },
  "vlc": {
    "name": "VLC-based V2V Communication Prototype",
    "problem": "VLC-Verbindung für fahrzeugübergreifende Daten mit geringer Latenz",
    "status": "Abgeschlossen",
    "phasesCompleted": "3",
    "totalPhases": "3"
  },
  "iot": {
    "name": "IoT Security Project",
    "problem": "Leichtgewichtiges Sicherheits-Framework für ressourcenbeschränkte IoT-Geräte",
    "status": "Abgeschlossen",
    "phasesCompleted": "3",
    "totalPhases": "3"
  }
}
```

- [ ] **Step 3: Verify TypeScript still passes**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && npx tsc --noEmit
```

Expected: no errors (translation files are JSON, not typed here).

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/de.json
git commit -m "feat: add phasesCompleted and totalPhases to project translations"
```

---

### Task 2: Create `ProjectProgressBar` component

**Files:**
- Create: `src/components/ProjectProgressBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface ProjectProgressBarProps {
  phasesCompleted: number
  totalPhases: number
}

export function ProjectProgressBar({ phasesCompleted, totalPhases }: ProjectProgressBarProps) {
  const shouldReduceMotion = useReducedMotion()
  const percentage = (phasesCompleted / totalPhases) * 100

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="font-mono text-xs text-white/50 uppercase tracking-widest">
        {phasesCompleted} / {totalPhases} Phases
      </span>
      <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: '#FF1E00' }}
          initial={{ width: shouldReduceMotion ? `${percentage}%` : '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }
          }
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectProgressBar.tsx
git commit -m "feat: add ProjectProgressBar component with framer-motion animation"
```

---

### Task 3: Update `ProjectCard` to render progress bar

**Files:**
- Modify: `src/components/ProjectCard.tsx`

Current `ProjectCard` has props: `id`, `name`, `problem`, `status`, `href`. The footer renders a status dot + status text. Replace the dot with `ProjectProgressBar`.

- [ ] **Step 1: Update `ProjectCard.tsx`**

Replace the entire file content with:

```tsx
'use client'

import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { ProjectProgressBar } from './ProjectProgressBar'

interface ProjectCardProps {
  id: string
  name: string
  problem: string
  status: string
  href: string
  phasesCompleted: number
  totalPhases: number
}

export function ProjectCard({ id, name, problem, status, href, phasesCompleted, totalPhases }: ProjectCardProps) {
  return (
    <motion.article
      className="project-card flex flex-col gap-4 pb-6 border-b border-white/20 hover:border-white/60 transition-colors group"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
    >
      <Link href={href} className="flex flex-col gap-4 cursor-pointer focus:outline-none">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-[clamp(1.5rem,3vw,2.5rem)] text-foreground group-hover:text-accent transition-colors leading-tight">
              {name}
            </h3>
          </div>
          <p className="font-body font-light text-white/70 text-[clamp(1rem,1.8vw,1.2rem)] leading-relaxed line-clamp-2">
            {problem}
          </p>
        </header>

        <footer className="flex flex-col gap-3 mt-2">
          <ProjectProgressBar phasesCompleted={phasesCompleted} totalPhases={totalPhases} />
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-foreground/80 uppercase tracking-wider">
              {status}
            </span>
            <div className="font-mono text-xs text-foreground/50 uppercase tracking-widest border border-white/10 px-2 py-1 rounded-sm">
              {id}
            </div>
          </div>
        </footer>
      </Link>
    </motion.article>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && npx tsc --noEmit
```

Expected: TypeScript error on `WorkSection.tsx` because it doesn't pass the new props yet — that's fine, fix in Task 4.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectCard.tsx
git commit -m "feat: add progress bar to ProjectCard, remove status dot"
```

---

### Task 4: Update `WorkSection` to pass phase props

**Files:**
- Modify: `src/components/WorkSection.tsx`

`WorkSection` uses `useTranslations('projects')` already. Add reads for `phasesCompleted` and `totalPhases` per project, then pass to `ProjectCard`.

- [ ] **Step 1: Update `WorkSection.tsx`**

Replace the entire file content with:

```tsx
'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { WaveformDivider } from './WaveformDivider'
import { ProjectCard } from './ProjectCard'

export function WorkSection() {
  const t = useTranslations('work')
  const tp = useTranslations('projects')
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      gsap.set('.project-card', { opacity: 1, y: 0 })
      return
    }

    gsap.from('.project-card', {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#work-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })
  }, { scope: containerRef })

  return (
    <section id="work" ref={containerRef} className="w-full flex flex-col pt-12 pb-32">
      <WaveformDivider />

      <div className="px-6 md:px-16 max-w-7xl mx-auto w-full mt-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-16">
          {t('heading')}
        </h2>

        <div id="work-grid" className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          <ProjectCard
            id="PROJ-01"
            name={tp('mimo.name')}
            problem={tp('mimo.problem')}
            status={tp('mimo.status')}
            href="/projects/mimo-ai-channel-quality-tool"
            phasesCompleted={Number(tp('mimo.phasesCompleted'))}
            totalPhases={Number(tp('mimo.totalPhases'))}
          />

          <ProjectCard
            id="PROJ-02"
            name={tp('vlc.name')}
            problem={tp('vlc.problem')}
            status={tp('vlc.status')}
            href="/projects/vlc-v2v-communication"
            phasesCompleted={Number(tp('vlc.phasesCompleted'))}
            totalPhases={Number(tp('vlc.totalPhases'))}
          />

          <ProjectCard
            id="PROJ-03"
            name={tp('iot.name')}
            problem={tp('iot.problem')}
            status={tp('iot.status')}
            href="/projects/iot-security-project"
            phasesCompleted={Number(tp('iot.phasesCompleted'))}
            totalPhases={Number(tp('iot.totalPhases'))}
          />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/WorkSection.tsx
git commit -m "feat: pass phase completion data from translations to ProjectCard"
```

---

### Task 5: Update `PhaseTimeline` to show progress bar above GSAP timeline

**Files:**
- Modify: `src/components/PhaseTimeline.tsx`

Add `phasesCompleted` and `totalPhases` props. Render `ProjectProgressBar` above the existing GSAP SVG line + nodes. Keep all existing animation logic intact.

- [ ] **Step 1: Update `PhaseTimeline.tsx`**

Replace the entire file content with:

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { ProjectProgressBar } from './ProjectProgressBar'

interface PhaseTimelineProps {
  phasesCompleted: number
  totalPhases: number
}

export function PhaseTimeline({ phasesCompleted, totalPhases }: PhaseTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const line = document.getElementById('timeline-line')
    const nodes = gsap.utils.toArray('.timeline-node') as HTMLElement[]

    if (!line) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      gsap.set(line, { drawSVG: '0% 100%' })
      gsap.set(nodes, { scale: 1 })
      return
    }

    gsap.set(line, { drawSVG: '0% 0%' })
    gsap.set(nodes, { scale: 0 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 50%',
        end: 'bottom 50%',
        scrub: 1,
      }
    })

    tl.to(line, { drawSVG: '0% 100%', ease: 'none' }, 0)

    nodes.forEach((node, i) => {
      tl.to(node, { scale: 1, ease: 'back.out(2)', duration: 0.1 }, (i + 1) * (1 / (nodes.length + 1)))
    })

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative h-full min-h-[500px] flex flex-col items-center py-8 gap-6">
      <div className="w-full px-2">
        <ProjectProgressBar phasesCompleted={phasesCompleted} totalPhases={totalPhases} />
      </div>

      <div className="relative flex-1 w-full flex flex-col items-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <line
            id="timeline-line"
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="#FF1E00"
            strokeWidth="2"
          />
        </svg>

        {/* Node 1 */}
        <div className="timeline-node w-4 h-4 bg-background border-2 border-accent rounded-full absolute top-[20%] left-1/2 -translate-x-1/2" />
        {/* Node 2 */}
        <div className="timeline-node w-4 h-4 bg-background border-2 border-accent rounded-full absolute top-[50%] left-1/2 -translate-x-1/2" />
        {/* Node 3 */}
        <div className="timeline-node w-4 h-4 bg-background border-2 border-accent rounded-full absolute top-[80%] left-1/2 -translate-x-1/2" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && npx tsc --noEmit
```

Expected: TypeScript error on `[slug]/page.tsx` — it calls `<PhaseTimeline />` without the new required props. Fix in Task 6.

- [ ] **Step 3: Commit**

```bash
git add src/components/PhaseTimeline.tsx
git commit -m "feat: add ProjectProgressBar to PhaseTimeline sidebar"
```

---

### Task 6: Update project detail page to pass phase data to `PhaseTimeline`

**Files:**
- Modify: `src/app/[locale]/projects/[slug]/page.tsx`

The page is a Next.js server component. Use `getTranslations` (server-side next-intl API) to read `phasesCompleted` and `totalPhases` for the current project. Map `slug` → project key to look up the correct translation entry.

- [ ] **Step 1: Update `[slug]/page.tsx`**

Replace the entire file content with:

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Suspense } from 'react'
import { type Locale } from '@/i18n/routing'
import { PhaseTimeline } from '@/components/PhaseTimeline'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

const slugToProjectKey: Record<string, string> = {
  'mimo-ai-channel-quality-tool': 'mimo',
  'vlc-v2v-communication': 'vlc',
  'iot-security-project': 'iot',
}

export async function generateStaticParams() {
  const slugs = ['mimo-ai-channel-quality-tool', 'vlc-v2v-communication', 'iot-security-project']
  const locales = ['en', 'de']

  const params: { locale: string; slug: string }[] = []

  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, slug })
    }
  }

  return params
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale as Locale)

  const projectKey = slugToProjectKey[slug]
  if (!projectKey) notFound()

  const tp = await getTranslations('projects')
  const phasesCompleted = Number(tp(`${projectKey}.phasesCompleted`))
  const totalPhases = Number(tp(`${projectKey}.totalPhases`))

  let Content
  try {
    Content = (await import(`@/content/projects/${locale}/${slug}.mdx`)).default
  } catch {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-32 px-6 md:px-16 overflow-hidden selection:bg-accent/30">
      <div className="max-w-4xl mx-auto mb-12">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Work
        </Link>
      </div>

      <div className="max-w-4xl mx-auto flex gap-12">
        <aside className="hidden md:block w-32 shrink-0">
          <PhaseTimeline phasesCompleted={phasesCompleted} totalPhases={totalPhases} />
        </aside>

        <article className="flex-1 prose prose-invert max-w-none">
          <Suspense fallback={<div className="animate-pulse h-32 bg-white/5 rounded-lg" />}>
            <Content />
          </Suspense>
        </article>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Type-check — expect clean**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Build check**

```bash
cd /Users/lohith/Projects/Personal/portfolio_v2 && rtk next build
```

Expected: build succeeds with no errors. Static pages generated for all slug/locale combinations.

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/projects/\[slug\]/page.tsx
git commit -m "feat: pass phase data from translations to PhaseTimeline on project detail page"
```

---

## Done

All six tasks complete when:
- `npx tsc --noEmit` passes clean
- `next build` succeeds
- Work section cards each show an animated red progress bar with phase label
- Project detail sidebar shows the progress bar above the GSAP scroll timeline
