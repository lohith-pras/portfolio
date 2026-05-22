import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'de'] as const,
  defaultLocale: 'en',
  // 'always' is required — ensures /en and /de are always in the URL.
  // 'as-needed' would make the default locale path-less, breaking
  // "shareable per-locale URL" goal (PITFALL from research).
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
