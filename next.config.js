/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Skip build-time database connection validation
  // This prevents build failures when DATABASE_URL is not available
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  // Disable telemetry for faster builds
  telemetry: {
    enabled: false,
  },
}

module.exports = nextConfig
