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

export async function GET(request: Request, { params }: { params: Promise<{ handle: string }> }) {
  try {
    const { handle } = await params

    const response = await api.getProductByHandle(handle)
    const shopifyEventData = response.data

    if (shopifyEventData.productType !== 'Evento') {
      return NextResponse.json(
        { error: 'El producto encontrado no es un evento.' },
        { status: 404 }
      )
    }

    let adminData = null
    try {
      const adminResponse = (await makeAdminApiRequest(EVENT_DETAILS_QUERY, {
        id: shopifyEventData.id,
      })) as any
      adminData = adminResponse.product
    } catch (adminError) {
      console.warn('No se pudieron obtener metafields e inventario:', adminError)
    }

    const adaptedData = adaptShopifyDataToEventModel(shopifyEventData, adminData)

    return NextResponse.json(adaptedData)
  } catch (error: unknown) {
    console.error('Error fetching public event:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
