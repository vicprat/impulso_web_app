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
    // Filtrar campos undefined
    const cleanAddressInput = Object.fromEntries(
      Object.entries(address).filter(([_, value]) => value !== undefined && value !== '')
    );
    return makeShopifyRequest(CREATE_CUSTOMER_ADDRESS_MUTATION, { address: cleanAddressInput });
  },
  updateAddress: (addressId: string, address: any) => {
    // Filtrar campos undefined
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
};