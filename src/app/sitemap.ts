import { getAllPublicRoutes } from '@/config/routes'

import type { MetadataRoute } from 'next'


export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://impulsogaleria.com'
  const publicRoutes = getAllPublicRoutes()
  
  const staticPages = [
    {
      changeFrequency: 'daily' as const,
      lastModified: new Date(),
      priority: 1,
      url: baseUrl,
    },
    {
      changeFrequency: 'weekly' as const,
      lastModified: new Date(),
      priority: 0.8,
      url: `${baseUrl}/artists`,
    },
    {
      changeFrequency: 'daily' as const,
      lastModified: new Date(),
      priority: 0.9,
      url: `${baseUrl}/store`,
    },
    {
      changeFrequency: 'weekly' as const,
      lastModified: new Date(),
      priority: 0.7,
      url: `${baseUrl}/events`,
    },
    {
      changeFrequency: 'monthly' as const,
      lastModified: new Date(),
      priority: 0.5,
      url: `${baseUrl}/store/cart`,
    },
    {
      changeFrequency: 'monthly' as const,
      lastModified: new Date(),
      priority: 0.6,
      url: `${baseUrl}/store/search`,
    },
  ]

  // Aquí podrías agregar páginas dinámicas como productos, artistas, etc.
  // Por ejemplo:
  // const dynamicPages = await getDynamicPages()
  
  return staticPages
} 