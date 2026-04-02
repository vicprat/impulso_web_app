import { getAllPublicRoutes } from '@/config/routes'
import { getPublicArtists } from '@/lib/landing-data'
import { blogService } from '@/modules/blog/service'
import { PRODUCTS_QUERY } from '@/modules/shopify/queries'

import type { MetadataRoute } from 'next'

const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2024-10'
const publicAccessToken = process.env.NEXT_PUBLIC_API_SHOPIFY_STOREFRONT ?? ''
let storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE ?? ''

if (storeDomain.startsWith('https://')) {
  storeDomain = storeDomain.replace('https://', '')
} else if (storeDomain.startsWith('http://')) {
  storeDomain = storeDomain.replace('http://', '')
}

async function fetchShopifyForSitemap(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(`https://${storeDomain}/api/${apiVersion}/graphql.json`, {
    body: JSON.stringify({ query, variables }),
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': publicAccessToken,
    },
    method: 'POST',
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors) {
    console.error('GraphQL errors:', json.errors)
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`)
  }

  return json.data
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://impulsogaleria.com'

  const publicRoutes = getAllPublicRoutes()

  const staticPages: MetadataRoute.Sitemap = publicRoutes
    .filter((route) => !route.includes(':'))
    .map((route) => {

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
      } else if (route === '/contact') {
        priority = 0.8
        changeFrequency = 'monthly'
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

  let postPages: MetadataRoute.Sitemap = []
  try {
    const postTypes = [
      { postType: 'BLOG' as const, type: 'blog' },
      { postType: 'EVENT' as const, type: 'event' },
    ]

    for (const { postType, type } of postTypes) {
      const postsResult = await blogService.listPosts({
        page: 1,
        pageSize: 100,
        postType,
      })

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

  let productPages: MetadataRoute.Sitemap = []
  try {
    const data = await fetchShopifyForSitemap(PRODUCTS_QUERY, {
      after: null,
      first: 100,
      query: '',
      reverse: false,
    })

    const products = data?.products?.edges?.map((edge: any) => edge.node) || []

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

  let eventPages: MetadataRoute.Sitemap = []
  try {
    const data = await fetchShopifyForSitemap(PRODUCTS_QUERY, {
      after: null,
      first: 50,
      query: 'product_type:event',
      reverse: false,
      sortKey: 'BEST_SELLING',
    })

    const events = data?.products?.edges?.map((edge: any) => edge.node) || []

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
