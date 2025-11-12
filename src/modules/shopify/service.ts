import { prisma } from '@/lib/prisma'

import { api } from './api'
import { type Money, type Product, type ProductSearchParams, type ProductsResponse } from './types'

interface EventVariant {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  compareAtPrice: Money | null
  sku: string | null
  selectedOptions: {
    name: string
    value: string
  }[]
  inventoryQuantity: number | null
  inventoryPolicy: 'DENY' | 'CONTINUE'
  inventoryManagement: 'SHOPIFY' | 'NOT_MANAGED'
}

interface PublicEventDetails {
  date: string | null
  endTime: string | null
  location: string | null
  organizer: string | null
  startTime: string | null
}

export interface PublicEvent {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  productType: string
  vendor: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  images: {
    id?: string
    url: string
    altText: string | null
    width?: number
    height?: number
  }[]
  variants: EventVariant[]
  tags: string[]
  eventDetails: PublicEventDetails
  createdAt: string
  updatedAt: string
  priceRange: {
    minVariantPrice: Money
    maxVariantPrice: Money
  }
  primaryVariant: EventVariant | null
  isAvailable: boolean
  availableForSale: boolean
  formattedPrice: string
}

export const privateRoomsServerApi = {
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
  getPublicEvents: async (params: ProductSearchParams = {}): Promise<PublicEvent[]> => {
    const eventParams = {
      ...params,
      filters: {
        ...params.filters,
        query: "product_type:'Evento' OR product_type:'Event' OR product_type:'Events'",
      },
    }

    const allProductsResponse = await api.getProducts(eventParams)

    const eventProducts = allProductsResponse.data.products

    const events = eventProducts.map((product: Product) => {
      const variants = product.variants.map((variant) => ({
        availableForSale: variant.availableForSale,
        compareAtPrice: variant.compareAtPrice,
        id: variant.id,
        inventoryManagement: 'NOT_MANAGED' as const,
        inventoryPolicy: 'DENY' as const,
        inventoryQuantity: null,
        price: variant.price,
        selectedOptions: variant.selectedOptions,
        sku: variant.sku,
        title: variant.title,
      }))

      const primaryVariant = variants.length > 0 ? variants[0] : null
      const isAvailable = primaryVariant ? primaryVariant.availableForSale : false

      const formattedPrice = primaryVariant
        ? `${parseFloat(primaryVariant.price.amount).toLocaleString('es-MX')} ${primaryVariant.price.currencyCode}`
        : 'Sin precio'

      return {
        availableForSale: isAvailable,
        createdAt: product.createdAt,
        descriptionHtml: product.descriptionHtml,
        eventDetails: {
          date: null,
          endTime: null,
          location: null,
          organizer: null,
          startTime: null,
        },
        formattedPrice,
        handle: product.handle,
        id: product.id,
        images: product.images,
        isAvailable,
        priceRange: product.priceRange,
        primaryVariant,
        productType: product.productType,
        status: product.status ?? 'ACTIVE',
        tags: product.tags ?? [],
        title: product.title,
        updatedAt: product.updatedAt,
        variants,
        vendor: product.vendor,
      }
    })

    return events
  },

  getPublicProducts: async (params: ProductSearchParams = {}): Promise<ProductsResponse> => {
    const allProductsResponse = await api.getProducts(params)

    const filteredProducts = allProductsResponse.data.products.filter(
      (product: Product) => product.vendor !== 'Evento' // Excluir eventos de la tienda general
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

    const relatedData = await api.getProducts({
      filters: {
        query: combinedQuery,
      },
      first: 20,
    })

    if (!relatedData.data.products) {
      return []
    }

    const filtered = relatedData.data.products.filter((p: Product) => p.id !== product.id)

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
