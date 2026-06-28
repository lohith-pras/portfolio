'use client'

import { useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, Link, useRouter } from '@/i18n/navigation'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

export function Navbar() {
  const pathname = usePathname()
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('nav')
  const navRef = useRef<HTMLElement>(null)

  const isHome = pathname === '/'
  const isLife = pathname === '/life'

  useGSAP(() => {
    const el = navRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.15 }
    )
  }, [])

  const toggleLocale = () => {
    const next = locale === 'en' ? 'de' : 'en'
    router.replace(pathname, { locale: next })
  }

  return (
    <nav
      ref={navRef}
      style={{ opacity: 0 }}
      className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-auto"
    >
      <div className="bg-paper border border-beige/50 rounded-full px-6 py-3 flex items-center gap-12 shadow-2xl">
        {/* Left: LTP Monogram */}
        <div className="flex items-center">
          <Link
            href="/"
            locale={locale}
            className="font-mono text-sm text-ink tracking-tighter font-bold hover:text-accent transition-colors duration-300"
            aria-label="Home"
          >
            LTP
          </Link>
        </div>

        {/* Center: Main Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            locale={locale}
            className={`relative font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
              isHome
                ? 'text-ink active-dot font-bold'
                : 'text-ink-2 hover:text-accent'
            }`}
          >
            {t('work')}
          </Link>
          <Link
            href="/life"
            locale={locale}
            className={`relative font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
              isLife
                ? 'text-ink active-dot font-bold'
                : 'text-ink-2 hover:text-accent'
            }`}
          >
            {t('life')}
          </Link>
        </div>

        {/* Right: Language Toggle */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleLocale}
            className="font-mono text-xs font-bold text-accent hover:opacity-80 transition-opacity duration-300 uppercase focus-visible:outline-none"
            aria-label={`Switch language to ${locale === 'en' ? 'German' : 'English'}`}
          >
            {locale}
          </button>
        </div>
      </div>
    </nav>
  )
}
