import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

const BASE = 'https://lohithprasanna.dev'
const PATHS = ['', '/life'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    PATHS.map((path) => ({
      url: `${BASE}/${locale}${path}`,
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.7,
    })),
  )
}
