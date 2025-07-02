import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import { handleGraphQLErrors } from '@/lib/graphql'
import { useAuth } from '@/modules/auth/context/useAuth'

import { api } from './api'
import {
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
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() })
      queryClient.invalidateQueries({ queryKey: customerKeys.basicInfo() })
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
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() })
    },
  })
}

export function useUpdateCustomerAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ address, addressId }: { addressId: string; address: CustomerAddressInput }) =>
      api.updateAddress(addressId, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() })
    },
  })
}

export function useDeleteCustomerAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressId: string) => api.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() })
    },
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressId: string) => api.setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() })
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() })
    },
  })
}

export function useCustomerOrders(
  params?: { first?: number; after?: string },
  options?: Omit<UseQueryOptions<{ data: CustomerOrdersResult }, Error>, 'queryKey' | 'queryFn'>
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
  options?: Omit<UseQueryOptions<{ data: CustomerOrder }, Error>, 'queryKey' | 'queryFn'>
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

export function useCustomerAccount() {
  const { isAuthenticated } = useAuth()

  // Queries
  const profileQuery = useCustomerProfile()
  const addressesQuery = useCustomerAddresses()
  const ordersQuery = useCustomerOrders({ first: 10 })

  // Mutations
  const updateProfileMutation = useUpdateCustomerProfile()
  const createAddressMutation = useCreateCustomerAddress()
  const updateAddressMutation = useUpdateCustomerAddress()
  const deleteAddressMutation = useDeleteCustomerAddress()
  const setDefaultAddressMutation = useSetDefaultAddress()

  // Estados combinados
  const isLoading = profileQuery.isLoading || addressesQuery.isLoading || ordersQuery.isLoading
  const error = profileQuery.error || addressesQuery.error || ordersQuery.error

  // Funciones wrapper para mantener la API existente
  const getProfile = () => profileQuery.refetch().then((res) => res.data?.data)
  const getAddresses = () => addressesQuery.refetch().then((res) => res.data?.data)
  const getOrders = () => ordersQuery.refetch().then((res) => res.data?.data)
  const getOrder = async (orderId: string) => {
    const result = await api.getOrder(orderId)
    return result.data
  }

  const updateProfile = async (input: CustomerUpdateInput) => {
    const result = await updateProfileMutation.mutateAsync(input)
    return result.data
  }

  const updateShopifyProfile = updateProfile

  const createAddress = async (address: CustomerAddressInput) => {
    const result = await createAddressMutation.mutateAsync(address)
    return result.data
  }

  const updateAddress = async (addressId: string, address: CustomerAddressInput) => {
    const result = await updateAddressMutation.mutateAsync({ address, addressId })
    return result.data
  }

  const deleteAddress = async (addressId: string) => {
    const result = await deleteAddressMutation.mutateAsync(addressId)
    return result.data
  }

  const setDefaultAddress = async (addressId: string) => {
    const result = await setDefaultAddressMutation.mutateAsync(addressId)
    return result.data
  }

  const getBasicInfo = async () => {
    const result = await api.getBasicInfo()
    return result.data.customer
  }

  const fetchCustomerData = async (query: string, variables?: Record<string, unknown>) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated')
    }

    const response = await fetch('/api/customer/graphql', {
      body: JSON.stringify({ query, variables: variables || {} }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch customer data: ${errorText}`)
    }

    const data = await response.json()

    if (data.errors) {
      handleGraphQLErrors(data.errors)
    }

    return data.data
  }

  return {
    addresses:
      addressesQuery.data?.data?.customer?.addresses?.edges?.map((edge) => edge.node) || [],

    createAddress,

    deleteAddress,

    error,

    fetchCustomerData,

    getAddresses,

    getBasicInfo,

    getOrder,

    getOrders,

    // Funciones
    getProfile,

    isCreatingAddress: createAddressMutation.isPending,

    isDeletingAddress: deleteAddressMutation.isPending,

    // Estados
    isLoading,

    isSettingDefault: setDefaultAddressMutation.isPending,

    isUpdatingAddress: updateAddressMutation.isPending,

    // Estados de mutaciones
    isUpdatingProfile: updateProfileMutation.isPending,

    orders: ordersQuery.data?.data?.customer?.orders?.edges?.map((edge) => edge.node) || [],

    // Datos
    profile: profileQuery.data?.data?.customer,

    setDefaultAddress,

    updateAddress,

    updateProfile,

    updateShopifyProfile,
  }
}
