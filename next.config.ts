import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compiler: {
    reactRemoveProperties: {
      properties: ['^data-test'],
    },
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  async headers() {
    return [
      {
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
        source: '/(.*)',
      },
      {
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
        source: '/images/(.*)',
      },
      {
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
        source: '/assets/(.*)',
      },
      {
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
        source: '/(.*)',
      },
    ]
  },

  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
    formats: ['image/avif', 'image/webp'],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        hostname: '**.supabase.co',
        pathname: '/storage/**',
        protocol: 'https',
      },
    ],

    unoptimized: true,
  },

  serverExternalPackages: ['sharp'],

  turbopack: {
    resolveAlias: {
      '@': './src',
      '@/components': './src/components',
      '@/hooks': './src/hooks',
      '@/lib': './src/lib',
    },
    rules: {
      '*.svg': {
        as: '*.js',
        loaders: ['@svgr/webpack'],
      },
    },
  },
}

export default nextConfig
