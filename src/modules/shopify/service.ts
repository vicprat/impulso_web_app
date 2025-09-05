import { prisma } from '@/lib/prisma'

import { api } from './api'
import { type Product, type ProductSearchParams, type ProductsResponse } from './types'

export const privateRoomsServerApi = {
  getPrivateProductIds: async (): Promise<string[]> => {
    try {
      const privateRoomProducts = await prisma.privateRoomProduct.findMany({
        select: {
          productId: true,
        },
      })
      return privateRoomProducts.map((p) => p.productId)
    } catch {
      return []
    }
  },

  getPrivateRoomByUserId: async (userId: string) => {
    try {
      const privateRoom = await prisma.privateRoom.findFirst({
        include: {
          products: true,
        },
        where: {
          userId,
        },
      })

      return privateRoom
    } catch {
      return null
    }
  },
}

export const getPrivateProductIds = async (): Promise<string[]> => {
  try {
    if (typeof window === 'undefined') {
      return await privateRoomsServerApi.getPrivateProductIds()
    } else {
      const response = await fetch('/api/private-rooms/product-ids')
      if (!response.ok) {
        throw new Error(`Error fetching private product IDs: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    }
  } catch {
    return []
  }
}

export const getPrivateRoomByUserId = async (userId: string) => {
  try {
    if (typeof window === 'undefined') {
      return await privateRoomsServerApi.getPrivateRoomByUserId(userId)
    } else {
      const response = await fetch(`/api/private-rooms/user/${userId}`)
      if (!response.ok) {
        throw new Error(`Error fetching private room: ${response.statusText}`)
      }
      const data = await response.json()
      return data
    }
  } catch {
    return null
  }
}

export const shopifyService = {
  getPublicEvents: async (params: ProductSearchParams = {}): Promise<any[]> => {
    // Construir filtros específicos para eventos
    const eventParams = {
      ...params,
      filters: {
        ...params.filters,
        query: "product_type:'Evento' OR product_type:'Event' OR product_type:'Events'",
      },
    }

    const [allProductsResponse, privateProductIds] = await Promise.all([
      api.getProducts(eventParams),
      getPrivateProductIds(),
    ])

    // Filtrar solo eventos públicos
    const eventProducts = allProductsResponse.data.products.filter(
      (product: Product) => !privateProductIds.includes(product.id)
    )

    // Retornar objetos con estructura de Event (serializables para Server Components)
    const events = eventProducts.map((product: Product) => {
      // Adaptar Product a estructura de Event
      return {
        createdAt: product.createdAt,
        descriptionHtml: product.descriptionHtml,
        eventDetails: {
          date: null,
          endTime: null,
          location: null,
          organizer: null,
          startTime: null,
        },
        handle: product.handle,
        id: product.id,
        images: product.images,
        primaryLocationId: 'gid://shopify/Location/123456789',
        productType: product.productType,
        status: product.status ?? 'ACTIVE',
        tags: product.tags ?? [],
        title: product.title,
        updatedAt: product.updatedAt,
        variants: product.variants.map((variant) => ({
          availableForSale: variant.availableForSale,
          compareAtPrice: variant.compareAtPrice,
          id: variant.id,
          inventoryManagement: null,
          inventoryPolicy: 'DENY' as const,
          inventoryQuantity: null,
          price: variant.price,
          selectedOptions: variant.selectedOptions,
          sku: variant.sku,
          title: variant.title,
        })),
        vendor: product.vendor,
      }
    })

    return events
  },

  getPublicProducts: async (params: ProductSearchParams = {}): Promise<ProductsResponse> => {
    const [allProductsResponse, privateProductIds] = await Promise.all([
      api.getProducts(params),
      getPrivateProductIds(),
    ])

    const filteredProducts = allProductsResponse.data.products.filter(
      (product: Product) => !privateProductIds.includes(product.id) && product.vendor !== 'Evento' // Excluir eventos de la tienda general
    )

    return {
      data: {
        pageInfo: allProductsResponse.data.pageInfo,
        products: filteredProducts,
      },
      statusCode: allProductsResponse.statusCode,
    }
  },

  getRelatedProducts: async (product: Product): Promise<Product[]> => {
    const vendorQuery = product.vendor ? `vendor:'${product.vendor}'` : ''
    const priceRangeQuery = `priceRange:'${product.priceRange}'`
    const combinedQuery = [vendorQuery, priceRangeQuery].filter(Boolean).join(' OR ')

    const [relatedData, privateProductIds] = await Promise.all([
      api.getProducts({
        filters: {
          query: combinedQuery,
        },
        first: 20,
      }),
      getPrivateProductIds(),
    ])

    if (!relatedData.data.products) {
      return []
    }

    const filtered = relatedData.data.products.filter(
      (p: Product) => p.id !== product.id && !privateProductIds.includes(p.id)
    )

    const shuffleArray = (array: Product[]) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    const shuffled = shuffleArray(filtered)
    return shuffled.slice(0, 8)
  },
}
