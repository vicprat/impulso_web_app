import { handleGraphQLErrors } from "@/lib/graphql";
import {
  Customer,
  CustomerAddress,
  CustomerAddressInput,
  CustomerUpdateInput,
  Order,
  OrdersSearchParams,
  CustomerProfileResponse,
  CustomerAddressesResponse,
  CustomerAddressResponse,
  CustomerOrdersResponse,
  CustomerUpdateResponse,
  RawOrder,
  UserError,
} from "./types";
import {
  GET_CUSTOMER_PROFILE_QUERY,
  GET_CUSTOMER_ADDRESSES_QUERY,
  GET_CUSTOMER_ORDERS_QUERY,
  UPDATE_CUSTOMER_MUTATION,
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
  DELETE_CUSTOMER_ADDRESS_MUTATION,
  SET_DEFAULT_ADDRESS_MUTATION,
} from "./queries";
import { transformOrderData } from "./helpers";
import { Edge } from "../shopify/types";

/**
 * Simple GraphQL request function (similar to what you already do in endpoints)
 */
const makeGraphQLRequest = async (
  query: string,
  variables: Record<string, unknown> = {},
  accessToken: string
) => {
  const apiUrl = `https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/${process.env.SHOPIFY_API_VERSION}/graphql`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    handleGraphQLErrors(result.errors);
  }

  return result;
};

