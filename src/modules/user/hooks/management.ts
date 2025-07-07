import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/modules/auth/context/useAuth'
import {
  useCustomerAddresses,
  useCustomerOrders,
  useCustomerProfile,
  useUpdateCustomerProfile,
} from '@/modules/customer/hooks'

import { postgresUserApi } from '../api'

import type { UserFilters, UserProfile } from '../types'

export function useCurrentUser() {
  const { isLoading: authLoading, user: authUser } = useAuth()

  const { data: profileData, isLoading: profileLoading } = useCustomerProfile()
  const { data: addressesData, isLoading: addressesLoading } = useCustomerAddresses(10)
  const { data: ordersData, isLoading: ordersLoading } = useCustomerOrders({ first: 5 })

  const currentUser: UserProfile | null = authUser
    ? {
        createdAt: new Date(),
        email: authUser.email,
        firstName: authUser.firstName,
        id: authUser.id,
        isActive: true,
        lastName: authUser.lastName,
        permissions: authUser.permissions,
        roles: authUser.roles,
        shopifyCustomerId: authUser.shopifyCustomerId,
        shopifyData: profileData?.data?.customer
          ? {
              addresses:
                addressesData?.data.customer.addresses.edges.map((edge) => ({
                  ...edge.node,
                  province: edge.node.province ?? '',
                })) ?? [],
              defaultAddress: profileData.data.customer.defaultAddress
                ? {
                    ...profileData.data.customer.defaultAddress,
                    province: profileData.data.customer.defaultAddress.province ?? '',
                  }
                : undefined,
              displayName: profileData.data.customer.displayName ?? '',
              imageUrl: profileData.data.customer.imageUrl ?? '',
              orderCount: ordersData?.customer?.orders?.edges.length ?? 0,
              phoneNumber: profileData.data.customer.phoneNumber?.phoneNumber,
              tags: profileData.data.customer.tags,
            }
          : undefined,
        updatedAt: new Date(),
      }
    : null

  const isLoading = authLoading || profileLoading || addressesLoading || ordersLoading

  return {
    currentUser,
    isLoading,
  }
}

export function useSyncWithShopify() {
  const updateCustomerProfile = useUpdateCustomerProfile()
  const { currentUser } = useCurrentUser()

  return useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('No hay usuario actual')

      const localUserData = {
        firstName: currentUser.firstName ?? '',
        lastName: currentUser.lastName ?? '',
      }

      const result = await updateCustomerProfile.mutateAsync(localUserData)

      return result
    },
  })
}
export function useUpdateUserRoles() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()

  return useMutation({
    // ✅ CORREGIDO: Un solo rol, no array
    mutationFn: async ({ role, userId }: { userId: string; role: string }) => {
      if (!hasPermission('manage_roles')) {
        throw new Error('No tienes permisos para gestionar roles')
      }

      return postgresUserApi.updateUserRole(userId, role) // ✅ Un solo rol
    },
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['user', userId] })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
export function useDeactivateUser() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!hasPermission('manage_users')) {
        throw new Error('No tienes permisos para desactivar usuarios')
      }

      return postgresUserApi.deactivateUser(userId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUsersManagement(filters?: UserFilters) {
  const { hasPermission } = useAuth()

  return useQuery({
    enabled: hasPermission('manage_users'),
    queryFn: () => postgresUserApi.getAllUsers(filters),
    queryKey: ['users', filters],
    staleTime: 1 * 60 * 1000,
  })
}

export function useReactivateUser() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!hasPermission('manage_users')) {
        throw new Error('No tienes permisos para reactivar usuarios')
      }

      return postgresUserApi.reactivateUser(userId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// ✅ NUEVO: Hook para alternar el estado público de un usuario
export function useToggleUserPublicStatus() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()

  return useMutation({
    mutationFn: async ({ isPublic, userId }: { userId: string; isPublic: boolean }) => {
      if (!hasPermission('manage_users')) {
        throw new Error('No tienes permisos para gestionar la visibilidad pública de usuarios')
      }

      return postgresUserApi.toggleUserPublicStatus(userId, isPublic)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUserById(userId: string) {
  const { hasPermission, user } = useAuth()
  const canView = hasPermission('manage_users') || user?.id === userId

  return useQuery({
    enabled: !!userId && canView,
    queryFn: () => postgresUserApi.getUserById(userId),
    queryKey: ['user', userId],
  })
}

export function useCanManageUser(targetUserId: string) {
  const { hasPermission, user: currentUser } = useAuth()

  if (!currentUser) return false

  if (targetUserId === currentUser.id) return true

  if (hasPermission('manage_users')) return true

  return false
}

// ✅ NUEVO: Hook para obtener artistas públicos
export function usePublicArtists() {
  return useQuery({
    queryFn: () => postgresUserApi.getPublicArtists(),
    queryKey: ['publicArtists'],
  })
}
