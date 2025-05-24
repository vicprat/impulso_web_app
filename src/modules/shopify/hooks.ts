import {  useQuery, UseQueryOptions } from '@tanstack/react-query';
import { shopifyApi } from './api';
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
  CollectionsResponse
} from './types';

export const SHOPIFY_KEYS = {
  all: ['shopify'] as const,
  shopInfo: () => [...SHOPIFY_KEYS.all, 'shop'] as const,
  products: () => [...SHOPIFY_KEYS.all, 'products'] as const,
  product: (handle: string) => [...SHOPIFY_KEYS.products(), handle] as const,
  collections: () => [...SHOPIFY_KEYS.all, 'collections'] as const,
  collection: (handle: string) => [...SHOPIFY_KEYS.collections(), handle] as const,
};

// Hook para obtener información de la tienda
export const useShopInfo = (
  options?: Omit<UseQueryOptions<ShopInfoResponse, Error, ShopInfo>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: SHOPIFY_KEYS.shopInfo(),
    queryFn: () => shopifyApi.getShopInfo(),
    select: (response) => response.data,
    ...options,
  });
};

// Hook para obtener productos con paginación y filtros
export const useProducts = (
  params: ProductSearchParams = {},
  options?: Omit<UseQueryOptions<ProductsResponse, Error, ProductsResponse['data']>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...SHOPIFY_KEYS.products(), params],
    queryFn: () => shopifyApi.getProducts(params),
    select: (response) => response.data,
    ...options,
  });
};

// Hook para obtener un producto por su handle
export const useProductByHandle = (
  handle: string,
  options?: Omit<UseQueryOptions<ProductResponse, Error, Product>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: SHOPIFY_KEYS.product(handle),
    queryFn: () => shopifyApi.getProductByHandle(handle),
    select: (response) => response.data,
    enabled: !!handle,
    ...options,
  });
};

// Hook para obtener colecciones con paginación y filtros
export const useCollections = (
  params: CollectionSearchParams = {},
  options?: Omit<UseQueryOptions<CollectionsResponse, Error, CollectionsResponse['data']>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...SHOPIFY_KEYS.collections(), params],
    queryFn: () => shopifyApi.getCollections(params),
    select: (response) => response.data,
    ...options,
  });
};

// Hook para obtener una colección por su handle
export const useCollectionByHandle = (
  handle: string,
  productsFirst = 12,
  options?: Omit<UseQueryOptions<CollectionResponse, Error, Collection>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...SHOPIFY_KEYS.collection(handle), { productsFirst }],
    queryFn: () => shopifyApi.getCollectionByHandle(handle, productsFirst),
    select: (response) => response.data,
    enabled: !!handle,
    ...options,
  });
};