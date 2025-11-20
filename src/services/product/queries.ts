import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import {
  type CreateShopifyDiscountInput,
  type UpdateShopifyDiscountInput,
} from '@/modules/shopify/discounts'

import { type DiscountFilters } from './types'

export const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    handle
    title
    descriptionHtml
    vendor
    productType
    status
    tags
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    media(first: 10) {
      nodes {
        id
        mediaContentType
        status
        ... on MediaImage {
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    variants(first: 1) {
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
        }
      }
    }
    metafields(first: 20) {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
    collections(first: 50) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`

export const GET_PRODUCTS_QUERY = `
  query getProducts(
    $query: String!, 
    $first: Int = 10, 
    $after: String,
    $sortKey: ProductSortKeys,
    $reverse: Boolean
  ) {
    products(
      first: $first, 
      after: $after, 
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...ProductFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`

export const GET_SINGLE_PRODUCT_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`

export const CREATE_PRODUCT_MUTATION = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        handle
        title
        descriptionHtml
        vendor
        productType
        status
        tags
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
              width
              height
            }
          }
        }
        variants(first: 1) {
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
            }
          }
        }
        metafields(first: 20) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const UPDATE_PRODUCT_MUTATION = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        ...ProductFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`

export const DELETE_PRODUCT_MUTATION = `
  mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`

export const PUBLISH_PRODUCT_MUTATION = `
  mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`

export const GET_PUBLICATIONS_QUERY = `
  query getPublications {
    publications(first: 20) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`

export const INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION = `
  mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
    inventorySetOnHandQuantities(input: $input) {
      inventoryAdjustmentGroup {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const INVENTORY_ADJUST_QUANTITIES_MUTATION = `
  mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      inventoryAdjustmentGroup {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const GET_INVENTORY_ITEM_QUERY = `
  query getInventoryItem($variantId: ID!) {
    productVariant(id: $variantId) {
      id
      inventoryItem {
        id
      }
    }
  }
`

export const PRODUCT_VARIANTS_BULK_UPDATE_MUTATION = `
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const PRODUCT_CREATE_MEDIA_MUTATION = `
        mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
            productCreateMedia(productId: $productId, media: $media) {
                media {
                    ... on MediaImage {
                        id
                        image {
                            url
                            altText
                        }
                    }
                }
                mediaUserErrors {
                    field
                    message
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `

export const PRODUCT_DELETE_IMAGES_MUTATION = `
  mutation productDeleteImages($productId: ID!, $imageIds: [ID!]!) {
    productDeleteImages(productId: $productId, imageIds: $imageIds) {
      deletedImageIds
      userErrors {
        field
        message
      }
    }
  }
`

export const PRODUCT_DELETE_MEDIA_MUTATION = `
  mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
    productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
      deletedMediaIds
      deletedProductImageIds
      mediaUserErrors {
        field
        message
      }
      product {
        id
        title
        media(first: 10) {
          nodes {
            id
            alt
            mediaContentType
            status
          }
        }
      }
    }
  }
`

// Mutaciones para descuentos y cupones
export const CREATE_DISCOUNT_MUTATION = `
  mutation createDiscount($input: DiscountCodeInput!) {
    discountCodeCreate(input: $input) {
      discountCode {
        id
        code
        startsAt
        endsAt
        customerGets {
          value {
            ... on DiscountPercentage {
              percentage
            }
            ... on DiscountAmount {
              amount {
                amount
                currencyCode
              }
            }
          }
          items {
            ... on All {
              all
            }
            ... on Products {
              products {
                id
                title
              }
            }
            ... on Collections {
              collections {
                id
                title
              }
            }
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`

export const UPDATE_DISCOUNT_MUTATION = `
  mutation updateDiscount($id: ID!, $input: DiscountCodeInput!) {
    discountCodeUpdate(id: $id, input: $input) {
      discountCode {
        id
        code
        startsAt
        endsAt
        customerGets {
          value {
            ... on DiscountPercentage {
              percentage
            }
            ... on DiscountAmount {
              amount {
                amount
                currencyCode
              }
            }
          }
          items {
            ... on All {
              all
            }
            ... on Products {
              products {
                id
                title
              }
            }
            ... on Collections {
              collections {
                id
                title
              }
            }
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`

export const DELETE_DISCOUNT_MUTATION = `
  mutation deleteDiscount($id: ID!) {
    discountCodeDelete(input: { id: $id }) {
      deletedDiscountCodeId
      userErrors {
        field
        message
        code
      }
    }
  }
`

export const GET_DISCOUNTS_QUERY = `
  query getDiscounts($first: Int = 50, $after: String) {
    discountCodes(first: $first, after: $after) {
      edges {
        node {
          id
          code
          startsAt
          endsAt
          customerGets {
            value {
              ... on DiscountPercentage {
                percentage
              }
              ... on DiscountAmount {
                amount {
                  amount
                  currencyCode
                }
              }
            }
            items {
              ... on All {
                all
              }
              ... on Products {
                products {
                  id
                  title
                }
              }
              ... on Collections {
                collections {
                id
                title
              }
            }
          }
        }
        createdAt
        updatedAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`

// Queries para cupones de descuento usando API routes
export const useGetDiscounts = (filters?: DiscountFilters) => {
  return useQuery({
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters?.type) params.append('type', filters.type)
      if (filters?.appliesTo) params.append('appliesTo', filters.appliesTo)
      if (filters?.search) params.append('search', filters.search)

      const response = await fetch(`/api/shopify/discounts?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Error al obtener cupones')
      }
      return response.json()
    },
    queryKey: ['discounts', filters],
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useDiscount = (
  id: string,
  options?: Omit<UseQueryOptions<any, Error, any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const encodedId = encodeURIComponent(id)
      const response = await fetch(`/api/shopify/discounts/${encodedId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    },
    queryKey: ['discounts', 'detail', id],
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  })
}

export const useCreateDiscount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (discount: CreateShopifyDiscountInput) => {
      const response = await fetch('/api/shopify/discounts', {
        body: JSON.stringify(discount),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear cupón')
      }

      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['discounts'] })
      void queryClient.invalidateQueries({ queryKey: ['managementProducts'] })
    },
  })
}

export const useUpdateDiscount = (options?: {
  onError?: (error: Error) => void
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (discount: UpdateShopifyDiscountInput) => {
      const encodedId = encodeURIComponent(discount.id)
      const response = await fetch(`/api/shopify/discounts/${encodedId}`, {
        body: JSON.stringify(discount),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar cupón')
      }

      return response.json()
    },
    onError: options?.onError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
      queryClient.invalidateQueries({ queryKey: ['managementProducts'] })
      options?.onSuccess?.()
    },
  })
}

export const useDeleteDiscount = (options?: {
  onError?: (error: Error) => void
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (discountId: string) => {
      const encodedId = encodeURIComponent(discountId)
      const response = await fetch(`/api/shopify/discounts/${encodedId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar cupón')
      }

      return response.json()
    },
    onError: options?.onError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
      queryClient.invalidateQueries({ queryKey: ['managementProducts'] })
      options?.onSuccess?.()
    },
  })
}
