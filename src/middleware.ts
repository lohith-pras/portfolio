import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except assets, API, and internal Next.js/Vercel paths
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