export const customerApi = {
  /**
   * Get customer profile
   */
  getProfile: async (accessToken: string): Promise<CustomerProfileResponse> => {
    try {
      const { data } = await makeGraphQLRequest(GET_CUSTOMER_PROFILE_QUERY, {}, accessToken);
      
      const responseData = data as { customer?: Customer };
      if (!responseData.customer) {
        throw new Error('Customer data not found');
      }

      return {
        data: responseData.customer,
        statusCode: 200
      };
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      throw error;
    }
  },

  /**
   * Update customer profile
   */
  updateProfile: async (input: CustomerUpdateInput, accessToken: string): Promise<CustomerUpdateResponse> => {
    try {
      const { data } = await makeGraphQLRequest(UPDATE_CUSTOMER_MUTATION, { input }, accessToken);

      const responseData = data as { 
        customerUpdate: { 
          customer: Customer; 
          userErrors: UserError[]; 
        }; 
      };
      
      const result = responseData.customerUpdate;
      
      if (result.userErrors && result.userErrors.length > 0) {
        throw new Error(`Validation errors: ${result.userErrors.map((e: UserError) => e.message).join(', ')}`);
      }

      return {
        data: result.customer,
        statusCode: 200
      };
    } catch (error) {
      console.error("Error updating customer profile:", error);
      throw error;
    }
  },

  /**
   * Get customer addresses
   */
  getAddresses: async (accessToken: string): Promise<CustomerAddressesResponse> => {
    try {
      const { data } = await makeGraphQLRequest(GET_CUSTOMER_ADDRESSES_QUERY, {}, accessToken);
      
      const responseData = data as { customer?: { addresses: CustomerAddress[] } };
      if (!responseData.customer) {
        throw new Error('Customer data not found');
      }

      return {
        data: responseData.customer.addresses,
        statusCode: 200
      };
    } catch (error) {
      console.error("Error fetching customer addresses:", error);
      throw error;
    }
  },

  /**
   * Create customer address
   */
  createAddress: async (address: CustomerAddressInput, accessToken: string): Promise<CustomerAddressResponse> => {
    try {
      const { data } = await makeGraphQLRequest(CREATE_CUSTOMER_ADDRESS_MUTATION, { address }, accessToken);

      const responseData = data as { 
        customerAddressCreate: { 
          customerAddress: CustomerAddress; 
          userErrors: UserError[]; 
        }; 
      };
      
      const result = responseData.customerAddressCreate;
      
      if (result.userErrors && result.userErrors.length > 0) {
        throw new Error(`Validation errors: ${result.userErrors.map((e: UserError) => e.message).join(', ')}`);
      }

      return {
        data: result.customerAddress,
        statusCode: 201
      };
    } catch (error) {
      console.error("Error creating customer address:", error);
      throw error;
    }
  },

  /**
   * Update customer address
   */
  updateAddress: async (id: string, address: CustomerAddressInput, accessToken: string): Promise<CustomerAddressResponse> => {
    try {
      const { data } = await makeGraphQLRequest(UPDATE_CUSTOMER_ADDRESS_MUTATION, { id, address }, accessToken);

      const responseData = data as { 
        customerAddressUpdate: { 
          customerAddress: CustomerAddress; 
          userErrors: UserError[]; 
        }; 
      };
      
      const result = responseData.customerAddressUpdate;
      
      if (result.userErrors && result.userErrors.length > 0) {
        throw new Error(`Validation errors: ${result.userErrors.map((e: UserError) => e.message).join(', ')}`);
      }

      return {
        data: result.customerAddress,
        statusCode: 200
      };
    } catch (error) {
      console.error("Error updating customer address:", error);
      throw error;
    }
  },

  /**
   * Delete customer address
   */
  deleteAddress: async (id: string, accessToken: string): Promise<{ data: { deletedId: string }; statusCode: number }> => {
    try {
      const { data } = await makeGraphQLRequest(DELETE_CUSTOMER_ADDRESS_MUTATION, { id }, accessToken);

      const responseData = data as { 
        customerAddressDelete: { 
          deletedCustomerAddressId: string; 
          userErrors: UserError[]; 
        }; 
      };
      
      const result = responseData.customerAddressDelete;
      
      if (result.userErrors && result.userErrors.length > 0) {
        throw new Error(`Validation errors: ${result.userErrors.map((e: UserError) => e.message).join(', ')}`);
      }

      return {
        data: { deletedId: result.deletedCustomerAddressId },
        statusCode: 200
      };
    } catch (error) {
      console.error("Error deleting customer address:", error);
      throw error;
    }
  },

  /**
   * Set default customer address
   */
  setDefaultAddress: async (id: string, accessToken: string): Promise<CustomerProfileResponse> => {
    try {
      const { data } = await makeGraphQLRequest(SET_DEFAULT_ADDRESS_MUTATION, { id }, accessToken);

      const responseData = data as { 
        customerDefaultAddressUpdate: { 
          customer: Customer; 
          userErrors: UserError[]; 
        }; 
      };
      
      const result = responseData.customerDefaultAddressUpdate;
      
      if (result.userErrors && result.userErrors.length > 0) {
        throw new Error(`Validation errors: ${result.userErrors.map((e: UserError) => e.message).join(', ')}`);
      }

      return {
        data: result.customer,
        statusCode: 200
      };
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  },

  /**
   * Get customer orders
   */
  getOrders: async (params: OrdersSearchParams = {}, accessToken: string): Promise<CustomerOrdersResponse> => {
    const { first = 10, after = null } = params;
    
    try {
      const { data } = await makeGraphQLRequest(GET_CUSTOMER_ORDERS_QUERY, { first, after }, accessToken);
      
      const responseData = data as { 
        customer?: { 
          orders: { 
            edges: Array<Edge<RawOrder>>; 
            pageInfo: { hasNextPage: boolean; endCursor: string | null }; 
          }; 
        }; 
      };
      
      if (!responseData.customer) {
        throw new Error('Customer data not found');
      }

      const orders: Order[] = responseData.customer.orders.edges.map((edge: Edge<RawOrder>) => 
        transformOrderData(edge.node)
      );

      return {
        data: {
          orders,
          pageInfo: responseData.customer.orders.pageInfo,
        },
        statusCode: 200
      };
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      throw error;
    }
  },

  /**
   * Execute custom GraphQL query
   */
  executeGraphQL: async (
    query: string,
    variables: Record<string, unknown> = {},
    accessToken: string
  ): Promise<{ data: unknown; statusCode: number }> => {
    try {
      const { data } = await makeGraphQLRequest(query, variables, accessToken);

      return {
        data,
        statusCode: 200
      };
    } catch (error) {
      console.error("Error executing GraphQL query:", error);
      throw error;
    }
  },
};