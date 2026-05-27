import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Suspense } from 'react'
import { type Locale } from '@/i18n/routing'
import { PhaseTimeline } from '@/components/PhaseTimeline'

const SLUG_TO_KEY: Record<string, 'mimo' | 'vlc' | 'iot'> = {
  'mimo-ai-channel-quality-tool': 'mimo',
  'vlc-v2v-communication': 'vlc',
  'iot-security-project': 'iot',
}

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = ['mimo-ai-channel-quality-tool', 'vlc-v2v-communication', 'iot-security-project']
  const locales = ['en', 'de']
  
  const params: { locale: string; slug: string }[] = []
  
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, slug })
    }
  }
  
  return params
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale as Locale)

  const tp = await getTranslations({ locale, namespace: 'projects' })
  const projectKey = SLUG_TO_KEY[slug]
  const phasesCompleted = projectKey ? Number(tp(`${projectKey}.phasesCompleted`)) : 0
  const totalPhases = projectKey ? Number(tp(`${projectKey}.totalPhases`)) : 0

  // Dynamically import the MDX content based on slug and locale
  let Content
  try {
    Content = (await import(`@/content/projects/${locale}/${slug}.mdx`)).default
  } catch {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-32 px-6 md:px-16 overflow-hidden selection:bg-accent/30">
      <div className="max-w-4xl mx-auto mb-12">
        <Link 
          href="/#work" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Work
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto flex gap-12">
        <aside className="hidden md:block w-32 shrink-0">
          <PhaseTimeline phasesCompleted={phasesCompleted} totalPhases={totalPhases} />
        </aside>
        
        <article className="flex-1 prose prose-invert max-w-none">
          <Suspense fallback={<div className="animate-pulse h-32 bg-white/5 rounded-lg" />}>
            <Content />
          </Suspense>
        </article>
      </div>
    </main>
  )
}
