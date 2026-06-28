'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { getLenis } from '@/lib/lenis'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * IntroLoader — a ~2s brutalist boot sequence over the Hero.
 *
 * A mono counter races 0→100, then two panels split (top up / bottom down) to
 * wipe away and reveal the Hero. Scroll is locked through Lenis while it runs,
 * and an `intro-complete` event is fired so the Hero plays its name mask-reveal
 * in sync (see StaticHero). Runs once per tab session (sessionStorage), so
 * locale switches and PageTransition re-renders don't replay it.
 *
 * Under reduced motion it renders nothing, restores scroll, and fires the event
 * immediately — the Hero reveals statically on its own.
 */
const SESSION_KEY = 'intro-played'

export function IntroLoader() {
  const reduce = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  // Render deterministically (server + first client paint both show the overlay)
  // to avoid a hydration mismatch — the sessionStorage / reduced-motion decision
  // to skip happens in the effect below, which hides it before the timeline runs.
  const [show, setShow] = useState(true)

  const fireComplete = () => {
    sessionStorage.setItem(SESSION_KEY, '1')
    window.dispatchEvent(new Event('intro-complete'))
  }

  useEffect(() => {
    if (!show) return

    // Already played this session, or reduced motion: skip the sequence.
    // (Gate on the sessionStorage flag, which is only set on completion — so
    // StrictMode's mount→unmount→remount re-runs the timeline cleanly instead
    // of short-circuiting and firing intro-complete before the Hero listens.)
    if (sessionStorage.getItem(SESSION_KEY) != null || reduce) {
      getLenis()?.start()
      fireComplete()
      setShow(false)
      return
    }

    // Lock scroll at the top for the duration of the boot sequence. Disable the
    // browser's scroll restoration (a reload would otherwise drop us mid-page),
    // and pin Lenis to 0 too — a bare window.scrollTo loses to Lenis's RAF.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const lenis = getLenis()
    lenis?.scrollTo(0, { immediate: true })
    lenis?.stop()
    // Lenis is disabled on the home route (SmoothScroll), so its stop() is a
    // no-op here — lock native scroll directly so the page can't move behind
    // the overlay during the boot sequence.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const counter = { n: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = prevOverflow
        getLenis()?.start()
        fireComplete()
        setShow(false)
      },
    })

    tl.to(counter, {
      n: 100,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(counter.n)).padStart(3, '0')
      },
    })
      .to(countRef.current, { opacity: 0, duration: 0.25, ease: 'power1.out' }, '+=0.05')
      .to(topRef.current, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '<0.05')
      .to(bottomRef.current, { yPercent: 100, duration: 0.8, ease: 'expo.inOut' }, '<')

    return () => {
      // Always release scroll on teardown — a StrictMode/HMR kill must never
      // strand the page in a scroll-locked state.
      tl.kill()
      document.body.style.overflow = prevOverflow
      getLenis()?.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduce])

  if (!show || reduce) return null

  return (
    <div ref={rootRef} aria-hidden="true" className="fixed inset-0 z-[100]">
      {/* Two panels that split apart to reveal the Hero */}
      <div ref={topRef} className="absolute inset-x-0 top-0 h-1/2 bg-background" />
      <div ref={bottomRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-background" />
      {/* Counter */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          ref={countRef}
          className="font-mono text-beige text-[clamp(3rem,12vw,8rem)] tracking-tight tabular-nums"
        >
          000
        </span>
      </div>
    </div>
  )
}
