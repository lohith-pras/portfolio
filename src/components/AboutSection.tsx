import { useTranslations } from 'next-intl'

export function AboutSection() {
  const t = useTranslations('about')

  return (
    <section id="about" className="min-h-[100svh] w-full flex items-center pt-24 md:pt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6 md:px-16 max-w-7xl mx-auto w-full">
        <div className="order-2 md:order-1 flex flex-col justify-center gap-6">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-display font-bold text-accent leading-tight">
            {t('descriptor')}
          </h2>
          <div className="font-body text-foreground/80 leading-relaxed text-lg space-y-4">
            <p>{t('bio_1')}</p>
            <p>{t('bio_2')}</p>
            <p>{t('bio_3')}</p>
          </div>
        </div>
        <div className="order-1 md:order-2 aspect-square w-full max-w-[400px] mx-auto bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
          {/* Static illustration placeholder for v1 */}
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent" />
          <svg className="w-1/2 h-1/2 text-accent/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        </div>
      </div>
    </section>
  )
}
