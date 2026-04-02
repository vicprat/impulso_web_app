import { NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { api } from '@/modules/shopify/api'

const EVENT_DETAILS_QUERY = `
  query EventDetails($id: ID!) {
    product(id: $id) {
      id
      variants(first: 20) {
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
            selectedOptions {
              name
              value
            }
          }
        }
      }
      metafields(first: 50, namespace: "event_details") {
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
`

function adaptShopifyDataToEventModel(shopifyData: any, adminData?: any) {
  const normalizeImages = (images: any) => {
    if (!images) return { edges: [] }

    if (images.edges && Array.isArray(images.edges)) {
      return images
    }

    if (Array.isArray(images)) {
      return {
        edges: images.map((image: any) => ({ node: image })),
      }
    }

    if (typeof images === 'object') {
      const possibleImageProps = ['src', 'url', 'image', 'images']
      for (const prop of possibleImageProps) {
        if (images[prop] && Array.isArray(images[prop])) {
          return {
            edges: images[prop].map((image: any) => ({ node: image })),
          }
        }
      }
    }

    return { edges: [] }
  }

  const normalizeVariants = (variants: any) => {
    if (!variants) return { edges: [] }

    if (variants.edges && Array.isArray(variants.edges)) {
      return variants
    }

    if (Array.isArray(variants)) {
      return {
        edges: variants.map((variant: any, index: number) => {
          const adminVariant = adminData?.variants?.edges?.[index]?.node

          return {
            node: {
              ...variant,

              inventoryItem: adminVariant?.inventoryItem || { tracked: false },
              inventoryPolicy: adminVariant?.inventoryPolicy || variant.inventoryPolicy || 'DENY',
              inventoryQuantity:
                adminVariant?.inventoryQuantity || variant.inventoryQuantity || null,

              price:
                typeof variant.price === 'object' && variant.price.amount
                  ? variant.price.amount
                  : variant.price,
            },
          }
        }),
      }
    }

    return { edges: [] }
  }

  return {
    descriptionHtml: shopifyData.descriptionHtml,
    handle: shopifyData.handle,
    id: shopifyData.id,
    images: normalizeImages(shopifyData.images),
    metafields: {
      edges: adminData?.metafields?.edges || [],
    },
    productType: shopifyData.productType,
    status: shopifyData.status || 'ACTIVE',
    tags: shopifyData.tags || [],
    title: shopifyData.title,
    variants: normalizeVariants(shopifyData.variants),
    vendor: shopifyData.vendor,
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const first = parseInt(searchParams.get('first') || '12')
    const after = searchParams.get('after')

    let query = "product_type:'Evento' OR product_type:'Event' OR product_type:'Events'"
    if (search?.trim()) {
      query += ` AND (title:*${search}* OR vendor:*${search}*)`
    }

    const response = await api.getProducts({
      after,
      filters: { query },
      first,
    })

    const enrichedEvents = []

    for (const product of response.data.products) {
      try {
        let adminData = null
        try {
          const adminResponse = (await makeAdminApiRequest(EVENT_DETAILS_QUERY, {
            id: product.id,
          })) as any
          adminData = adminResponse.product
        } catch (adminError) {
          console.warn(`No se pudieron obtener metafields para ${product.handle}:`, adminError)
        }

        const adaptedData = adaptShopifyDataToEventModel(product, adminData)

        enrichedEvents.push(adaptedData)
      } catch (error) {
        console.error(`Error enriching event ${product.handle}:`, error)
      }
    }

    return NextResponse.json({
      events: enrichedEvents,
      pageInfo: {
        endCursor: response.data.pageInfo.endCursor || '',
        hasNextPage: response.data.pageInfo.hasNextPage,
        hasPreviousPage: false,
        startCursor: '',
      },
    })
  } catch (error) {
    console.error('Error fetching public events:', error)
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}
