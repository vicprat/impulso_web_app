import { handleGraphQLErrors } from '@/lib/graphql'
import { storeClient } from '@/lib/shopify'

import { transformCollectionData, transformProductData } from './helpers'
import {
  SHOP_INFO_QUERY,
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  HOMEPAGE_QUERY,
  PRODUCTS_BY_IDS_QUERY,
} from './queries'
import {
  type ProductSearchParams,
  type CollectionSearchParams,
  type ShopInfoResponse,
  type ProductResponse,
  type ProductsResponse,
  type CollectionResponse,
  type CollectionsResponse,
  type Edge,
  type RawProduct,
  type RawCollection,
  type Collection,
  type Product,
} from './types'
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

  getProductByHandle: async (handle: string): Promise<ProductResponse> => {
    try {
      const { data, errors } = await storeClient.request(PRODUCT_BY_HANDLE_QUERY, {
        variables: {
          handle,
        },
      })

      if (errors) {
        handleGraphQLErrors(Array.isArray(errors) ? errors : [])
      }

      if (!data.product) {
        throw new Error(`Product with handle "${handle}" not found`)
      }

      return {
        data: transformProductData(data.product as RawProduct),
        statusCode: 200,
      }
    } catch (error) {
      console.error(`Error fetching product with handle "${handle}":`, error)
      throw error
    }
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
        handleGraphQLErrors(Array.isArray(errors) ? errors : [])
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

  getProductsByIds: async (productIds: string[]): Promise<ProductsResponse> => {
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
        .filter((node: RawProduct) => node && node.id)
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

  getShopInfo: async (): Promise<ShopInfoResponse> => {
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
