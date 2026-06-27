'use client'
import { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, Link } from '@/i18n/navigation'
import { Mail, Heart, Menu, X } from 'lucide-react'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

/**
 * NavbarDesktop — fixed top-right, always visible from the hero.
 *
 * Perf notes (C1):
 * - The expandable menu uses transform: translateX + clip-path instead of
 *   max-width animation (max-width triggers layout; transform is compositor-only).
 * - Glass treatment removed; replaced with dark opaque surface matching the
 *   brutalist page grammar.
 *
 * Visibility note (P1 #5):
 * - Nav is visible from the hero — no ScrollTrigger gate on #about. The fixed
 *   toggle button is always present in the top-right corner.
 */
export function NavbarDesktop() {
  const pathname = usePathname()
  const locale = useLocale()
  const isLife = pathname === '/life'
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Slide the nav in once on mount (fast, no ScrollTrigger dependency)
  useGSAP(() => {
    const el = navRef.current
    if (!el) return
    gsap.fromTo(el, { y: -24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 })
  }, [])

  // Close on Escape or click outside
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open])

  return (
    <nav
      ref={navRef}
      style={{ opacity: 0, visibility: 'hidden' }}
      className="fixed top-4 right-8 h-14 hidden md:flex items-center justify-end gap-2 z-50"
    >
      {/*
        Expandable options — compositor-only clip-path reveal.
        No max-width / padding animation → no layout recalculation.
      */}
      <div
        ref={menuRef}
        className="flex items-center h-12 rounded-full border border-rule bg-paper overflow-hidden transition-[clip-path,opacity] duration-300 ease-out"
        style={{
          clipPath: open ? 'inset(0 0 0 0 round 9999px)' : 'inset(0 0 0 100% round 9999px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          paddingInline: '1.5rem',
          gap: '1.75rem',
          // Width is content-driven; clip-path hides/reveals without layout thrash
          width: 'auto',
          minWidth: '28rem',
        }}
        aria-hidden={!open}
      >
        <Link
          href="/"
          locale={locale}
          className="link-wipe font-display font-bold text-foreground hover:text-accent transition-colors whitespace-nowrap"
          tabIndex={open ? 0 : -1}
        >
          L.T. Prasanna
        </Link>
        <Link
          href="/life"
          locale={locale}
          className={`relative flex items-center gap-2 font-mono text-sm text-foreground/80 hover:text-accent transition-colors pb-1 ${isLife ? '' : 'link-wipe'}`}
          tabIndex={open ? 0 : -1}
        >
          <Heart size={14} />
          Life
          {isLife && (
            <span className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
          )}
        </Link>
        <a
          href="/Lohith_Prasanna_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs uppercase tracking-widest text-foreground/60 hover:text-accent transition-colors border border-foreground/20 hover:border-accent rounded-full px-3 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          tabIndex={open ? 0 : -1}
        >
          CV
        </a>
        <LocaleSwitcher />
        <div className="w-px h-4 bg-rule" />
        <a
          href="mailto:lnlohith3@gmail.com"
          className="text-foreground/60 hover:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Email"
          tabIndex={open ? 0 : -1}
        >
          <Mail size={16} />
        </a>
        <a
          href="https://github.com/lohith-pras"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/60 hover:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="GitHub"
          tabIndex={open ? 0 : -1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/in/loh-pras"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/60 hover:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="LinkedIn"
          tabIndex={open ? 0 : -1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>

      {/* Toggle — always visible, dark opaque brutalist pill */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="grid place-items-center h-12 w-12 shrink-0 rounded-full border border-rule bg-paper text-foreground/80 hover:text-accent hover:border-accent/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
    </nav>
  )
}
