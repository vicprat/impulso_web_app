import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/sitemap.xml` : 'https://impulsogaleria.com/sitemap.xml',
  }
} 