'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  // next-intl's usePathname() is locale-less, so derive the active locale from
  // useLocale() — parsing the path always reads 'en' and breaks DE → EN.
  const currentLocale = useLocale()

  const toggleLocale = () => {
    const next = currentLocale === 'en' ? 'de' : 'en'
    router.replace(pathname, { locale: next })
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="font-mono text-[11px] uppercase tracking-widest text-foreground/60 hover:text-accent transition-colors border border-foreground/20 hover:border-accent rounded-full px-3 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label={`Switch language to ${currentLocale === 'en' ? 'German' : 'English'}`}
    >
      {currentLocale === 'en' ? 'EN → DE' : 'DE → EN'}
    </button>
  )
}
