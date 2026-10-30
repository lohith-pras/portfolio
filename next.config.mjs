import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // /life folded into the home page; keep old links working.
  async redirects() {
    return [{ source: '/:locale(en|de)/life', destination: '/:locale#life', permanent: true }]
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    }
    return config
  },
}

export default withNextIntl(nextConfig)
