import { handleGraphQLErrors } from '@/lib/graphql'
import { storeClient } from '@/lib/shopify'

import { transformCollectionData, transformProductData } from './helpers'
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  EVENT_BY_HANDLE_QUERY,
  HOMEPAGE_QUERY,
  PRODUCTS_BY_IDS_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  SHOP_INFO_QUERY,
} from './queries'
import {
  type Collection,
  type CollectionResponse,
  type CollectionSearchParams,
  type CollectionsResponse,
  type Edge,
  type Product,
  type ProductSearchParams,
  type ProductsResponse,
  type RawCollection,
  type RawProduct
} from './types'

// Tipo para la respuesta de getProductByHandle que devuelve ShopifyProductData
export interface ShopifyProductDataResponse {
  data: {
    id: string
    handle: string
    title: string
    descriptionHtml: string
    vendor: string
    productType: string
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
    tags: string[]
    updatedAt: string
    images: {
      edges: { node: any }[]
    }
    media: {
      nodes: any[]
    }
    variants: {
      edges: { node: any }[]
    }
    metafields: {
      edges: { node: any }[]
    }
  }
  statusCode: number
}

// Función para convertir datos del API público al formato ShopifyProductData
function convertToShopifyProductData(rawProduct: RawProduct) {
  return {
    descriptionHtml: rawProduct.descriptionHtml,
    handle: rawProduct.handle,
    id: rawProduct.id,
    // Los productos públicos no tienen tags personalizados
images: {
      edges: rawProduct.images?.edges || []
    },
    
media: {
      nodes: [] // Los productos públicos no tienen media adicional
    },
    
metafields: {
      edges: [] // Los productos públicos no tienen metafields personalizados
    },
    
productType: rawProduct.productType,
    
status: 'ACTIVE' as const, 
    
// Los productos públicos siempre están activos
tags: [], 
    

title: rawProduct.title,
    

updatedAt: rawProduct.updatedAt,
    
variants: {
      edges: rawProduct.variants?.edges.map(edge => ({
        node: {
          availableForSale: edge.node.availableForSale,
          id: edge.node.id,
          // Política por defecto
inventoryItem: {
            tracked: false // Los productos públicos no están rastreados
          },
          
// Los productos públicos no tienen información de inventario
inventoryPolicy: 'DENY' as const,
          

inventoryQuantity: null,
          

price: edge.node.price.amount, 
          

sku: edge.node.sku, 
          
title: edge.node.title
        }
      })) || []
    },
    vendor: rawProduct.vendor
  }
}

