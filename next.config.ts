import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nueoothgsydbdrseinyu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Raise the body size limit for API routes — required for iPhone video uploads.
  // Vercel's default is 4.5MB. iPhone videos are 15–100MB+.
  // This applies globally; the upload route enforces its own per-file limit.
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
}

export default nextConfig
