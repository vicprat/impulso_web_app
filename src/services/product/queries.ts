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
