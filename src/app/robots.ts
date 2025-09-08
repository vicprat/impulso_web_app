import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://impulsogaleria.com'

  return {
    host: baseUrl,
    rules: [
      {
        allow: [
          '/',
          '/artists/',
          '/store/',
          '/blog/',
          '/events/',
          '/news/',
          '/services/',
          '/membership/',
          '/terms/',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
          '/store/cart',
          '/store/search',
          '/store/checkout',
          '/store/orders/',
          '/profile/',
          '/settings/',
        ],
        userAgent: '*',
      },
      {
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
          '/store/cart',
          '/store/search',
          '/store/checkout',
          '/store/orders/',
          '/profile/',
          '/settings/',
        ],
        userAgent: 'Googlebot',
      },
      {
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
          '/store/cart',
          '/store/search',
          '/store/checkout',
          '/store/orders/',
          '/profile/',
          '/settings/',
        ],
        userAgent: '*',
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap-priority.xml`],
  }
}
