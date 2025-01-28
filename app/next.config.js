/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? "/app/" : "",
  basePath: process.env.DEPLOYED_GITHUB_PATH || '',
  output: "export",
  distDir: 'build',
  experimental: {
    esmExternals: true,
    appDir: true
  },
  images: { unoptimized: true },
  optimizeFonts: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }
    config.externals.push('pino-pretty', 'encoding')
    return config
  }
}

module.exports = nextConfig
