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

  const getOrders = useCallback(async (first: number = 10, after?: string) => {
    const query = `
      query GetOrders($first: Int!, $after: String) {
        customer {
          orders(first: $first, after: $after) {
            edges {
              cursor
              node {
                id
                name
                processedAt
                createdAt
                updatedAt
                totalPrice {
                  amount
                  currencyCode
                }
                fulfillmentStatus
                financialStatus
                currencyCode
                email
                cancelledAt
                cancelReason
                confirmationNumber
                edited
                requiresShipping
                statusPageUrl
                lineItems(first: 10) {
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
                  id
                  firstName
                  lastName
                  address1
                  address2
                  city
                  zip
                  country
                }
                billingAddress {
                  id
                  firstName
                  lastName
                  address1
                  address2
                  city
                  zip
                  country
                }
                subtotal {
                  amount
                  currencyCode
                }
                totalRefunded {
                  amount
                  currencyCode
                }
                totalShipping {
                  amount
                  currencyCode
                }
                totalTax {
                  amount
                  currencyCode
                }
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
      }
    `;

    try {
      const data = await fetchCustomerData(query, { first, after });
      return {
        orders: data.customer.orders.edges.map((edge: Edge<CustomerOrder>) => edge.node) as CustomerOrder[],
        pageInfo: data.customer.orders.pageInfo
      };
    } catch (error) {
      throw error;
    }
  }, [fetchCustomerData]);

  const getOrder = useCallback(async (orderId: string) => {
    const query = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          name
          processedAt
          createdAt
          updatedAt
          totalPrice {
            amount
            currencyCode
          }
          fulfillmentStatus
          financialStatus
          currencyCode
          email
          cancelledAt
          cancelReason
          confirmationNumber
          edited
          requiresShipping
          statusPageUrl
          lineItems(first: 50) {
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
            id
            firstName
            lastName
            address1
            address2
            city
            zip
            country
          }
          billingAddress {
            id
            firstName
            lastName
            address1
            address2
            city
            zip
            country
          }
          subtotal {
            amount
            currencyCode
          }
          totalRefunded {
            amount
            currencyCode
          }
          totalShipping {
            amount
            currencyCode
          }
          totalTax {
            amount
            currencyCode
          }
          fulfillments {
            edges {
              node {
                id
                status
                trackingCompany
                trackingNumbers
                updatedAt
              }
            }
          }
        }
      }
    `;

    try {
      const data = await fetchCustomerData(query, { id: orderId });
      return data.order;
    } catch (error) {
      throw error;
    }
  }, [fetchCustomerData]);

  const getAddresses = useCallback(async (first: number = 10) => {
    const query = `
      query GetAddresses($first: Int!) {
        customer {
          addresses(first: $first) {
            edges {
              node {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                zip
                country
                province
                phoneNumber
                territoryCode
                zoneCode
                formattedArea
              }
            }
          }
        }
      }
    `;

    try {
      const data = await fetchCustomerData(query, { first });
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
          displayName
          creationDate
          emailAddress {
            emailAddress
          }
          phoneNumber {
            phoneNumber
          }
          imageUrl
          tags
          defaultAddress {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            zip
            country
            phoneNumber
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
  }) => {
    const mutation = `
      mutation UpdateCustomer($input: CustomerUpdateInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            firstName
            lastName
            displayName
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
            code
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
        const error = data.data.customerUpdate.userErrors[0];
        throw new Error(`${error.message} (Code: ${error.code || 'UNKNOWN'})`);
      }

      return data.data.customerUpdate.customer;
    } catch (error) {
      throw error;
    }
  }, []);

  const createAddress = useCallback(async (addressInput: {
    firstName?: string;
    lastName?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    zip?: string;
    territoryCode?: string;
    zoneCode?: string;
    phoneNumber?: string;
  }) => {
    const mutation = `
      mutation CreateAddress($address: CustomerAddressInput!) {
        customerAddressCreate(address: $address) {
          customerAddress {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            zip
            country
            province
            phoneNumber
            territoryCode
            zoneCode
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    try {
      // Filtrar campos undefined y defaultAddress
      const cleanAddressInput = Object.fromEntries(
        Object.entries(addressInput).filter(([_, value]) => value !== undefined && value !== '')
      );

      const response = await fetch('/api/customer/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          query: mutation,
          variables: { address: cleanAddressInput }
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
        const error = data.data.customerAddressCreate.userErrors[0];
        let errorMessage = error.message;
        
        // Mejorar mensajes de error específicos
        if (error.code === 'INVALID_TERRITORY_CODE') {
          errorMessage = `Código de país inválido. Use códigos ISO de 2 letras como: MX (México), US (Estados Unidos), CA (Canadá). Valor proporcionado: "${addressInput.territoryCode}"`;
        }
        
        throw new Error(`${errorMessage} (Code: ${error.code || 'UNKNOWN'})`);
      }

      return data.data.customerAddressCreate.customerAddress;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateAddress = useCallback(async (
    addressId: string,
    addressInput: {
      firstName?: string;
      lastName?: string;
      company?: string;
      address1?: string;
      address2?: string;
      city?: string;
      zip?: string;
      territoryCode?: string;
      zoneCode?: string;
      phoneNumber?: string;
    }
  ) => {
    const mutation = `
      mutation UpdateAddress($addressId: ID!, $address: CustomerAddressInput) {
        customerAddressUpdate(addressId: $addressId, address: $address) {
          customerAddress {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            zip
            country
            province
            phoneNumber
            territoryCode
            zoneCode
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    try {
      // Filtrar campos undefined
      const cleanAddressInput = Object.fromEntries(
        Object.entries(addressInput).filter(([_, value]) => value !== undefined && value !== '')
      );

      const response = await fetch('/api/customer/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          query: mutation,
          variables: { addressId, address: cleanAddressInput }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update address (Status: ${response.status})`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      if (data.data.customerAddressUpdate.userErrors.length > 0) {
        const error = data.data.customerAddressUpdate.userErrors[0];
        let errorMessage = error.message;
        
        // Mejorar mensajes de error específicos
        if (error.code === 'INVALID_TERRITORY_CODE') {
          errorMessage = `Código de país inválido. Use códigos ISO de 2 letras como: MX (México), US (Estados Unidos), CA (Canadá). Valor proporcionado: "${addressInput.territoryCode}"`;
        }
        
        throw new Error(`${errorMessage} (Code: ${error.code || 'UNKNOWN'})`);
      }

      return data.data.customerAddressUpdate.customerAddress;
    } catch (error) {
      throw error;
    }
  }, []);

  const getBasicInfo = useCallback(async () => {
    const query = `
      query GetBasicInfo {
        customer {
          id
          displayName
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

  const updateShopifyProfile = useCallback(async (profileData: {
    firstName?: string;
    lastName?: string;
  }) => {
    const mutation = `
      mutation UpdateCustomer($input: CustomerUpdateInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            firstName
            lastName
            displayName
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
            code
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
          variables: { input: profileData }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update Shopify profile (Status: ${response.status})`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      if (data.data.customerUpdate.userErrors.length > 0) {
        const error = data.data.customerUpdate.userErrors[0];
        throw new Error(`${error.message} (Code: ${error.code || 'UNKNOWN'})`);
      }

      return data.data.customerUpdate.customer;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    isLoading,
    getOrders,
    getOrder,
    getAddresses,
    getProfile,
    updateProfile,
    updateShopifyProfile,
    createAddress,
    updateAddress,
    getBasicInfo,
    fetchCustomerData,
  };
}