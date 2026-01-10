/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  output: "export",
  distDir: 'build',
  experimental: {
    esmExternals: true,
    appDir: true
  },
  images: { unoptimized: true },
  optimizeFonts: true,
  // Add empty turbopack config to silence the warning
  // We'll use webpack explicitly via --webpack flag in dev script
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }
    config.externals.push('pino-pretty', 'encoding')
    return config
  }
}

module.exports = nextConfig
