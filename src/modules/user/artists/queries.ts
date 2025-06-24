export const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    handle
    descriptionHtml
    vendor
    status
    productType
    tags
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
        }
      }
    }
    variants(first: 10) {
      edges {
        node {
          id
          price
          sku
          title
        }
      }
    }
  }
`;

export const GET_ARTIST_PRODUCTS_QUERY = `
  query getArtistProducts(
    $vendor: String!, 
    $first: Int = 10, 
    $after: String
  ) {
    products(
      first: $first, 
      after: $after, 
      query: $vendor
    ) {
      edges {
        node {
          ...ProductFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const CREATE_PRODUCT_MUTATION = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
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
`;

export const ADD_PRODUCT_MEDIA_MUTATION = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        ... on MediaImage {
          id
        }
      }
      mediaUserErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_VARIANT_PRICE_MUTATION = `
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product {
        id
      }
      productVariants {
        id
        price
      }
      userErrors {
        field
        message
      }
    }
  }
`;

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
`;

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
`;

export const GET_SINGLE_PRODUCT_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`;

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
`;

export const PUBLISH_PRODUCT_MUTATION = `
  mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors {
        field
        message
      }
    }
  }
`;