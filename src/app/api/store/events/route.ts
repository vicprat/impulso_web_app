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
  // Función helper para normalizar imágenes
  const normalizeImages = (images: any) => {
    if (!images) return { edges: [] }
    
    // Si ya tiene la estructura edges/node, devolverlo tal como está
    if (images.edges && Array.isArray(images.edges)) {
      return images
    }
    
    // Si es un array directo, convertirlo al formato edges/node
    if (Array.isArray(images)) {
      return {
        edges: images.map((image: any) => ({ node: image }))
      }
    }
    
    // Si es un objeto con otra estructura, intentar extraer las imágenes
    if (typeof images === 'object') {
      // Buscar propiedades que puedan contener imágenes
      const possibleImageProps = ['src', 'url', 'image', 'images']
      for (const prop of possibleImageProps) {
        if (images[prop] && Array.isArray(images[prop])) {
          return {
            edges: images[prop].map((image: any) => ({ node: image }))
          }
        }
      }
    }
    
    // Si no se puede determinar, devolver array vacío
    return { edges: [] }
  }

  // Función helper para normalizar variantes
  const normalizeVariants = (variants: any) => {
    if (!variants) return { edges: [] }
    
    // Si ya tiene la estructura edges/node, devolverlo tal como está
    if (variants.edges && Array.isArray(variants.edges)) {
      return variants
    }
    
    // Si es un array directo, convertirlo al formato edges/node
    if (Array.isArray(variants)) {
      return {
        edges: variants.map((variant: any, index: number) => {
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
        })
      }
    }
    
    // Si no se puede determinar, devolver array vacío
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

    // Construir filtros para eventos
    let query = "product_type:'Evento'"
    if (search?.trim()) {
      query += ` AND (title:*${search}* OR vendor:*${search}*)`
    }

    const response = await api.getProducts({
      after,
      filters: { query },
      first,
    })

    // Obtener IDs de productos privados
    const privateProductIds = await getPrivateProductIds()

    // Filtrar eventos privados
    const publicProducts = response.data.products.filter(
      (product) => !privateProductIds.includes(product.id)
    )

    // Obtener eventos enriquecidos con metafields e inventario
    const enrichedEvents = []

    for (const product of publicProducts) {
      try {
        // Obtener metafields e inventario desde la API de administración
        let adminData = null
        try {
          const adminResponse = (await makeAdminApiRequest(EVENT_DETAILS_QUERY, {
            id: product.id,
          })) as any
          adminData = adminResponse.product
        } catch (adminError) {
          console.warn(`No se pudieron obtener metafields para ${product.handle}:`, adminError)
        }

        // Adaptar datos al formato esperado por el modelo Event
        const adaptedData = adaptShopifyDataToEventModel(product, adminData)

        // Devolver los datos crudos para que el cliente los procese
        enrichedEvents.push(adaptedData)
      } catch (error) {
        console.error(`Error enriching event ${product.handle}:`, error)
        // Continuar con el siguiente evento
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
