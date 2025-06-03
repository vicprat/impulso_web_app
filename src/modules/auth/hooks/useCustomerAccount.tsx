'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
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
      
      console.log('🔍 fetchCustomerData called');
      console.log('📝 Query:', query.substring(0, 100) + '...');
      console.log('📝 Variables:', variables);

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

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        let errorMessage = 'Failed to fetch customer data';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Data received successfully');
      console.log('📊 Data keys:', Object.keys(data));
      
      if (data.errors) {
        console.error('❌ GraphQL Errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      return data.data;
    } catch (error) {
      console.error('❌ fetchCustomerData error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // ✅ QUERY FINAL CORREGIDO - Órdenes (sin product field)
  const getOrders = useCallback(async (first: number = 10) => {
    console.log('🛒 getOrders called with first:', first);
    
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
      console.log('✅ Orders data received:', data.customer.orders.edges.length, 'orders');
      return data.customer.orders.edges.map((edge: Edge<CustomerOrder>) => edge.node) as CustomerOrder[];
    } catch (error) {
      console.error('❌ getOrders error:', error);
      throw error;
    }
  }, [fetchCustomerData]);

  // ✅ QUERY FINAL CORREGIDO - Direcciones (sin phone field)
  const getAddresses = useCallback(async () => {
    console.log('🏠 getAddresses called');
    
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
      console.log('✅ Addresses data received:', data.customer.addresses.edges.length, 'addresses');
      return data.customer.addresses.edges.map((edge: Edge<CustomerAddress>) => edge.node) as CustomerAddress[];
    } catch (error) {
      console.error('❌ getAddresses error:', error);
      throw error;
    }
  }, [fetchCustomerData]);

  // ✅ QUERY FINAL CORREGIDO - Perfil (sin phone en defaultAddress)
  const getProfile = useCallback(async () => {
    console.log('👤 getProfile called');
    
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
      console.log('✅ Profile data received');
      return data.customer;
    } catch (error) {
      console.error('❌ getProfile error:', error);
      throw error;
    }
  }, [fetchCustomerData]);

  // ✅ MUTATION FINAL - Actualizar perfil
  const updateProfile = useCallback(async (input: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) => {
    console.log('👤 updateProfile called with:', input);
    
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
        const errorText = await response.text();
        console.error('❌ Update profile API error:', errorText);
        throw new Error(`Failed to update profile (Status: ${response.status})`);
      }

      const data = await response.json();
      
      if (data.errors) {
        console.error('❌ GraphQL errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      if (data.data.customerUpdate.userErrors.length > 0) {
        console.error('❌ User errors:', data.data.customerUpdate.userErrors);
        throw new Error(data.data.customerUpdate.userErrors[0]?.message || 'Validation error');
      }

      console.log('✅ Profile updated successfully');
      return data.data.customerUpdate.customer;
    } catch (error) {
      console.error('❌ updateProfile error:', error);
      throw error;
    }
  }, []);

  // ✅ MUTATION FINAL - Crear dirección (sin phone)
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
    console.log('🏠 createAddress called with:', addressInput);
    
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
        const errorText = await response.text();
        console.error('❌ Create address API error:', errorText);
        throw new Error(`Failed to create address (Status: ${response.status})`);
      }

      const data = await response.json();
      
      if (data.errors) {
        console.error('❌ GraphQL errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      if (data.data.customerAddressCreate.userErrors.length > 0) {
        console.error('❌ User errors:', data.data.customerAddressCreate.userErrors);
        throw new Error(data.data.customerAddressCreate.userErrors[0]?.message || 'Validation error');
      }

      console.log('✅ Address created successfully');
      return data.data.customerAddressCreate.customerAddress;
    } catch (error) {
      console.error('❌ createAddress error:', error);
      throw error;
    }
  }, []);

  // ✅ QUERY SIMPLE PARA PRUEBAS
  const getBasicInfo = useCallback(async () => {
    console.log('ℹ️ getBasicInfo called');
    
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
      console.log('✅ Basic info received');
      return data.customer;
    } catch (error) {
      console.error('❌ getBasicInfo error:', error);
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