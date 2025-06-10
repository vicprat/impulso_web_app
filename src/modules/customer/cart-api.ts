// src/modules/customer/cart-api.ts

import { ADD_TO_CART_MUTATION, APPLY_DISCOUNT_CODE_MUTATION, CREATE_CART_MUTATION, GET_CART_QUERY, REMOVE_FROM_CART_MUTATION, UPDATE_CART_LINES_MUTATION } from './cart-queries';
import {
  Cart,
  CartInput,
  CartLineInput,
  CartLineUpdateInput,
  CartResponse,
} from './cart-types';

const makeShopifyRequest = async (query: string, variables?: Record<string, unknown>) => {
  const response = await fetch('/api/customer/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query, variables: variables || {} }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to fetch cart data';
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.details || errorMessage;
    } catch {
      throw new Error(`${errorMessage}: ${errorText}`);
    }
    throw new Error(`${errorMessage} (Status: ${response.status})`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'GraphQL error');
  }

  return data.data;
};

export const cartApi = {
  // Get customer cart
  getCart: async (): Promise<Cart | null> => {
    try {
      const data = await makeShopifyRequest(GET_CART_QUERY);
      return data.customer?.cart || null;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  },

  // Create a new cart
  createCart: async (input: CartInput = {}): Promise<CartResponse> => {
    try {
      const data = await makeShopifyRequest(CREATE_CART_MUTATION, { input });
      
      if (data.cartCreate.userErrors?.length > 0) {
        throw new Error(data.cartCreate.userErrors[0].message);
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
      const data = await makeShopifyRequest(ADD_TO_CART_MUTATION, { cartId, lines });
      
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
      const data = await makeShopifyRequest(UPDATE_CART_LINES_MUTATION, { cartId, lines });
      
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
      const data = await makeShopifyRequest(REMOVE_FROM_CART_MUTATION, { cartId, lineIds });
      
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
      const data = await makeShopifyRequest(APPLY_DISCOUNT_CODE_MUTATION, { cartId, discountCodes });
      
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

// Checkout API - Using Storefront API for checkout creation
export const checkoutApi = {
  // Create checkout from cart
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

  // Update checkout shipping address
  updateShippingAddress: async (checkoutId: string, shippingAddress: any) => {
    try {
      const response = await fetch('/api/checkout/shipping-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ checkoutId, shippingAddress }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update shipping address: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating shipping address:', error);
      throw error;
    }
  },

  // Get available shipping rates
  getShippingRates: async (checkoutId: string) => {
    try {
      const response = await fetch(`/api/checkout/shipping-rates?checkoutId=${checkoutId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get shipping rates: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      throw error;
    }
  },

  // Update checkout shipping line
  updateShippingLine: async (checkoutId: string, shippingRateHandle: string) => {
    try {
      const response = await fetch('/api/checkout/shipping-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ checkoutId, shippingRateHandle }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update shipping line: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating shipping line:', error);
      throw error;
    }
  },
};