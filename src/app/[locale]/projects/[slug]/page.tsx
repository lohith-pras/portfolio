import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { type Locale } from '@/i18n/routing'
import { PhaseTimeline } from '@/components/PhaseTimeline'

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

  // Dynamically import the MDX content based on slug and locale
  let Content
  try {
    Content = (await import(`@/content/projects/${locale}/${slug}.mdx`)).default
  } catch (error) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-32 px-6 md:px-16 overflow-hidden selection:bg-accent/30">
      <div className="max-w-4xl mx-auto flex gap-12">
        <aside className="hidden md:block w-32 shrink-0">
          <PhaseTimeline />
        </aside>
        
        <article className="flex-1 prose prose-invert max-w-none">
          <Content />
        </article>
      </div>
    </main>
  )
}
