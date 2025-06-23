
import {
  Cart,
  CartLineInput,
  CartLineUpdateInput,
} from './types';


export const api = {
 getCart: async (): Promise<Cart | null> => {
    try {
      const response = await fetch('/api/cart', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) return null; // No autenticado
        throw new Error('Failed to fetch cart');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting cart:', error);
      return null;
    }
  },


 addToCart: async (lines: CartLineInput[]): Promise<Cart> => {
    const response = await fetch('/api/cart/lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(lines),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to add to cart');
    }
    return response.json();
  },

updateCartLines: async (lines: CartLineUpdateInput[]): Promise<Cart> => {
    const response = await fetch('/api/cart/lines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(lines),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to update cart lines');
    }
    return response.json();
  },


 removeFromCart: async (lineIds: string[]): Promise<Cart> => {
    const response = await fetch('/api/cart/lines', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lineIds }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to remove from cart');
    }
    return response.json();
  },
  
 applyDiscountCode: async (cartId: string, discountCodes: string[]): Promise<Cart> => {
    const { makeStorefrontRequest } = await import('@/lib/shopify');
    const { APPLY_DISCOUNT_CODE_MUTATION } = await import('./queries');
    const { handleGraphQLErrors } = await import('@/lib/graphql');

    const data = await makeStorefrontRequest(APPLY_DISCOUNT_CODE_MUTATION, { cartId, discountCodes });
    handleGraphQLErrors(data.cartDiscountCodesUpdate.userErrors);
    return data.cartDiscountCodesUpdate.cart;
  },
};