'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { Edge } from '@/modules/shopify/types';
import { CustomerAddress, CustomerOrder } from '../types';

export function useCustomerAccount() {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomerData = useCallback(async (query: string, variables?: Record<string, unknown>) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/customer/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          query,
          variables: variables || {}
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        let errorMessage = 'Failed to fetch customer data';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch  {
          throw new Error(`${errorMessage}: ${errorText}`);
        }
        
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      return data.data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const getOrders = useCallback(async (first: number = 10) => {
    const query = `
      query GetOrders($first: Int!) {
        customer {
          orders(first: $first) {
            edges {
              node {
                id
                name
                processedAt
                totalPrice {
                  amount
                  currencyCode
                }
                fulfillmentStatus
                financialStatus
                lineItems(first: 5) {
                  edges {
                    node {
                      id
                      title
                      quantity
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
                shippingAddress {
                  firstName
                  lastName
                  address1
                  address2
                  city
                  province
                  zip
                  country
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    try {
      const data = await fetchCustomerData(query, { first });
      return data.customer.orders.edges.map((edge: Edge<CustomerOrder>) => edge.node) as CustomerOrder[];
    } catch (error) {
      throw error;
    }
  }, [fetchCustomerData]);

  const getAddresses = useCallback(async () => {
    const query = `
      query GetAddresses {
        customer {
          addresses(first: 10) {
            edges {
              node {
                id
                firstName
                lastName
                address1
                address2
                city
                province
                zip
                country
              }
            }
          }
        }
      }
    `;

    try {
      const data = await fetchCustomerData(query);
      return data.customer.addresses.edges.map((edge: Edge<CustomerAddress>) => edge.node) as CustomerAddress[];
    } catch (error) {
      throw error;
    }
  }, [fetchCustomerData]);

  const getProfile = useCallback(async () => {
    const query = `
      query GetProfile {
        customer {
          id
          firstName
          lastName
          emailAddress {
            emailAddress
          }
          phoneNumber {
            phoneNumber
          }
          defaultAddress {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            zip
            country
          }
        }
      }
    `;

    try {
      const data = await fetchCustomerData(query);
      return data.customer;
    } catch (error) {
      throw error;
    }
  }, [fetchCustomerData]);

  const updateProfile = useCallback(async (input: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) => {
    const mutation = `
      mutation UpdateCustomer($input: CustomerUpdateInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            firstName
            lastName
            emailAddress {
              emailAddress
            }
            phoneNumber {
              phoneNumber
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const response = await fetch('/api/customer/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          query: mutation,
          variables: { input }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile (Status: ${response.status})`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      if (data.data.customerUpdate.userErrors.length > 0) {
        throw new Error(data.data.customerUpdate.userErrors[0]?.message || 'Validation error');
      }

      return data.data.customerUpdate.customer;
    } catch (error) {
      throw error;
    }
  }, []);

  const createAddress = useCallback(async (addressInput: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  }) => {
    const mutation = `
      mutation CreateAddress($address: CustomerAddressInput!) {
        customerAddressCreate(address: $address) {
          customerAddress {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            zip
            country
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const response = await fetch('/api/customer/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          query: mutation,
          variables: { address: addressInput }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create address (Status: ${response.status})`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      if (data.data.customerAddressCreate.userErrors.length > 0) {
        throw new Error(data.data.customerAddressCreate.userErrors[0]?.message || 'Validation error');
      }

      return data.data.customerAddressCreate.customerAddress;
    } catch (error) {
      throw error;
    }
  }, []);

  const getBasicInfo = useCallback(async () => {
    const query = `
      query GetBasicInfo {
        customer {
          id
          emailAddress {
            emailAddress
          }
        }
      }
    `;

    try {
      const data = await fetchCustomerData(query);
      return data.customer;
    } catch (error) {
      throw error;
    }
  }, [fetchCustomerData]);

  return {
    isLoading,
    getOrders,
    getAddresses,
    getProfile,
    updateProfile,
    createAddress,
    getBasicInfo,
    fetchCustomerData,
  };
}