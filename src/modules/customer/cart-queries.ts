





// src/modules/customer/cart-queries.ts
// These are the CORRECT Shopify Storefront API GraphQL queries

// Fragment for cart cost information
export const CART_COST_FRAGMENT = `
  fragment CartCost on CartCost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
    totalTaxAmount {
      amount
      currencyCode
    }
    totalDutyAmount {
      amount
      currencyCode
    }
  }
`;

// Fragment for cart line information
export const CART_LINE_FRAGMENT = `
  fragment CartLine on CartLine {
    id
    quantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        price {
          amount
          currencyCode
        }
        product {
          id
          title
          handle
        }
      }
    }
  }
`;

// Fragment for full cart information
export const CART_FRAGMENT = `
  fragment Cart on Cart {
    id
    createdAt
    updatedAt
    totalQuantity
    cost {
      ...CartCost
    }
    lines(first: 250) {
      edges {
        node {
          ...CartLine
        }
      }
    }
    discountCodes {
      code
      applicable
    }
    estimatedCost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
      totalDutyAmount {
        amount
        currencyCode
      }
    }
  }
  ${CART_COST_FRAGMENT}
  ${CART_LINE_FRAGMENT}
`;

// CREATE CART - Storefront API
export const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...Cart
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

// GET CART - This should work if you have a cart ID
export const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...Cart
    }
  }
  ${CART_FRAGMENT}
`;

// ADD TO CART - Storefront API
export const ADD_TO_CART_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...Cart
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

// UPDATE CART LINES - Storefront API
export const UPDATE_CART_LINES_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...Cart
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

// REMOVE FROM CART - Storefront API
export const REMOVE_FROM_CART_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...Cart
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

// APPLY DISCOUNT CODE - Storefront API
export const APPLY_DISCOUNT_CODE_MUTATION = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...Cart
      }
      userErrors {
        field
        message
        code
      }
    }
  }
  ${CART_FRAGMENT}
`;

// ALTERNATIVE: Customer API queries (if you're using Customer API instead)
// Note: Customer API uses different field names and structure

export const CUSTOMER_CART_QUERY = `
  query getCustomer {
    customer {
      id
      email
      firstName
      lastName
      # Note: Some Shopify setups might have different cart field names
      # Try these alternatives if 'cart' doesn't work:
      # orders(first: 1) { edges { node { id } } }
      # defaultAddress { id }
    }
  }
`;

// If you're using a custom implementation, you might need:
export const CUSTOM_CART_QUERIES = {
  // Check what fields are actually available in your schema
  GET_CUSTOMER: `
    query getCustomer {
      customer {
        id
        email
        # Add available fields from your schema
      }
    }
  `,
  
  // Your custom cart implementation might use different names
  CREATE_CART: `
    mutation createCart($input: CustomCartInput!) {
      createCart(input: $input) {
        cart {
          id
          items {
            id
            quantity
            productId
            variantId
          }
          total
        }
        errors {
          message
        }
      }
    }
  `
};