import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { type Locale } from '@/i18n/routing'
import { PhaseTimeline } from '@/components/PhaseTimeline'
import { ModalClient } from '@/components/ModalClient'

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

export default async function ModalProjectPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale as Locale)

  let Content
  try {
    Content = (await import(`@/content/projects/${locale}/${slug}.mdx`)).default
  } catch {
    notFound()
  }

  return (
    <ModalClient slug={slug}>
      <div className="min-h-full p-8 md:p-16">
        <div className="max-w-4xl mx-auto flex gap-12">
          <aside className="hidden md:block w-32 shrink-0">
            <PhaseTimeline />
          </aside>
          
          <article className="flex-1 prose prose-invert max-w-none">
            <Content />
          </article>
        </div>
      </div>
    </ModalClient>
  )
}
