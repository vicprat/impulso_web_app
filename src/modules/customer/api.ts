import { makeCustomerRequest } from '@/lib/shopify'

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
} from './queries'
import { type CustomerAddressInput } from './types'

export const api = {
  createAddress: (address: CustomerAddressInput) => {
    const cleanAddressInput = Object.fromEntries(
      Object.entries(address).filter(([_, value]) => value !== undefined && value !== '')
    )
    return makeCustomerRequest(CREATE_CUSTOMER_ADDRESS_MUTATION, { address: cleanAddressInput })
  },
  deleteAddress: (addressId: string) =>
    makeCustomerRequest(DELETE_CUSTOMER_ADDRESS_MUTATION, { addressId }),
  getAddresses: (first = 10) => makeCustomerRequest(GET_CUSTOMER_ADDRESSES_QUERY, { first }),

  getBasicInfo: () => makeCustomerRequest(GET_BASIC_INFO_QUERY),
  getOrder: (orderId: string) => makeCustomerRequest(GET_SINGLE_ORDER_QUERY, { id: orderId }),
  getOrders: (params: { first?: number; after?: string } = {}) => {
    const { after, first = 10 } = params
    return makeCustomerRequest(GET_CUSTOMER_ORDERS_QUERY, { after, first })
  },
  getProfile: () => makeCustomerRequest(GET_CUSTOMER_PROFILE_QUERY),
  setDefaultAddress: (addressId: string) =>
    makeCustomerRequest(SET_DEFAULT_ADDRESS_MUTATION, { addressId }),

  updateAddress: (addressId: string, address: CustomerAddressInput) => {
    const cleanAddressInput = Object.fromEntries(
      Object.entries(address).filter(([_, value]) => value !== undefined && value !== '')
    )
    return makeCustomerRequest(UPDATE_CUSTOMER_ADDRESS_MUTATION, {
      address: cleanAddressInput,
      addressId,
    })
  },
  updateProfile: (input: { firstName?: string; lastName?: string }) =>
    makeCustomerRequest(UPDATE_CUSTOMER_MUTATION, { input }),
}
