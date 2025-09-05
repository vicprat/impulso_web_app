import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Compresión y optimización
  compress: true,

  // Optimizaciones de rendimiento
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },

  // Headers de caché
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
    ]
  },

  // Optimización de imágenes
  images: {
    // Optimización de calidad y tamaños
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    formats: ['image/webp', 'image/avif'],

    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      {
        hostname: 'cdn.shopify.com',
        protocol: 'https',
      },
      {
        hostname: 'impulsogaleria.com',
        protocol: 'https',
      },
      {
        hostname: 'via.placeholder.com',
        protocol: 'https',
      },
      {
        hostname: 'xhsidbbijujrdjjymhbs.supabase.co',
        protocol: 'https',
      },
      {
        hostname: 'i.ytimg.com',
        protocol: 'https',
      },
    ],
  },
}

export default nextConfig
