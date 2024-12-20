/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }
    config.externals.push('pino-pretty', 'encoding')
    return config
  }
}

module.exports = nextConfig
