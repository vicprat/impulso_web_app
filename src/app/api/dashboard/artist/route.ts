import { type NextRequest, NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'

interface ShopifyResponse {
  data?: {
    products: {
      edges: { node: any }[]
      pageInfo: {
        hasNextPage: boolean
        endCursor: string | null
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Obtener datos del usuario actual (artista)
    const userResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`)
    const userData = await userResponse.json()

    if (!userData.user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    const currentArtist = userData.user.name

    // Obtener todos los productos
    const productsQuery = `
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
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
              price
              tags
              metafields(namespace: "custom", first: 10) {
                edges {
                  node {
                    key
                    value
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    availableForSale
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
          first: 50,
          after: cursor,
        })

        if (response.data?.products) {
          const products = response.data.products.edges.map((edge: any) => edge.node)
          allProducts = [ ...allProducts, ...products ]

          hasNextPage = response.data.products.pageInfo.hasNextPage
          cursor = response.data.products.pageInfo.endCursor
        } else {
          hasNextPage = false
        }

        // Delay para evitar throttling
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error: any) {
        if (error.message?.includes('Throttled')) {
          console.log('Throttled, waiting 2 seconds...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
        throw error
      }
    }

    // Filtrar productos del artista actual
    const artistProducts = allProducts.filter(product => product.vendor === currentArtist)

    // Crear objetos enriquecidos para los productos del artista
    const enrichedArtistProducts = artistProducts.map((product: any) => {
      const primaryVariant = product.variants?.edges?.[ 0 ]?.node
      const price = primaryVariant?.price || '0'

      // Extraer metadatos
      const metafields = product.metafields?.edges?.reduce((acc: any, edge: any) => {
        acc[ edge.node.key ] = edge.node.value
        return acc
      }, {}) || {}

      const artworkDetails = {
        medium: metafields.medium || null,
        year: metafields.year || null,
        location: metafields.location || null,
        artist: metafields.artist || null,
        serie: metafields.serie || null,
        height: metafields.height || null,
        width: metafields.width || null,
        depth: metafields.depth || null,
      }

      return {
        id: product.id,
        title: product.title,
        vendor: product.vendor,
        productType: product.productType,
        status: product.status,
        price: `$${parseFloat(price).toLocaleString()}`,
        isAvailable: primaryVariant?.availableForSale || false,
        artworkDetails,
        manualTags: product.tags || [],
        autoTags: [],
        images: [],
        media: [],
      }
    })

    // Calcular métricas del artista
    const artistMetrics = {
      totalProducts: enrichedArtistProducts.length,
      activeProducts: enrichedArtistProducts.filter(p => p.status === 'ACTIVE').length,
      draftProducts: enrichedArtistProducts.filter(p => p.status === 'DRAFT').length,
      totalValue: enrichedArtistProducts.reduce((sum, p) => {
        const price = parseFloat(p.price?.replace('$', '').replace(',', '') || '0')
        return sum + price
      }, 0),
      averagePrice: enrichedArtistProducts.length > 0
        ? enrichedArtistProducts.reduce((sum, p) => {
          const price = parseFloat(p.price?.replace('$', '').replace(',', '') || '0')
          return sum + price
        }, 0) / enrichedArtistProducts.length
        : 0,
      productsWithArtworkDetails: enrichedArtistProducts.filter(p =>
        p.artworkDetails && Object.values(p.artworkDetails).some(v => v && v !== 'Sin medio especificado')
      ).length
    }

    // Filtrar eventos del artista
    const artistEvents = enrichedArtistProducts.filter(p => p.productType === 'Evento')

    // Calcular distribuciones
    const artistProductsByCategory = enrichedArtistProducts.reduce((acc, product) => {
      const category = product.productType || 'Sin categoría'
      acc[ category ] = (acc[ category ] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const artistProductsByMedium = enrichedArtistProducts.reduce((acc, product) => {
      const medium = product.artworkDetails?.medium || 'Sin medio especificado'
      acc[ medium ] = (acc[ medium ] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const artistProductsByYear = enrichedArtistProducts.reduce((acc, product) => {
      const year = product.artworkDetails?.year || 'Sin año especificado'
      acc[ year ] = (acc[ year ] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const artistProductsByLocation = enrichedArtistProducts.reduce((acc, product) => {
      const location = product.artworkDetails?.location || 'Sin ubicación especificada'
      acc[ location ] = (acc[ location ] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const artistProductsBySerie = enrichedArtistProducts.reduce((acc, product) => {
      const serie = product.artworkDetails?.serie || 'Sin serie especificada'
      acc[ serie ] = (acc[ serie ] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      user: userData.user,
      artistProducts: enrichedArtistProducts,
      artistMetrics,
      artistEvents,
      artistProductsByCategory,
      artistProductsByMedium,
      artistProductsByYear,
      artistProductsByLocation,
      artistProductsBySerie,
    })
  } catch (error) {
    console.error('Error fetching artist dashboard data:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard del artista' },
      { status: 500 }
    )
  }
}