import { type ArtworkDetails, type Product } from '@/models/Product'

export interface GetProductsParams {
  limit?: number
  cursor?: string
  search?: string
  vendor?: string
  page?: number
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateProductPayload {
  title: string
  description: string
  productType: string
  vendor?: string
  status: 'ACTIVE' | 'DRAFT'
  tags: string[]
  price: string
  inventoryQuantity?: number
  details?: Partial<ArtworkDetails>
  images?: {
    mediaContentType: 'IMAGE'
    originalSource: string
  }[]
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string
  imagesToDelete?: string[] // IDs de las imágenes a eliminar
}

export interface PaginatedProductsResponse {
  products: Product[]
  pageInfo: {
    hasNextPage: boolean
    endCursor?: string | null
  }
}

export interface ShopifyUserError {
  field: string
  message: string
}

export interface ImageNode {
  id?: string
  url: string
  altText: string | null
  width?: number
  height?: number
}

export interface VariantNode {
  id: string
  title: string
  availableForSale: boolean
  price: string
  sku: string | null
  inventoryQuantity: number | null
  inventoryPolicy: 'DENY' | 'CONTINUE'
  inventoryItem: {
    tracked: boolean
  }
}

export interface ShopifyMetafieldNode {
  namespace: string
  key: string
  value: string
}

export interface ShopifyProductData {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  vendor: string
  productType: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  tags: string[]
  images: { edges: { node: ImageNode }[] }
  media: {
    nodes: {
      id: string
      mediaContentType: string
      status: string
      image?: {
        id: string
        url: string
        altText: string | null
        width?: number
        height?: number
      }
    }[]
  }
  variants: { edges: { node: VariantNode }[] }
  metafields: { edges: { node: ShopifyMetafieldNode }[] }
}

export type ProductMutationResponse<T extends string> = Record<
  T,
  {
    product: ShopifyProductData
    userErrors: ShopifyUserError[]
  }
>

export interface DeleteMutationResponse {
  productDelete: {
    deletedProductId: string | null
    userErrors: ShopifyUserError[]
  }
}

export interface GetProductsApiResponse {
  products: {
    edges: {
      node: ShopifyProductData
      cursor: string
    }[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

export interface GetPublicationsApiResponse {
  publications: {
    edges: {
      node: {
        id: string
        name: string
      }
    }[]
  }
}

export interface InventorySetOnHandQuantitiesResponse {
  inventorySetOnHandQuantities: {
    inventoryAdjustmentGroup: { id: string } | null
    userErrors: ShopifyUserError[]
  }
}

export interface GetInventoryItemResponse {
  productVariant: {
    id: string
    inventoryItem: {
      id: string
    }
  } | null
}

export interface ProductCreateMediaResponse {
  productCreateMedia: {
    media: {
      id: string
      image: {
        url: string
        altText: string | null
      }
    }[]
    mediaUserErrors: ShopifyUserError[]
    userErrors: ShopifyUserError[]
  }
}

// Tipos para descuentos y cupones
export interface Discount {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  usedCount: number
  startsAt: string
  endsAt?: string
  isActive: boolean
  appliesTo: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'SPECIFIC_COLLECTIONS'
  productIds?: string[]
  collectionIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateDiscountInput {
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  startsAt: string
  endsAt?: string
  appliesTo: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'SPECIFIC_COLLECTIONS'
  productIds?: string[]
  collectionIds?: string[]
}

export interface UpdateDiscountInput {
  id: string
  isActive?: boolean
  endsAt?: string
  value?: number
  type?: 'PERCENTAGE' | 'FIXED_AMOUNT'
}

export interface DiscountFilters {
  isActive?: boolean
  type?: 'PERCENTAGE' | 'FIXED_AMOUNT'
  appliesTo?: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'SPECIFIC_COLLECTIONS'
  search?: string
}

export interface ProductDiscount {
  id: string
  productId: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  startsAt: string
  endsAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductDiscountInput {
  productId: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  startsAt: string
  endsAt?: string
}

export interface UpdateProductDiscountInput extends Partial<CreateProductDiscountInput> {
  id: string
  isActive?: boolean
}
