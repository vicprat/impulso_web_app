import type { ApiResponse } from '@/src/types'

export interface Money {
  amount: string
  currencyCode: string
}

export interface Image {
  id?: string
  url: string
  altText: string | null
  width?: number
  height?: number
}

export interface SelectedOption {
  name: string
  value: string
}

export interface Variant {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  compareAtPrice: Money | null
  sku: string | null
  selectedOptions: SelectedOption[]
}

export interface Product {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  productType: string
  vendor: string
  createdAt: string
  updatedAt: string
  priceRange: {
    minVariantPrice: Money
    maxVariantPrice: Money
  }
  images: Image[]
  variants: Variant[]
  tags?: string[]
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  artworkDetails?: {
    medium?: string
    year?: string
    serie?: string
    location?: string
    height?: string
    width?: string
    depth?: string
    artist?: string
  }
}

export interface IProductForCart {
  id: string
  title: string
  handle: string
  descriptionHtml: string
  vendor: string
  images: Image[]
  variants: Variant[]
  availableForSale: boolean
  description?: string
  createdAt?: string
  updatedAt?: string
  priceRange?: {
    minVariantPrice: Money
    maxVariantPrice: Money
  }
}
export interface Collection {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  image: Image | null
  products: Product[]
}

export interface RawProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  productType: string
  vendor: string
  createdAt: string
  updatedAt: string
  priceRange: {
    minVariantPrice: Money
    maxVariantPrice: Money
  }
  images?: {
    edges: {
      node: Image
    }[]
  }
  variants?: {
    edges: {
      node: Variant
    }[]
  }
}

export interface RawCollection {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  image: Image | null
  products?: {
    edges: {
      node: RawProduct
    }[]
  }
}

export interface ShopInfo {
  name: string
  primaryDomain: {
    host: string
    url: string
  }
  paymentSettings: {
    currencyCode: string
    acceptedCardBrands: string[]
    enabledPresentmentCurrencies: string[]
  }
}

export interface Edge<T> {
  node: T
}
export interface ProductSearchParams {
  after?: string | null
  before?: string | null
  first?: number
  last?: number
  filters?: ProductSearchFilters
  query?: string

  sortKey?:
    | 'CREATED_AT'
    | 'UPDATED_AT'
    | 'TITLE'
    | 'PRICE'
    | 'VENDOR'
    | 'PRODUCT_TYPE'
    | 'BEST_SELLING'
    | 'RELEVANCE'
  reverse?: boolean

  collections?: string[]
  productType?: string
  vendor?: string
  tag?: string
  availableForSale?: boolean
  variantOption?: string

  // Filtros de precio
  priceMin?: number
  priceMax?: number
}

export interface CollectionSearchParams {
  after?: string | null
  before?: string | null
  first?: number
  last?: number
  query?: string
  sortKey?: 'TITLE' | 'UPDATED_AT' | 'ID'
  reverse?: boolean
}

export type ShopInfoResponse = ApiResponse<ShopInfo>
export type ProductResponse = ApiResponse<Product>

export interface ShopifyFilterValue {
  id: string
  label: string
  count: number
  input: string
}

export interface ShopifyFilter {
  id: string
  label: string
  type: string
  values: ShopifyFilterValue[]
}

export type ProductsResponse = ApiResponse<{
  products: Product[]
  pageInfo: {
    hasNextPage: boolean
    endCursor: string | null
  }
}>

export type CollectionResponse = ApiResponse<Collection>
export type CollectionsResponse = ApiResponse<{
  collections: Collection[]
  pageInfo: {
    hasNextPage: boolean
    endCursor: string | null
  }
}>

export interface FilterValue {
  input: string
  label: string
  count: number
}

export interface EnrichedFilterOptions {
  artists: FilterValue[]
  productTypes: FilterValue[]
  price: { min: number; max: number }
  techniques: FilterValue[]
  formats: FilterValue[]
  locations: FilterValue[]
  years: FilterValue[]
  series: FilterValue[]
  otherTags: FilterValue[]
}

export interface PriceFilter {
  price: {
    min?: number
    max?: number
  }
}
export interface ProductSearchFilters {
  query?: string
  tags?: string[]
  vendor?: string[]
  productType?: string[]
  collections?: string[]
  available?: boolean
  price?: {
    min?: number
    max?: number
  }
}
