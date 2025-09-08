import { getAllPublicRoutes } from '@/config/routes'
import { getPublicArtists } from '@/lib/landing-data'
import { blogService } from '@/modules/blog/service'
import { shopifyService } from '@/modules/shopify/service'

import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://impulsogaleria.com'

  // Obtener rutas públicas desde la configuración
  const publicRoutes = getAllPublicRoutes()

  // Crear páginas estáticas basadas en las rutas públicas
  const staticPages: MetadataRoute.Sitemap = publicRoutes
    .filter((route) => !route.includes(':')) // Excluir rutas dinámicas
    .map((route) => {
      // Asignar prioridades basadas en la importancia de la ruta
      let priority = 0.5
      let changeFrequency:
        | 'always'
        | 'hourly'
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'yearly'
        | 'never' = 'weekly'

      if (route === '/') {
        priority = 1
        changeFrequency = 'daily'
      } else if (route === '/store') {
        priority = 0.9
        changeFrequency = 'daily'
      } else if (route === '/artists') {
        priority = 0.8
        changeFrequency = 'weekly'
      } else if (route === '/blog' || route === '/events') {
        priority = 0.7
        changeFrequency = 'weekly'
      } else if (route === '/services' || route === '/membership') {
        priority = 0.6
        changeFrequency = 'monthly'
      } else if (route === '/terms') {
        priority = 0.3
        changeFrequency = 'yearly'
      }

      return {
        changeFrequency,
        lastModified: new Date(),
        priority,
        url: `${baseUrl}${route}`,
      }
    })

  // Agregar páginas dinámicas de artistas
  let artistPages: MetadataRoute.Sitemap = []
  try {
    const artists = await getPublicArtists()
    artistPages = artists.map((artist) => ({
      changeFrequency: 'weekly' as const,
      lastModified: new Date(),
      priority: 0.6,
      url: `${baseUrl}/artists/${artist.email}`,
    }))
  } catch (error) {
    console.error('Error fetching artists for sitemap:', error)
  }

  // Agregar páginas dinámicas de posts
  let postPages: MetadataRoute.Sitemap = []
  try {
    const postTypes = [
      { postType: 'BLOG' as const, type: 'blog' },
      { postType: 'EVENT' as const, type: 'event' },
    ]

    for (const { postType, type } of postTypes) {
      const postsResult = await blogService.listPosts({
        page: 1,
        pageSize: 100, // Obtener más posts para el sitemap
        postType,
      })

      // Verificar si postsResult tiene la propiedad data
      const posts = 'data' in postsResult ? postsResult.data : postsResult

      if (Array.isArray(posts)) {
        const typePages = posts.map((post: { slug: string; updatedAt: string | Date }) => ({
          changeFrequency: 'weekly' as const,
          lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
          priority: 0.5,
          url: `${baseUrl}/${type}/${post.slug}`,
        }))

        postPages = [...postPages, ...typePages]
      }
    }
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error)
  }

  // Agregar páginas dinámicas de productos de la tienda
  let productPages: MetadataRoute.Sitemap = []
  try {
    const productsResponse = await shopifyService.getPublicProducts({ first: 100 })
    const products = 'data' in productsResponse ? productsResponse.data : productsResponse

    if (Array.isArray(products)) {
      productPages = products.map((product: { handle: string; updatedAt: string }) => ({
        changeFrequency: 'weekly' as const,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        priority: 0.7,
        url: `${baseUrl}/store/product/${product.handle}`,
      }))
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  // Agregar páginas dinámicas de eventos de la tienda
  let eventPages: MetadataRoute.Sitemap = []
  try {
    const events = await shopifyService.getPublicEvents({ first: 50 })

    if (Array.isArray(events)) {
      eventPages = events.map((event: { handle: string; updatedAt: string }) => ({
        changeFrequency: 'weekly' as const,
        lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
        priority: 0.6,
        url: `${baseUrl}/store/event/${event.handle}`,
      }))
    }
  } catch (error) {
    console.error('Error fetching store events for sitemap:', error)
  }

  return [...staticPages, ...artistPages, ...postPages, ...productPages, ...eventPages]
}
