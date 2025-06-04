import {
  CustomerAddressInput,
  CustomerUpdateInput,
  OrdersSearchParams,
  CustomerProfileResponse,
  CustomerAddressesResponse,
  CustomerAddressResponse,
  CustomerOrdersResponse,
  CustomerUpdateResponse,
} from "./types";


export const customerApi = {
  getProfile: async (): Promise<CustomerProfileResponse> => {
    try {
      const response = await fetch('/api/customer/profile', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        statusCode: response.status
      };
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      throw error;
    }
  },

  /**
   * Update customer profile
   */
  updateProfile: async (input: CustomerUpdateInput): Promise<CustomerUpdateResponse> => {
    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        statusCode: response.status
      };
    } catch (error) {
      console.error("Error updating customer profile:", error);
      throw error;
    }
  },

  /**
   * Get customer addresses
   */
  getAddresses: async (): Promise<CustomerAddressesResponse> => {
    try {
      const response = await fetch('/api/customer/addresses', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.addresses,
        statusCode: response.status
      };
    } catch (error) {
      console.error("Error fetching customer addresses:", error);
      throw error;
    }
  },

  /**
   * Create customer address
   */
  createAddress: async (address: CustomerAddressInput): Promise<CustomerAddressResponse> => {
    try {
      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(address),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.address,
        statusCode: response.status
      };
    } catch (error) {
      console.error("Error creating customer address:", error);
      throw error;
    }
  },

  /**
   * Update customer address
   */
  updateAddress: async (id: string, address: CustomerAddressInput): Promise<CustomerAddressResponse> => {
    try {
      const response = await fetch('/api/customer/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id, address }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.address,
        statusCode: response.status
      };
    } catch (error) {
      console.error("Error updating customer address:", error);
      throw error;
    }
  },

  /**
   * Delete customer address
   */
  deleteAddress: async (id: string): Promise<{ data: { deletedId: string }; statusCode: number }> => {
    try {
      const response = await fetch('/api/customer/addresses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: { deletedId: data.deletedId },
        statusCode: response.status
      };
    } catch (error) {
      console.error("Error deleting customer address:", error);
      throw error;
    }
  },

  /**
   * Set default customer address
   */
  setDefaultAddress: async (id: string): Promise<CustomerProfileResponse> => {
    try {
      const response = await fetch('/api/customer/addresses/default', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.customer,
        statusCode: response.status
      };
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  },

  /**
   * Get customer orders
   */
  getOrders: async (params: OrdersSearchParams = {}): Promise<CustomerOrdersResponse> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.first) searchParams.append('first', params.first.toString());
      if (params.after) searchParams.append('after', params.after);

      const response = await fetch(`/api/customer/orders?${searchParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: {
          orders: data.orders,
          pageInfo: data.pageInfo,
        },
        statusCode: response.status
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
    variables: Record<string, unknown> = {}
  ): Promise<{ data: unknown; statusCode: number }> => {
    try {
      const response = await fetch('/api/customer/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        statusCode: response.status
      };
    } catch (error) {
      console.error("Error executing GraphQL query:", error);
      throw error;
    }
  },
};