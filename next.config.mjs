/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site used to live at /en and /de; keep old links working.
  async redirects() {
    return [
      { source: '/:locale(en|de)', destination: '/', permanent: true },
      { source: '/:locale(en|de)/:path*', destination: '/', permanent: true },
    ]
  },
}

export default nextConfig
