import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { api } from './api'
import { shopifyService } from './service'

import type { ShopifyProductDataResponse } from './api'
import type {
  Collection,
  CollectionResponse,
  CollectionSearchParams,
  CollectionsResponse,
  EnrichedFilterOptions,
  ProductSearchParams,
  ProductsResponse,
  ShopInfo,
  ShopInfoResponse,
} from './types'

// Importar el tipo desde el API

export const SHOPIFY_KEYS = {
  all: ['shopify'] as const,
  collection: (handle: string) => [...SHOPIFY_KEYS.collections(), handle] as const,
  collections: () => [...SHOPIFY_KEYS.all, 'collections'] as const,
  filterOptions: () => [...SHOPIFY_KEYS.all, 'filterOptions'] as const,
  product: (handle: string) => [...SHOPIFY_KEYS.products(), handle] as const,
  products: () => [...SHOPIFY_KEYS.all, 'products'] as const,
  shopInfo: () => [...SHOPIFY_KEYS.all, 'shop'] as const,
}

export const useShopInfo = (
  options?: Omit<UseQueryOptions<ShopInfoResponse, Error, ShopInfo>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryFn: () => api.getShopInfo(),
    queryKey: SHOPIFY_KEYS.shopInfo(),
    select: (response) => response.data,
    ...options,
  })
}

export const useProducts = (
  params: ProductSearchParams = {},
  options?: Omit<
    UseQueryOptions<ProductsResponse, Error, ProductsResponse['data']>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryFn: () => shopifyService.getPublicProducts(params),
    queryKey: [...SHOPIFY_KEYS.products(), params],
    select: (response) => response.data,
    ...options,
  })
}

export const useProductsByIds = (
  productIds: string[] = [],
  options?: Omit<
    UseQueryOptions<ProductsResponse, Error, ProductsResponse['data']>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    enabled: productIds.length > 0,
    queryFn: () => api.getProductsByIds(productIds),
    queryKey: [...SHOPIFY_KEYS.products(), 'byIds', productIds],
    select: (response) => response.data,
    ...options,
  })
}

export const useProductByHandle = (
  handle: string,
  options?: Omit<UseQueryOptions<ShopifyProductDataResponse, Error, any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    enabled: !!handle,
    queryFn: () => api.getProductByHandle(handle),
    queryKey: SHOPIFY_KEYS.product(handle),
    select: (response) => response.data,
    ...options,
  })
}

export const useCollections = (
  params: CollectionSearchParams = {},
  options?: Omit<
    UseQueryOptions<CollectionsResponse, Error, CollectionsResponse['data']>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryFn: () => api.getCollections(params),
    queryKey: [...SHOPIFY_KEYS.collections(), params],
    select: (response) => response.data,
    ...options,
  })
}

export const useCollectionByHandle = (
  handle: string,
  productsFirst = 12,
  options?: Omit<UseQueryOptions<CollectionResponse, Error, Collection>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    enabled: !!handle,
    queryFn: () => api.getCollectionByHandle(handle, productsFirst),
    queryKey: [...SHOPIFY_KEYS.collection(handle), { productsFirst }],
    select: (response) => response.data,
    ...options,
  })
}

const getEnrichedFilters = async (): Promise<EnrichedFilterOptions> => {
  const response = await fetch('/api/filters')
  if (!response.ok) {
    throw new Error('La respuesta de la red no fue exitosa')
  }
  return response.json()
}

export const useFilterOptions = () => {
  return useQuery<EnrichedFilterOptions>({
    queryFn: getEnrichedFilters,
    queryKey: ['enriched-filters'],
    staleTime: 1000 * 60 * 10,
  })
}

export const useStoreProducts = (
  params: {
    limit?: number
    cursor?: string
    search?: string
    vendor?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    artworkType?: string
    technique?: string
    location?: string
  } = {},
  options?: Omit<UseQueryOptions<any, Error, any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryFn: async () => {
      const searchParams = new URLSearchParams()

      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.cursor) searchParams.append('cursor', params.cursor)
      if (params.search) searchParams.append('search', params.search)
      if (params.vendor) searchParams.append('vendor', params.vendor)
      if (params.sortBy) searchParams.append('sortBy', params.sortBy)
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)
      if (params.artworkType) searchParams.append('artworkType', params.artworkType)
      if (params.technique) searchParams.append('technique', params.technique)
      if (params.location) searchParams.append('location', params.location)

      const response = await fetch(`/api/store/products?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch store products')
      }

      return response.json()
    },
    queryKey: ['store-products', params],
    select: (response) => response.data,
    ...options,
  })
}
