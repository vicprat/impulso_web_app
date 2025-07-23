import { NextResponse } from 'next/server'

import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { api } from '@/modules/shopify/api'
import { getPrivateProductIds } from '@/modules/shopify/service'

// ID de ubicación por defecto para eventos públicos
const DEFAULT_LOCATION_ID = 'gid://shopify/Location/123456789'

// Consulta para obtener metafields e inventario desde la API de administración
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

// Función para adaptar datos de la API de la tienda al formato esperado por el modelo Event
function adaptShopifyDataToEventModel(shopifyData: any, adminData?: any) {
  return {
    descriptionHtml: shopifyData.descriptionHtml,
    handle: shopifyData.handle,
    id: shopifyData.id,
    images: {
      edges: (shopifyData.images || []).map((image: any) => ({ node: image })),
    },
    metafields: {
      edges: adminData?.metafields?.edges || [],
    },
    productType: shopifyData.productType,
    status: shopifyData.status || 'ACTIVE',
    tags: shopifyData.tags || [],
    title: shopifyData.title,
    variants: {
      edges: shopifyData.variants.map((variant: any, index: number) => {
        // Usar datos de la API de administración si están disponibles
        const adminVariant = adminData?.variants?.edges?.[index]?.node

        return {
          node: {
            ...variant,
            // Usar datos de inventario de la API de administración
            inventoryItem: adminVariant?.inventoryItem || { tracked: false },
            inventoryPolicy: adminVariant?.inventoryPolicy || variant.inventoryPolicy || 'DENY',
            inventoryQuantity: adminVariant?.inventoryQuantity || variant.inventoryQuantity || null,
            // Corregir la estructura del precio
            price:
              typeof variant.price === 'object' && variant.price.amount
                ? variant.price.amount
                : variant.price,
          },
        }
      }),
    },
    vendor: shopifyData.vendor,
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ handle: string }> }) {
  try {
    const { handle } = await params

    // Obtener el evento desde la API de la tienda
    const response = await api.getProductByHandle(handle)
    const shopifyEventData = response.data

    // Verificar que sea un evento
    if (shopifyEventData.productType !== 'Evento') {
      return NextResponse.json(
        { error: 'El producto encontrado no es un evento.' },
        { status: 404 }
      )
    }

    // Verificar que no sea privado
    const privateProductIds = await getPrivateProductIds()
    if (privateProductIds.includes(shopifyEventData.id)) {
      return NextResponse.json({ error: 'Evento no encontrado.' }, { status: 404 })
    }

    // Obtener metafields e inventario desde la API de administración
    let adminData = null
    try {
      const adminResponse = (await makeAdminApiRequest(EVENT_DETAILS_QUERY, {
        id: shopifyEventData.id,
      })) as any
      adminData = adminResponse.product
    } catch (adminError) {
      console.warn('No se pudieron obtener metafields e inventario:', adminError)
    }

    // Adaptar datos al formato esperado por el modelo Event
    const adaptedData = adaptShopifyDataToEventModel(shopifyEventData, adminData)

    return NextResponse.json(adaptedData)
  } catch (error: unknown) {
    console.error('Error fetching public event:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
