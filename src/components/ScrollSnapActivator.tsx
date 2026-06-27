'use client'

import { useEffect } from 'react'

export function ScrollSnapActivator() {
  useEffect(() => {
    const html = document.documentElement
    html.classList.add('has-scroll-snap')
    return () => {
      html.classList.remove('has-scroll-snap')
    }
  }, [])

  return null
}
