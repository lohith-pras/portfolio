import { notFound } from 'next/navigation'

// Catch-all for unmatched paths inside a locale, so they render the
// localized, on-brand [locale]/not-found.tsx instead of the bare root 404.
export default function CatchAll() {
  notFound()
}
