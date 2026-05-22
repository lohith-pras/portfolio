import createNextIntlPlugin from 'next-intl/plugin'

import createMDX from '@next/mdx'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    }
    return config
  },
}

// Merge MDX config with Next.js config
export default withNextIntl(withMDX(nextConfig))
