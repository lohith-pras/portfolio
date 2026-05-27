'use client'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { motion } from 'framer-motion'

const NAV_LINKS = [
  { href: '/#about', labelKey: 'about', activePath: null },
  { href: '/#work', labelKey: 'work', activePath: null },
  { href: '/life', labelKey: 'life', activePath: '/life' },
  { href: '/#contact', labelKey: 'contact', activePath: null },
] as const

export function NavbarDesktop() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-5xl h-14 hidden md:flex items-center justify-between px-8 z-50 glass-bar rounded-2xl">
      <Link href="/" className="font-display font-bold text-foreground hover:text-accent transition-colors">
        L.T. Prasanna
      </Link>
      <div className="flex items-center gap-8 font-mono text-sm">
        {NAV_LINKS.map((item) => {
          const isActive = item.activePath !== null && pathname === item.activePath
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative pb-1 text-foreground/80 hover:text-accent transition-colors"
            >
              {t(item.labelKey)}
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
                />
              )}
            </Link>
          )
        })}
        <a href="/Lohith_Prasanna_Resume.pdf" download className="text-foreground/80 hover:text-accent transition-colors">{t('resume')}</a>
        <div className="w-px h-4 bg-white/20 mx-2" />
        <Link href={pathname} locale="en" className="text-foreground/80 hover:text-accent transition-colors">EN</Link>
        <span className="text-white/20">/</span>
        <Link href={pathname} locale="de" className="text-foreground/80 hover:text-accent transition-colors">DE</Link>
      </div>
    </nav>
  )
}
