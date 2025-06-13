/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeCustomerRequest } from '@/lib/shopify';
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
import { CustomerAddressInput } from './types';


export const api = {
  getProfile: () => makeCustomerRequest(GET_CUSTOMER_PROFILE_QUERY),
  getBasicInfo: () => makeCustomerRequest(GET_BASIC_INFO_QUERY),
  updateProfile: (input: { firstName?: string; lastName?: string }) => 
    makeCustomerRequest(UPDATE_CUSTOMER_MUTATION, { input }),

  getAddresses: (first: number = 10) => 
    makeCustomerRequest(GET_CUSTOMER_ADDRESSES_QUERY, { first }),
  createAddress: (address: CustomerAddressInput) => {
    const cleanAddressInput = Object.fromEntries(
      Object.entries(address).filter(([_, value]) => value !== undefined && value !== '')
    );
    return makeCustomerRequest(CREATE_CUSTOMER_ADDRESS_MUTATION, { address: cleanAddressInput });
  },
  updateAddress: (addressId: string, address: CustomerAddressInput) => {
    const cleanAddressInput = Object.fromEntries(
      Object.entries(address).filter(([_, value]) => value !== undefined && value !== '')
    );
    return makeCustomerRequest(UPDATE_CUSTOMER_ADDRESS_MUTATION, { addressId, address: cleanAddressInput });
  },
  deleteAddress: (addressId: string) =>
    makeCustomerRequest(DELETE_CUSTOMER_ADDRESS_MUTATION, { addressId }),
  setDefaultAddress: (addressId: string) =>
    makeCustomerRequest(SET_DEFAULT_ADDRESS_MUTATION, { addressId }),

  getOrders: (params: { first?: number; after?: string } = {}) => {
    const { first = 10, after } = params;
    return makeCustomerRequest(GET_CUSTOMER_ORDERS_QUERY, { first, after });
  },
  getOrder: (orderId: string) =>
    makeCustomerRequest(GET_SINGLE_ORDER_QUERY, { id: orderId }),

};