'use client'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export function NavbarDesktop() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 w-full h-16 hidden md:flex items-center justify-between px-8 md:px-16 z-50 bg-transparent backdrop-blur-sm border-b border-white/5">
      <Link href="/" className="font-display font-bold text-foreground hover:text-accent transition-colors">
        L.T. Prasanna
      </Link>
      <div className="flex items-center gap-8 font-mono text-sm">
        <Link href="/#about" className="text-foreground/80 hover:text-accent transition-colors">{t('about')}</Link>
        <Link href="/#work" className="text-foreground/80 hover:text-accent transition-colors">{t('work')}</Link>
        <Link href="/life" className="text-foreground/80 hover:text-accent transition-colors">{t('life')}</Link>
        <Link href="/#contact" className="text-foreground/80 hover:text-accent transition-colors">{t('contact')}</Link>
        <a href="/Lohith_Prasanna_Resume.pdf" download className="text-foreground/80 hover:text-accent transition-colors">{t('resume')}</a>
        <div className="w-px h-4 bg-white/20 mx-2" />
        <Link href={pathname} locale="en" className="text-foreground/80 hover:text-accent transition-colors">EN</Link>
        <span className="text-white/20">/</span>
        <Link href={pathname} locale="de" className="text-foreground/80 hover:text-accent transition-colors">DE</Link>
      </div>
    </nav>
  )
}
