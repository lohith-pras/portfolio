import createNextIntlPlugin from 'next-intl/plugin'
import createMDX from '@next/mdx'
import rehypePrettyCode from 'rehype-pretty-code'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  theme: 'vesper',
  keepBackground: true,
  onVisitLine(node) {
    // Prevent collapsed empty lines from becoming invisible
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }]
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className = node.properties.className ?? []
    node.properties.className.push('line--highlighted')
  },
  onVisitHighlightedChars(node) {
    node.properties.className = ['word--highlighted']
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  },
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
