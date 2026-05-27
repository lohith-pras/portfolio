'use client'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { User, Briefcase, Heart, Mail, FileText } from 'lucide-react'

export function NavbarMobile() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md h-14 flex md:hidden items-center justify-around px-6 z-50 glass-pill rounded-full">
      <Link href="/#about" className="flex flex-col items-center gap-1 text-foreground/60 hover:text-accent transition-colors" aria-label={t('about')}>
        <User size={18} />
      </Link>
      <Link href="/#work" className="flex flex-col items-center gap-1 text-foreground/60 hover:text-accent transition-colors" aria-label={t('work')}>
        <Briefcase size={18} />
      </Link>
      <Link href="/life" className="flex flex-col items-center gap-1 text-foreground/60 hover:text-accent transition-colors" aria-label={t('life')}>
        <Heart size={18} />
      </Link>
      <Link href="/#contact" className="flex flex-col items-center gap-1 text-foreground/60 hover:text-accent transition-colors" aria-label={t('contact')}>
        <Mail size={18} />
      </Link>
      <a href="/Lohith_Prasanna_Resume.pdf" download className="flex flex-col items-center gap-1 text-foreground/60 hover:text-accent transition-colors" aria-label={t('resume')}>
        <FileText size={18} />
      </a>
      <div className="w-px h-6 bg-white/20 mx-1" />
      <div className="flex items-center gap-2 text-xs font-mono">
        <Link href={pathname} locale="en" className="text-foreground/80 hover:text-accent transition-colors">EN</Link>
        <span className="text-white/20">/</span>
        <Link href={pathname} locale="de" className="text-foreground/80 hover:text-accent transition-colors">DE</Link>
      </div>
    </nav>
  )
}
