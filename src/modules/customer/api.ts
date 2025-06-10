// src/modules/customer/api.ts - AGREGAR estas importaciones y exportaciones
import {
  GET_CUSTOMER_PROFILE_QUERY,
  GET_CUSTOMER_ADDRESSES_QUERY,
  GET_CUSTOMER_ORDERS_QUERY,
  GET_SINGLE_ORDER_QUERY,
  GET_BASIC_INFO_QUERY,
  UPDATE_CUSTOMER_MUTATION,
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
  DELETE_CUSTOMER_ADDRESS_MUTATION,
  SET_DEFAULT_ADDRESS_MUTATION,
} from './queries';

// AGREGAR estas nuevas importaciones
import {
  GET_CART_QUERY,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_LINES_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  CREATE_CART_MUTATION,
  APPLY_DISCOUNT_CODE_MUTATION,
} from './cart-queries';

const makeShopifyRequest = async (query: string, variables?: Record<string, unknown>) => {
  const response = await fetch('/api/customer/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query, variables: variables || {} }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to fetch customer data';
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

export const customerApi = {
  // Profile
  getProfile: () => makeShopifyRequest(GET_CUSTOMER_PROFILE_QUERY),
  getBasicInfo: () => makeShopifyRequest(GET_BASIC_INFO_QUERY),
  updateProfile: (input: { firstName?: string; lastName?: string }) => 
    makeShopifyRequest(UPDATE_CUSTOMER_MUTATION, { input }),

  // Addresses
  getAddresses: (first: number = 10) => 
    makeShopifyRequest(GET_CUSTOMER_ADDRESSES_QUERY, { first }),
  createAddress: (address: any) => {
    const cleanAddressInput = Object.fromEntries(
      Object.entries(address).filter(([_, value]) => value !== undefined && value !== '')
    );
    return makeShopifyRequest(CREATE_CUSTOMER_ADDRESS_MUTATION, { address: cleanAddressInput });
  },
  updateAddress: (addressId: string, address: any) => {
    const cleanAddressInput = Object.fromEntries(
      Object.entries(address).filter(([_, value]) => value !== undefined && value !== '')
    );
    return makeShopifyRequest(UPDATE_CUSTOMER_ADDRESS_MUTATION, { addressId, address: cleanAddressInput });
  },
  deleteAddress: (addressId: string) =>
    makeShopifyRequest(DELETE_CUSTOMER_ADDRESS_MUTATION, { addressId }),
  setDefaultAddress: (addressId: string) =>
    makeShopifyRequest(SET_DEFAULT_ADDRESS_MUTATION, { addressId }),

  // Orders
  getOrders: (params: { first?: number; after?: string } = {}) => {
    const { first = 10, after } = params;
    return makeShopifyRequest(GET_CUSTOMER_ORDERS_QUERY, { first, after });
  },
  getOrder: (orderId: string) =>
    makeShopifyRequest(GET_SINGLE_ORDER_QUERY, { id: orderId }),

  // AGREGAR: Cart functions
  getCart: async () => {
    try {
      const data = await makeShopifyRequest(GET_CART_QUERY);
      return data.customer?.cart || null;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  },

  createCart: async (input: any = {}) => {
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

  addToCart: async (cartId: string, lines: any[]) => {
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

  updateCartLines: async (cartId: string, lines: any[]) => {
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

  removeFromCart: async (cartId: string, lineIds: string[]) => {
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

  applyDiscountCode: async (cartId: string, discountCodes: string[]) => {
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