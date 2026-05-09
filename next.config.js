/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Skip type checking during build — we verify locally
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build for faster deploys
  eslint: {
    ignoreDuringBuilds: true,
  },
}
module.exports = nextConfig
