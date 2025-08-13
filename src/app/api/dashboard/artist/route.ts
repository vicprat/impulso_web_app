import { type NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/modules/auth/server/server'
import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'

interface ShopifyResponse {
  products: {
    edges: { node: any }[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Obtener datos del usuario actual (artista) sin hacer fetch interno
    const session = await requireAuth()
    const userData = { user: session.user }

    if (!userData.user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    const currentArtist = userData.user.artist?.name
    if (!currentArtist) {
      return NextResponse.json(
        { error: 'El usuario no tiene un artista/vendor asignado' },
        { status: 400 }
      )
    }

    // Obtener productos del artista específico usando el vendor como filtro
    const productsQuery = `
      query GetArtistProducts($first: Int!, $after: String) {
        products(first: $first, after: $after, query: "vendor:\\"${currentArtist}\\"") {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              vendor
              productType
              status
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    availableForSale
                  }
                }
              }
              metafields(namespace: "art_details", first: 10) {
                edges {
                  node {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `

    let allProducts: any[] = []
    let hasNextPage = true
    let cursor: string | null = null

    while (hasNextPage) {
      try {
        const response: ShopifyResponse = await makeAdminApiRequest(productsQuery, {
          after: cursor,
          first: 50,
        })

        if (response.products) {
          const products = response.products.edges.map((edge: any) => edge.node)
          allProducts = [...allProducts, ...products]

          hasNextPage = response.products.pageInfo.hasNextPage
          cursor = response.products.pageInfo.endCursor
        } else {
          hasNextPage = false
        }

        // Delay para evitar throttling
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error: any) {
        console.error('Error fetching products from Shopify:', error)

        if (error.message?.includes('Throttled')) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          continue
        }

        throw error
      }
    }

    // Filtrar productos del artista actual
    const artistProducts = allProducts.filter((product) => {
      // Si el producto no tiene vendor, no incluirlo
      if (!product.vendor) return false

      // Comparar vendor del producto con el nombre del artista (case-insensitive)
      return product.vendor.toLowerCase() === currentArtist.toLowerCase()
    })

    // Crear objetos enriquecidos para los productos del artista
    const enrichedProducts = artistProducts.map((product: any) => {
      // Extraer metafields de art_details
      const artworkDetails: any = {}
      if (product.metafields?.edges) {
        product.metafields.edges.forEach((edge: any) => {
          const { key, value } = edge.node
          artworkDetails[key] = value
        })
      }

      return {
        ...product,
        artworkDetails,

        isAvailable: product.variants?.edges?.[0]?.node?.availableForSale || false,
        // Calcular precio desde variants
        price: product.variants?.edges?.[0]?.node?.price || '0',
      }
    })

    // Calcular métricas enriquecidas
    const metrics = {
      activeProducts: enrichedProducts.filter((p: any) => p.status === 'ACTIVE').length,
      averagePrice:
        enrichedProducts.length > 0
          ? enrichedProducts.reduce((sum: number, p: any) => {
              const price = parseFloat(p.price?.replace(/[^0-9.]/g, '') || '0')
              return sum + price
            }, 0) / enrichedProducts.length
          : 0,
      draftProducts: enrichedProducts.filter((p: any) => p.status === 'DRAFT').length,
      productsWithArtworkDetails: enrichedProducts.filter((p: any) =>
        Object.values(p.artworkDetails).some((value: any) => value && value !== '')
      ).length,
      totalProducts: enrichedProducts.length,
      totalValue: enrichedProducts.reduce((sum: number, p: any) => {
        const price = parseFloat(p.price?.replace(/[^0-9.]/g, '') || '0')
        return sum + price
      }, 0),
    }

    // Filtrar eventos del artista
    const artistEvents = enrichedProducts.filter((p) => p.productType === 'Evento')

    // Calcular distribuciones
    const artistProductsByCategory = enrichedProducts.reduce(
      (acc, product) => {
        const category = product.productType ?? 'Sin categoría'
        acc[category] = (acc[category] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const artistProductsByMedium = enrichedProducts.reduce(
      (acc, product) => {
        const medium = product.artworkDetails?.medium ?? 'Sin medio especificado'
        acc[medium] = (acc[medium] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const artistProductsByYear = enrichedProducts.reduce(
      (acc, product) => {
        const year = product.artworkDetails?.year ?? 'Sin año especificado'
        acc[year] = (acc[year] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const artistProductsByLocation = enrichedProducts.reduce(
      (acc, product) => {
        const location = product.artworkDetails?.location ?? 'Sin ubicación especificada'
        acc[location] = (acc[location] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const artistProductsBySerie = enrichedProducts.reduce(
      (acc, product) => {
        const serie = product.artworkDetails?.serie ?? 'Sin serie especificada'
        acc[serie] = (acc[serie] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      artistEvents,
      artistMetrics: metrics,
      artistProducts: enrichedProducts,
      artistProductsByCategory,
      artistProductsByLocation,
      artistProductsByMedium,
      artistProductsBySerie,
      artistProductsByYear,
      user: {
        artist: userData.user.artist,
        email: userData.user.email,
        firstName: userData.user.firstName,
        id: userData.user.id,
        lastName: userData.user.lastName,
        permissions: userData.user.permissions,
        roles: userData.user.roles,
        shopifyCustomerId: userData.user.shopifyCustomerId,
      },
    })
  } catch (error) {
    console.error('Error fetching artist dashboard data:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard del artista' },
      { status: 500 }
    )
  }
}
