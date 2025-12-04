/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  // Skip build-time database connection validation
  // This prevents build failures when DATABASE_URL is not available
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Webpack configuration for build optimization
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Prisma for server-side builds to avoid bundling issues
      config.externals = config.externals || [];
      config.externals.push('@prisma/client', 'prisma');
    }
    // Ignore Prisma client initialization errors during build
    config.resolve = config.resolve || {};
    config.resolve.fallback = config.resolve.fallback || {};
    config.resolve.fallback.fs = false;
    config.resolve.fallback.net = false;
    config.resolve.fallback.tls = false;
    return config;
  },
  // Skip static page generation for dynamic API routes
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Skip API routes during static generation
  staticPageGenerationTimeout: 120,
  // Don't fail build on runtime errors during page data collection
  productionBrowserSourceMaps: false,
}
module.exports = nextConfig
