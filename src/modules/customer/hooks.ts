import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import { useAuth } from '@/modules/auth/context/useAuth'
import { type LocalOrderDetail, type LocalOrdersResult } from '@/services/order/localOrdersService'

import { api } from './api'
import {
  type AllOrdersResult,
  type CustomerAddressesResult,
  type CustomerAddressInput,
  type CustomerBasicInfo,
  type CustomerOrder,
  type CustomerOrdersResult,
  type CustomerUpdateInput,
  type ShopifyCustomerProfile,
} from './types'

export const customerKeys = {
  addresses: (first?: number) => [...customerKeys.all, 'addresses', first] as const,
  all: ['customer'] as const,
  basicInfo: () => [...customerKeys.all, 'basicInfo'] as const,
  order: (id: string) => [...customerKeys.all, 'order', id] as const,
  orders: (params?: { first?: number; after?: string }) =>
    [...customerKeys.all, 'orders', params] as const,
  profile: () => [...customerKeys.all, 'profile'] as const,
}

export const orderManagementKeys = {
  all: ['orderManagement'] as const,
  allOrders: (params?: { first?: number; after?: string; query?: string }) =>
    [...orderManagementKeys.all, 'allOrders', params] as const,
  allOrdersLocal: (params?: { first?: number; after?: string; query?: string }) =>
    [...orderManagementKeys.all, 'allOrdersLocal', params] as const,
}

export function useCustomerProfile(
  options?: Omit<
    UseQueryOptions<{ data: { customer: ShopifyCustomerProfile } }, Error>,
    'queryKey' | 'queryFn'
  >
) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated,
    queryFn: api.getProfile,
    queryKey: customerKeys.profile(),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useCustomerBasicInfo(
  options?: Omit<
    UseQueryOptions<{ data: { customer: CustomerBasicInfo } }, Error>,
    'queryKey' | 'queryFn'
  >
) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated,
    queryFn: api.getBasicInfo,
    queryKey: customerKeys.basicInfo(),
    staleTime: 10 * 60 * 1000,
    ...options,
  })
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CustomerUpdateInput) => api.updateProfile(input),
    onError: (error) => {
      console.error('Error updating profile:', error)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.profile() })
      void queryClient.invalidateQueries({ queryKey: customerKeys.basicInfo() })
    },
  })
}

export function useCustomerAddresses(
  first = 10,
  options?: Omit<UseQueryOptions<{ data: CustomerAddressesResult }, Error>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated,
    queryFn: () => api.getAddresses(first),
    queryKey: customerKeys.addresses(first),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useCreateCustomerAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (address: CustomerAddressInput) => api.createAddress(address),
    onError: (error) => {
      console.error('Error creating address:', error)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.addresses() })
    },
  })
}

export function useUpdateCustomerAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ address, addressId }: { addressId: string; address: CustomerAddressInput }) =>
      api.updateAddress(addressId, address),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.addresses() })
    },
  })
}

export function useDeleteCustomerAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressId: string) => api.deleteAddress(addressId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.addresses() })
    },
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressId: string) => api.setDefaultAddress(addressId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.profile() })
      void queryClient.invalidateQueries({ queryKey: customerKeys.addresses() })
    },
  })
}

// Fixed: Remove the extra { data: } wrapper to match the actual usage in the component
export function useCustomerOrders(
  params?: { first?: number; after?: string },
  options?: Omit<UseQueryOptions<CustomerOrdersResult, Error>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated,
    queryFn: () => api.getOrders(params),
    queryKey: customerKeys.orders(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export function useCustomerOrder(
  orderId: string,
  options?: Omit<UseQueryOptions<{ order: CustomerOrder }, Error>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated && !!orderId,
    queryFn: () => api.getOrder(orderId),
    queryKey: customerKeys.order(orderId),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export function useCustomerOrderLocal(
  orderId: string,
  options?: Omit<UseQueryOptions<{ order: LocalOrderDetail }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryFn: () => api.getOrderLocal(orderId),
    queryKey: [...customerKeys.all, 'orderLocal', orderId] as const,
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export function useCustomerOrderSmart(
  orderId: string,
  options?: Omit<
    UseQueryOptions<{ order: CustomerOrder | LocalOrderDetail }, Error>,
    'queryKey' | 'queryFn'
  >
) {
  // Determinar si es un ID de Shopify o local
  const isShopifyId = orderId.startsWith('gid://shopify/Order/')

  return useQuery({
    queryFn: async () => {
      if (isShopifyId) {
        return await api.getOrder(orderId)
      } else {
        return await api.getOrderLocal(orderId)
      }
    },
    queryKey: [...customerKeys.all, 'orderSmart', orderId, isShopifyId] as const,
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

// Fixed: Remove the extra wrapper to match the actual usage in the component
export function useAllOrders(
  params?: { first?: number; after?: string; query?: string },
  options?: Omit<UseQueryOptions<AllOrdersResult, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryFn: () => api.getAllOrders(params),
    queryKey: orderManagementKeys.allOrders(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export function useAllOrdersLocal(
  params?: { first?: number; after?: string; query?: string },
  options?: Omit<UseQueryOptions<LocalOrdersResult, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryFn: () => api.getAllOrdersLocal(params),
    queryKey: orderManagementKeys.allOrdersLocal(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}

export function useOrdersByProduct(
  productId: string,
  params?: { first?: number; after?: string },
  options?: Omit<UseQueryOptions<AllOrdersResult, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryFn: () => api.getOrdersByProduct(productId, params),
    queryKey: [...orderManagementKeys.all, 'ordersByProduct', productId, params],
    staleTime: 2 * 60 * 1000,
    ...options,
  })
}
