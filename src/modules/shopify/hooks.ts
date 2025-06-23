import {  useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from './api';
import {
  ShopInfo,
  Product,
  Collection,
  ProductSearchParams,
  CollectionSearchParams,
  ShopInfoResponse,
  ProductResponse,
  ProductsResponse,
  CollectionResponse,
  CollectionsResponse,
  EnrichedFilterOptions
} from './types';

export const SHOPIFY_KEYS = {
  all: ['shopify'] as const,
  shopInfo: () => [...SHOPIFY_KEYS.all, 'shop'] as const,
  products: () => [...SHOPIFY_KEYS.all, 'products'] as const,
  product: (handle: string) => [...SHOPIFY_KEYS.products(), handle] as const,
  collections: () => [...SHOPIFY_KEYS.all, 'collections'] as const,
  collection: (handle: string) => [...SHOPIFY_KEYS.collections(), handle] as const,
  filterOptions: () => [...SHOPIFY_KEYS.all, 'filterOptions'] as const,
};

export const useShopInfo = (
  options?: Omit<UseQueryOptions<ShopInfoResponse, Error, ShopInfo>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: SHOPIFY_KEYS.shopInfo(),
    queryFn: () => api.getShopInfo(),
    select: (response) => response.data,
    ...options,
  });
};

export const useProducts = (
  params: ProductSearchParams = {},
  options?: Omit<UseQueryOptions<ProductsResponse, Error, ProductsResponse['data']>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...SHOPIFY_KEYS.products(), params],
    queryFn: () => api.getProducts(params),
    select: (response) => response.data,
    ...options,
  });
};

export const useProductByHandle = (
  handle: string,
  options?: Omit<UseQueryOptions<ProductResponse, Error, Product>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: SHOPIFY_KEYS.product(handle),
    queryFn: () => api.getProductByHandle(handle),
    select: (response) => response.data,
    enabled: !!handle,
    ...options,
  });
};

export const useCollections = (
  params: CollectionSearchParams = {},
  options?: Omit<UseQueryOptions<CollectionsResponse, Error, CollectionsResponse['data']>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...SHOPIFY_KEYS.collections(), params],
    queryFn: () => api.getCollections(params),
    select: (response) => response.data,
    ...options,
  });
};

export const useCollectionByHandle = (
  handle: string,
  productsFirst = 12,
  options?: Omit<UseQueryOptions<CollectionResponse, Error, Collection>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...SHOPIFY_KEYS.collection(handle), { productsFirst }],
    queryFn: () => api.getCollectionByHandle(handle, productsFirst),
    select: (response) => response.data,
    enabled: !!handle,
    ...options,
  });
};

const getEnrichedFilters = async (): Promise<EnrichedFilterOptions> => {
  const response = await fetch('/api/filters');
  if (!response.ok) {
    throw new Error('La respuesta de la red no fue exitosa');
  }
  return response.json();
};

export const useFilterOptions = () => {
  return useQuery<EnrichedFilterOptions>({
    queryKey: ['enriched-filters'], 
    queryFn: getEnrichedFilters,
    staleTime: 1000 * 60 * 10, 
  });
};