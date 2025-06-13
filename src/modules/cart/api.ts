import { makeStorefrontRequest } from '@/lib/shopify';
import {
  Cart,
  CartInput,
  CartLineInput,
  CartLineUpdateInput,
  CartResponse,
} from './types';
import {
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_LINES_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  APPLY_DISCOUNT_CODE_MUTATION
} from './queries';
import { handleGraphQLErrors } from '@/lib/graphql';

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

export const api = {
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
      if (error instanceof Error && error.message.includes('Could not find cart')) {
        const storage = getCartStorageMethod();
        storage.clearCartId();
        return null;
      }
      throw error;
    }
  },

  createCart: async (input: CartInput = {}): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(CREATE_CART_MUTATION, { input });
      
      handleGraphQLErrors(data.cartCreate.userErrors);
      
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

  addToCart: async (cartId: string, lines: CartLineInput[]): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(ADD_TO_CART_MUTATION, { cartId, lines });
      
      handleGraphQLErrors(data.cartLinesAdd.userErrors); 
      
      return data.cartLinesAdd;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateCartLines: async (cartId: string, lines: CartLineUpdateInput[]): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(UPDATE_CART_LINES_MUTATION, { cartId, lines });
      
      handleGraphQLErrors(data.cartLinesUpdate.userErrors);
      
      return data.cartLinesUpdate;
    } catch (error) {
      console.error('Error updating cart lines:', error);
      throw error;
    }
  },

  removeFromCart: async (cartId: string, lineIds: string[]): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(REMOVE_FROM_CART_MUTATION, { cartId, lineIds });
      
      handleGraphQLErrors(data.cartLinesRemove.userErrors);
      
      return data.cartLinesRemove;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  applyDiscountCode: async (cartId: string, discountCodes: string[]): Promise<CartResponse> => {
    try {
      const data = await makeStorefrontRequest(APPLY_DISCOUNT_CODE_MUTATION, { cartId, discountCodes });
      
      handleGraphQLErrors(data.cartDiscountCodesUpdate.userErrors);
      
      return data.cartDiscountCodesUpdate;
    } catch (error) {
      console.error('Error applying discount code:', error);
      throw error;
    }
  },
};