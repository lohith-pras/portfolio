import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // MDX will be added in Phase 5 via withMDX wrapping withNextIntl
}

export default withNextIntl(nextConfig)
