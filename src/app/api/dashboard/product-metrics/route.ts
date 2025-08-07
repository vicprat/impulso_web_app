import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/src/config/Permissions'
import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'
import { requirePermission } from '@/src/modules/auth/server/server'

let primaryLocationId: string | null = null

async function getPrimaryLocationId(): Promise<string> {
  if (primaryLocationId) return primaryLocationId

  const response = await makeAdminApiRequest<{ locations: { edges: { node: { id: string } }[] } }>(
    `query { locations(first: 1, query: "is_active:true") { edges { node { id name } } } }`,
    {}
  )

  const locationId = response.locations.edges[ 0 ]?.node?.id
  if (!locationId) {
    throw new Error('No se pudo encontrar una ubicación de Shopify para gestionar el inventario.')
  }

  primaryLocationId = locationId
  return primaryLocationId
}

export async function GET() {
  try {
    const session = await requirePermission(PERMISSIONS.VIEW_ANALYTICS)

    // Obtener TODOS los productos usando paginación como en getProductStats
    const allProducts: any[] = []
    let hasNextPage = true
    let cursor: string | undefined = undefined

    while (hasNextPage) {
      const variables: {
        after?: string
        first: number
        query: string
        reverse: boolean
        sortKey: 'TITLE'
      } = {
        after: cursor,
        first: 50, // Reducido para evitar throttling
        query: '',
        reverse: false,
        sortKey: 'TITLE',
      }

      try {
        const response = await makeAdminApiRequest<any>(`
          query($after: String, $first: Int!, $query: String, $reverse: Boolean, $sortKey: ProductSortKeys) {
  products(after: $after, first: $first, query: $query, reverse: $reverse, sortKey: $sortKey) {
    edges {
      node {
        id
        handle
        title
        descriptionHtml
        vendor
        productType
        status
        tags

        variants(first: 10) {
          edges {
            node {
              id
              title
              availableForSale
              price
              sku
              inventoryQuantity
              inventoryPolicy
              inventoryItem {
                tracked
              }
            }
          }
        }
        metafields(first: 50) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
        `, variables)

        const locationId = await getPrimaryLocationId()
        const products = response.products.edges.map((edge: any) => {
          // Crear un objeto Product simplificado para el dashboard
          const productData = edge.node

          return {
            id: productData.id,
            handle: productData.handle,
            title: productData.title,
            descriptionHtml: productData.descriptionHtml,
            vendor: productData.vendor,
            productType: productData.productType,
            status: productData.status,
            tags: productData.tags,
            images: [], // Array vacío para evitar errores
            media: [], // Array vacío para evitar errores
            variants: productData.variants.edges.map((variantEdge: any) => ({
              id: variantEdge.node.id,
              title: variantEdge.node.title,
              availableForSale: variantEdge.node.availableForSale,
              price: { amount: variantEdge.node.price, currencyCode: 'MXN' },
              sku: variantEdge.node.sku,
              inventoryQuantity: variantEdge.node.inventoryQuantity,
              inventoryPolicy: variantEdge.node.inventoryPolicy,
              inventoryManagement: variantEdge.node.inventoryItem.tracked ? 'SHOPIFY' : 'NOT_MANAGED'
            })),
            metafields: productData.metafields.edges,
            // Métodos del modelo Product
            get primaryVariant() {
              return this.variants[ 0 ] || null
            },
            get formattedPrice() {
              const variant = this.primaryVariant
              return variant ? `$${parseFloat(variant.price.amount).toFixed(2)}` : '$0.00'
            },
            get isAvailable() {
              const variant = this.primaryVariant
              return variant ? variant.availableForSale && (variant.inventoryQuantity || 0) > 0 : false
            },
            // Procesar artworkDetails desde metafields
            get artworkDetails() {
              const details: any = {}
              for (const { node } of this.metafields) {
                if (node.namespace === 'art_details') {
                  const validKeys = [ 'medium', 'year', 'height', 'width', 'depth', 'serie', 'location', 'artist' ]
                  if (validKeys.includes(node.key)) {
                    details[ node.key ] = node.value
                  }
                }
              }
              return {
                artist: details.artist || null,
                medium: details.medium || null,
                year: details.year || null,
                height: details.height || null,
                width: details.width || null,
                depth: details.depth || null,
                serie: details.serie || null,
                location: details.location || null,
              }
            },
            // Procesar tags
            get manualTags() {
              return this.tags.filter((tag: string) => !tag.startsWith('auto-'))
            },
            get autoTags() {
              return this.tags.filter((tag: string) => tag.startsWith('auto-'))
            }
          }
        })
        allProducts.push(...products)

        // Verificar si hay más páginas
        hasNextPage = response.products.pageInfo.hasNextPage
        cursor = response.products.pageInfo.endCursor ?? undefined

        // Para inventarios muy grandes, limitamos a 5000 productos máximo
        if (allProducts.length >= 5000) {
          break
        }

        // Delay para evitar throttling
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error: any) {
        if (error.message?.includes('Throttled')) {
          console.log('Throttled, esperando 2 segundos...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
        throw error
      }
    }

    const products = allProducts

    const data = {
      activeProducts: products.filter((p) => p.status === 'ACTIVE').length,
      archivedProducts: products.filter((p) => p.status === 'ARCHIVED').length,
      averagePrice:
        products.length > 0
          ? products.reduce(
            (sum: number, p: any) => sum + parseFloat(p.primaryVariant?.price?.amount ?? '0'),
            0
          ) / products.length
          : 0,
      draftProducts: products.filter((p) => p.status === 'DRAFT').length,
      productsByArtist: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const artist = product.vendor ?? 'Sin artista'
          acc[ artist ] = (acc[ artist ] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      productsByCategory: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const category = product.productType ?? 'Sin categoría'
          acc[ category ] = (acc[ category ] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      totalInventoryValue: products.reduce(
        (sum: number, p: any) => sum + parseFloat(p.primaryVariant?.price?.amount ?? '0'),
        0
      ),
      totalProducts: products.length,
      // Métricas enriquecidas con datos de artwork
      productsWithArtworkDetails: products.filter(p =>
        p.artworkDetails && Object.values(p.artworkDetails).some(value => value !== null)
      ).length,
      productsByMedium: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const medium = product.artworkDetails?.medium || 'Sin medio especificado'
          acc[ medium ] = (acc[ medium ] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      productsByYear: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const year = product.artworkDetails?.year || 'Sin año especificado'
          acc[ year ] = (acc[ year ] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      productsByLocation: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const location = product.artworkDetails?.location || 'Sin ubicación especificada'
          acc[ location ] = (acc[ location ] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      productsBySerie: products.reduce(
        (acc: Record<string, number>, product: any) => {
          const serie = product.artworkDetails?.serie || 'Sin serie especificada'
          acc[ serie ] = (acc[ serie ] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      // Información detallada de productos
      productsDetails: products.map(product => ({
        id: product.id,
        title: product.title,
        status: product.status,
        vendor: product.vendor,
        productType: product.productType,
        artworkDetails: product.artworkDetails,
        tags: product.tags,
        manualTags: product.manualTags,
        autoTags: product.autoTags,
        price: product.formattedPrice,
        isAvailable: product.isAvailable
      }))
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching product metrics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