export const api = {
  getCollectionByHandle: async (
    handle: string,
    productsFirst = 12
  ): Promise<CollectionResponse> => {
    try {
      const { data, errors } = await storeClient.request(COLLECTION_BY_HANDLE_QUERY, {
        variables: {
          handle,
          productsFirst,
        },
      })

      if (errors) {
        handleGraphQLErrors(Array.isArray(errors) ? errors : [])
      }

      if (!data.collection) {
        throw new Error(`Collection with handle "${handle}" not found`)
      }

      return {
        data: transformCollectionData(data.collection as RawCollection),
        statusCode: 200,
      }
    } catch (error) {
      console.error(`Error fetching collection with handle "${handle}":`, error)
      throw error
    }
  },

  getCollections: async (params: CollectionSearchParams = {}): Promise<CollectionsResponse> => {
    const { after = null, first = 10, query = '' } = params

    try {
      const { data, errors } = await storeClient.request(COLLECTIONS_QUERY, {
        variables: {
          after,
          first,
          query,
        },
      })

      if (errors) {
        handleGraphQLErrors(Array.isArray(errors) ? errors : [])
      }

      return {
        data: {
          collections: data.collections.edges.map((edge: Edge<RawCollection>) =>
            transformCollectionData(edge.node)
          ),
          pageInfo: data.collections.pageInfo,
        },
        statusCode: 200,
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
      throw error
    }
  },
  getEventByHandle: async (handle: string): Promise<{ data: any; statusCode: number }> => {
    try {
      const { data, errors } = await storeClient.request(EVENT_BY_HANDLE_QUERY, {
        variables: {
          handle,
        },
      })

      if (errors) {
        handleGraphQLErrors(Array.isArray(errors) ? errors : [])
      }

      if (!data?.product) {
        throw new Error(`Event with handle "${handle}" not found`)
      }

      return {
        data: data.product,
        statusCode: 200,
      }
    } catch (error) {
      console.error(`Error fetching event with handle "${handle}":`, error)
      throw error
    }
  },

  getHomepageData: async (): Promise<{
    data: {
      collections: Collection[]
      featuredProducts: Product[]
    }
    statusCode: number
  }> => {
    try {
      const { data, errors } = await storeClient.request(HOMEPAGE_QUERY)

      if (errors) {
        handleGraphQLErrors(Array.isArray(errors) ? errors : [])
      }

      const collections: Collection[] = data.collections.edges.map((edge: Edge<RawCollection>) => {
        const rawCollection: RawCollection = {
          ...edge.node,
          products: undefined,
        }
        return transformCollectionData(rawCollection)
      })

      const featuredProducts: Product[] = data.products.edges.map((edge: Edge<RawProduct>) =>
        transformProductData(edge.node)
      )

      return {
        data: {
          collections,
          featuredProducts,
        },
        statusCode: 200,
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error)
      throw error
    }
  },

  getProductByHandle: async (handle: string): Promise<ShopifyProductDataResponse> => {
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, errors } = await storeClient.request(PRODUCT_BY_HANDLE_QUERY, {
          variables: {
            handle,
          },
        })

        if (errors) {
          handleGraphQLErrors(Array.isArray(errors) ? errors : [])
        }

        if (!data) {
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }
          throw new Error(`No data received from Shopify API for handle "${handle}" after ${maxRetries} attempts`)
        }

        if (!data.product) {
          throw new Error(`Product with handle "${handle}" not found`)
        }

        return {
          data: convertToShopifyProductData(data.product as RawProduct),
          statusCode: 200,
        }
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        }
      }
    }

    throw lastError || new Error(`Failed to fetch product with handle "${handle}" after ${maxRetries} attempts`)
  },

  getProducts: async (params: ProductSearchParams = {}): Promise<ProductsResponse> => {
    const {
      after = null,
      filters = {},
      first = 12,
      reverse = false,
      sortKey = 'BEST_SELLING',
    } = params

    const queryParts: string[] = []
    if (filters.query) queryParts.push(filters.query)

    const orFilterMap: Record<string, string> = {
      productType: 'product_type',
      tags: 'tag',
      vendor: 'vendor',
    }
    for (const [key, shopifyKey] of Object.entries(orFilterMap)) {
      const filterValues = filters[key as keyof typeof filters] as string[] | undefined
      if (filterValues && Array.isArray(filterValues) && filterValues.length > 0) {
        const orPart = filterValues.map((v: string) => `${shopifyKey}:'${v}'`).join(' OR ')
        queryParts.push(`(${orPart})`)
      }
    }

    if (filters.price) {
      if (filters.price.min) queryParts.push(`price:>=${filters.price.min}`)
      if (filters.price.max) queryParts.push(`price:<=${filters.price.max}`)
    }

    const finalQuery = queryParts.join(' AND ')

    try {
      const { data, errors } = await storeClient.request(PRODUCTS_QUERY, {
        variables: {
          after,
          first,
          query: finalQuery,
          reverse,
          sortKey,
        },
      })

      if (errors) {
        console.error('GraphQL errors:', errors)
        handleGraphQLErrors(Array.isArray(errors) ? errors : [])
      }

      if (!data?.products) {
        throw new Error('No products data in GraphQL response')
      }

      return {
        data: {
          pageInfo: data.products.pageInfo,
          products: data.products.edges.map((edge: Edge<RawProduct>) =>
            transformProductData(edge.node)
          ),
        },
        statusCode: 200,
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  getProductsByIds: async (productIds: string[]): Promise<{ data: { pageInfo: any; products: Product[] }; statusCode: number }> => {
    try {
      const { data, errors } = await storeClient.request(PRODUCTS_BY_IDS_QUERY, {
        variables: {
          ids: productIds,
        },
      })

      if (errors) {
        handleGraphQLErrors(Array.isArray(errors) ? errors : [])
      }

      const products = data.nodes
        .filter((node: RawProduct) => node.id)
        .map((rawProduct: RawProduct) => {
          return transformProductData(rawProduct)
        })

      return {
        data: {
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
          products,
        },
        statusCode: 200,
      }
    } catch (error) {
      console.error('Error fetching products by IDs:', error)
      throw error
    }
  },

  getShopInfo: async (): Promise<{ data: any; statusCode: number }> => {
    try {
      const { data, errors } = await storeClient.request(SHOP_INFO_QUERY)

      if (errors) {
        handleGraphQLErrors(Array.isArray(errors) ? errors : [])
      }

      return {
        data: data.shop,
        statusCode: 200,
      }
    } catch (error) {
      console.error('Error fetching shop info:', error)
      throw error
    }
  },
}
