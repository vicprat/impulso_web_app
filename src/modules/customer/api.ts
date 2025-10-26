import { makeCustomerRequest } from '@/lib/shopify'
import { type LocalOrderDetail, type LocalOrdersResult } from '@/services/order/localOrdersService'

import {
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  DELETE_CUSTOMER_ADDRESS_MUTATION,
  GET_BASIC_INFO_QUERY,
  GET_CUSTOMER_ADDRESSES_QUERY,
  GET_CUSTOMER_ORDERS_QUERY,
  GET_CUSTOMER_PROFILE_QUERY,
  GET_SINGLE_ORDER_QUERY,
  SET_DEFAULT_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_MUTATION,
} from './queries'
import { type AllOrdersResult, type CustomerAddressInput } from './types'

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

  getAllOrders: async (params?: {
    first?: number
    after?: string
    query?: string
  }): Promise<AllOrdersResult> => {
    const { after, first = 10, query } = params ?? {}

    const searchParams = new URLSearchParams()
    searchParams.append('first', first.toString())
    if (after) {
      searchParams.append('after', after)
    }
    if (query) {
      searchParams.append('query', query)
    }

    const response = await fetch(`/api/orders/all?${searchParams.toString()}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  },

  getAllOrdersHybrid: async (params?: {
    after?: string
    first?: number
    query?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const { after, first = 10, query, sortBy, sortOrder } = params ?? {}

    const searchParams = new URLSearchParams()
    searchParams.append('first', first.toString())
    if (after) {
      searchParams.append('after', after)
    }
    if (query) {
      searchParams.append('query', query)
    }
    if (sortBy) {
      searchParams.append('sortBy', sortBy)
    }
    if (sortOrder) {
      searchParams.append('sortOrder', sortOrder)
    }

    const response = await fetch(`/api/orders/hybrid?${searchParams.toString()}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  },

  getAllOrdersLocal: async (params?: {
    first?: number
    after?: string
    query?: string
  }): Promise<LocalOrdersResult> => {
    const { after, first = 10, query } = params ?? {}

    const searchParams = new URLSearchParams()
    searchParams.append('first', first.toString())
    if (after) {
      searchParams.append('after', after)
    }
    if (query) {
      searchParams.append('query', query)
    }

    const response = await fetch(`/api/orders/local?${searchParams.toString()}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  },

  getBasicInfo: () => makeCustomerRequest(GET_BASIC_INFO_QUERY),

  getOrder: (orderId: string) => makeCustomerRequest(GET_SINGLE_ORDER_QUERY, { id: orderId }),

  getOrderHybrid: async (orderId: string): Promise<{ order: LocalOrderDetail }> => {
    const response = await fetch(`/api/orders/hybrid/${orderId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  },

  getOrderLocal: async (orderId: string): Promise<{ order: LocalOrderDetail }> => {
    const response = await fetch(`/api/orders/local/${orderId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  },
  getOrders: (params: { first?: number; after?: string } = {}) => {
    const { after, first = 10 } = params
    return makeCustomerRequest(GET_CUSTOMER_ORDERS_QUERY, { after, first })
  },
  getOrdersByProduct: async (
    productId: string,
    params?: {
      first?: number
      after?: string
    }
  ): Promise<AllOrdersResult> => {
    const { after, first = 10 } = params ?? {}

    const searchParams = new URLSearchParams()
    searchParams.append('first', first.toString())
    searchParams.append('productId', productId)
    if (after) {
      searchParams.append('after', after)
    }

    const response = await fetch(`/api/orders/by-product?${searchParams.toString()}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
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
