import { useEffect, useRef, useState } from 'react'

export type ChibiPose = 'idle' | 'wave' | 'point' | 'celebrate'

interface ChibiAnimationState {
  pose: ChibiPose
  onPointerEnter: () => void
  onPointerLeave: () => void
}

const PRIORITY: Record<ChibiPose, number> = {
  idle: 0,
  wave: 1,
  point: 2,
  celebrate: 3,
}

export function useChibiAnimation(sectionId: string): ChibiAnimationState {
  const [pose, setPose] = useState<ChibiPose>('idle')
  const poseRef = useRef<ChibiPose>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setPoseTracked = (next: ChibiPose) => {
    poseRef.current = next
    setPose(next)
  }

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    setPoseTracked('wave')
    timerRef.current = setTimeout(() => {
      setPoseTracked('idle')
      timerRef.current = null
    }, 2000)

    const el = document.querySelector(sectionId)
    let observer: IntersectionObserver | null = null

    if (el) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            clearTimer()
            setPoseTracked('celebrate')
            timerRef.current = setTimeout(() => {
              setPoseTracked('idle')
              timerRef.current = null
            }, 1500)
            observer?.disconnect()
          }
        },
        { threshold: 0.3 }
      )
      observer.observe(el)
    }

    return () => {
      clearTimer()
      observer?.disconnect()
    }
  }, [sectionId])

  const onPointerEnter = () => {
    if (PRIORITY[poseRef.current] < PRIORITY['point']) {
      setPoseTracked('wave')
    }
  }

  const onPointerLeave = () => {
    if (poseRef.current === 'wave') {
      setPoseTracked('idle')
    }
  }

  return { pose, onPointerEnter, onPointerLeave }
}
