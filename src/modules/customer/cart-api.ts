// src/modules/customer/cart-api.ts
import { makeStorefrontRequest } from '@/lib/shopify';
import {
  Cart,
  CartInput,
  CartLineInput,
  CartLineUpdateInput,
  CartResponse,
} from './cart-types';

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}


// CART QUERIES - Para usar con Storefront API
const CART_FRAGMENT = `
  fragment Cart on Cart {
    id
    createdAt
    updatedAt
    totalQuantity
    cost {
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
    lines(first: 250) {
      edges {
        node {
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
      }
    }
    discountCodes {
      code
      applicable
    }
  }
`;

const CREATE_CART_MUTATION = `
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

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...Cart
    }
  }
  ${CART_FRAGMENT}
`;

const ADD_TO_CART_MUTATION = `
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

const UPDATE_CART_LINES_MUTATION = `
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

const REMOVE_FROM_CART_MUTATION = `
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

const APPLY_DISCOUNT_CODE_MUTATION = `
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

// Helper para localStorage cart ID
const getCartStorageMethod = () => {
  if (typeof window !== 'undefined') {
    return {
      getCartId: () => localStorage.getItem('shopify_cart_id'),
      setCartId: (id: string) => localStorage.setItem('shopify_cart_id', id),
      clearCartId: () => localStorage.removeItem('shopify_cart_id')
    };
  }
  
  return {
    getCartId: () => null,
    setCartId: () => {},
    clearCartId: () => {}
  };
};

// CART API - Reutilizando tu infraestructura existente
export const cartApi = {
  // Test connectivity usando tu cliente existente
  testConnection: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const testQuery = `query TestStorefront { shop { name } }`;
      await makeStorefrontRequest(testQuery);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get cart by ID
  getCart: async (): Promise<Cart | null> => {
    try {
      const storage = getCartStorageMethod();
      const cartId = storage.getCartId();
      
      if (!cartId) {
        return null;
      }
      
      const data = await makeStorefrontRequest(GET_CART_QUERY, { cartId });
      return data.cart;
    } catch (error) {
      console.error('Error getting cart:', error);
      // Si el cart no existe, limpiar localStorage
      if (error instanceof Error && error.message.includes('Could not find cart')) {
        const storage = getCartStorageMethod();
        storage.clearCartId();
        return null;
      }
      throw error;
    }
  },

  // Create new cart
  createCart: async (input: CartInput = {}): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(CREATE_CART_MUTATION, { input });
      
      if (data.cartCreate.userErrors?.length > 0) {
        throw new Error(data.cartCreate.userErrors[0].message);
      }
      
      // Store cart ID
      if (data.cartCreate.cart?.id) {
        const storage = getCartStorageMethod();
        storage.setCartId(data.cartCreate.cart.id);
      }
      
      return data.cartCreate;
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  },

  // Add items to cart
  addToCart: async (cartId: string, lines: CartLineInput[]): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(ADD_TO_CART_MUTATION, { cartId, lines });
      
      if (data.cartLinesAdd.userErrors?.length > 0) {
        throw new Error(data.cartLinesAdd.userErrors[0].message);
      }
      
      return data.cartLinesAdd;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart line quantities
  updateCartLines: async (cartId: string, lines: CartLineUpdateInput[]): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(UPDATE_CART_LINES_MUTATION, { cartId, lines });
      
      if (data.cartLinesUpdate.userErrors?.length > 0) {
        throw new Error(data.cartLinesUpdate.userErrors[0].message);
      }
      
      return data.cartLinesUpdate;
    } catch (error) {
      console.error('Error updating cart lines:', error);
      throw error;
    }
  },

  // Remove items from cart
  removeFromCart: async (cartId: string, lineIds: string[]): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(REMOVE_FROM_CART_MUTATION, { cartId, lineIds });
      
      if (data.cartLinesRemove.userErrors?.length > 0) {
        throw new Error(data.cartLinesRemove.userErrors[0].message);
      }
      
      return data.cartLinesRemove;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Apply discount code
  applyDiscountCode: async (cartId: string, discountCodes: string[]): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(APPLY_DISCOUNT_CODE_MUTATION, { cartId, discountCodes });
      
      if (data.cartDiscountCodesUpdate.userErrors?.length > 0) {
        throw new Error(data.cartDiscountCodesUpdate.userErrors[0].message);
      }
      
      return data.cartDiscountCodesUpdate;
    } catch (error) {
      console.error('Error applying discount code:', error);
      throw error;
    }
  },
};

// Mantener el customerApi para usar tu endpoint actual
export const customerApi = {
  getCustomer: async () => {
    try {
      const response = await fetch('/api/customer/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query GetCustomer {
              customer {
                id
                firstName
                lastName
                emailAddress {
                  emailAddress
                }
              }
            }
          `
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      return data.data.customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }
};

// Checkout API usando tu infraestructura actual
export const checkoutApi = {
  createCheckout: async (cartId: string) => {
    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cartId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create checkout: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  },

  // ... resto de métodos de checkout
};