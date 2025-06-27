import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/modules/auth/context/useAuth'

import { api } from '../../customer/api'
import { type CustomerAddress } from '../../customer/types'

export const shopifyKeys = {
  addresses: (first?: number) => [...shopifyKeys.all, 'addresses', first] as const,
  all: ['shopify', 'customer'] as const,
  basicInfo: () => [...shopifyKeys.all, 'basicInfo'] as const,
  order: (id: string) => [...shopifyKeys.all, 'order', id] as const,
  orders: (params?: { first?: number; after?: string }) =>
    [...shopifyKeys.all, 'orders', params] as const,
  profile: () => [...shopifyKeys.all, 'profile'] as const,
}

export function useShopifyProfile() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated,
    queryFn: api.getProfile,
    queryKey: shopifyKeys.profile(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useShopifyBasicInfo() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated,
    queryFn: api.getBasicInfo,
    queryKey: shopifyKeys.basicInfo(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateShopifyProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.updateProfile,
    onError: (error) => {
      if (error.message.includes('userErrors')) {
        console.error('Shopify validation errors:', error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.profile() })
      queryClient.invalidateQueries({ queryKey: shopifyKeys.basicInfo() })
    },
  })
}

export function useShopifyAddresses(first = 10) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated,
    queryFn: () => api.getAddresses(first),
    queryKey: shopifyKeys.addresses(first),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateShopifyAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.createAddress,
    onError: (error) => {
      console.error('Error creating address:', error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.addresses() })
    },
  })
}

export function useUpdateShopifyAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ address, addressId }: { addressId: string; address: CustomerAddress }) =>
      api.updateAddress(addressId, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.addresses() })
    },
  })
}

export function useDeleteShopifyAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.addresses() })
    },
  })
}

export function useShopifyOrders(params?: { first?: number; after?: string }) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated,
    queryFn: () => api.getOrders(params),
    queryKey: shopifyKeys.orders(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useShopifyOrder(orderId: string) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    enabled: isAuthenticated && !!orderId,
    queryFn: () => api.getOrder(orderId),
    queryKey: shopifyKeys.order(orderId),
    staleTime: 2 * 60 * 1000,
  })
}
