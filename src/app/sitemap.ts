import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

const BASE = 'https://lohith-pras.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: `${BASE}/${locale}`,
    changeFrequency: 'monthly' as const,
    priority: 1,
  }))
}
