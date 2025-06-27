import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/modules/auth/context/useAuth'
import {
  useCustomerProfile,
  useCustomerAddresses,
  useCustomerOrders,
  useUpdateCustomerProfile,
} from '@/modules/customer/hooks'

import { postgresUserApi } from '../api'
import { type UserProfile, type UserFilters } from '../types'
import { postgresKeys } from './db'

export function useCurrentUser() {
  const { isLoading: authLoading, user: authUser } = useAuth()

  // Datos de Shopify
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
                addressesData?.data?.customer?.addresses?.edges?.map((edge) => edge.node) || [],
              defaultAddress: profileData.data.customer.defaultAddress,
              displayName: profileData.data.customer.displayName ?? '',
              imageUrl: profileData.data.customer.imageUrl ?? '',
              orderCount: ordersData?.data?.customer?.orders?.edges?.length || 0,
              phoneNumber: profileData.data.customer.phoneNumber?.phoneNumber,
              tags: profileData.data.customer.tags || [],
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

// Hook para actualizar perfil local
export function useUpdateLocalProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await fetch('/api/users/profile', {
        body: JSON.stringify(data),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Error al actualizar perfil')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: postgresKeys.profile() })
    },
  })
}

// Hook para sincronizar con Shopify
export function useSyncWithShopify() {
  const updateCustomerProfile = useUpdateCustomerProfile()
  const { currentUser } = useCurrentUser()

  return useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('No hay usuario actual')

      const localUserData = {
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
      }

      console.log('🔄 Sincronizando datos locales hacia Shopify:', localUserData)

      const result = await updateCustomerProfile.mutateAsync(localUserData)

      console.log('✅ Datos enviados a Shopify exitosamente')

      return result
    },
  })
}

// Hook para actualizar preferencias
export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: UserProfile['preferences']) => {
      const response = await fetch('/api/users/preferences', {
        body: JSON.stringify({ preferences }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Error al actualizar preferencias')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postgresKeys.profile() })
    },
  })
}

// Hook para gestión de usuarios (admin)
export function useUsersManagement(filters?: UserFilters) {
  const { hasPermission } = useAuth()

  return useQuery({
    enabled: hasPermission('manage_users'),
    queryFn: () => postgresUserApi.getAllUsers(filters),
    queryKey: ['users', filters],
    staleTime: 1 * 60 * 1000,
  })
}

// Hook para obtener usuario por ID
export function useUserById(userId: string) {
  const { hasPermission, user } = useAuth()
  const canView = hasPermission('manage_users') || user?.id === userId

  return useQuery({
    enabled: !!userId && canView,
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Usuario no encontrado')
      }

      return response.json()
    },
    queryKey: ['user', userId],
  })
}

// Hook para actualizar roles
export function useUpdateUserRoles() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()

  return useMutation({
    mutationFn: async ({ roles, userId }: { userId: string; roles: string[] }) => {
      if (!hasPermission('manage_roles')) {
        throw new Error('No tienes permisos para gestionar roles')
      }

      return postgresUserApi.updateUserRole(userId, roles)
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Hook para desactivar usuario
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
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Hook para reactivar usuario
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
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Hook helper para verificar permisos de gestión
export function useCanManageUser(targetUserId: string) {
  const { hasPermission, hasRole, user: currentUser } = useAuth()
  const { data: users } = useUsersManagement()

  if (!currentUser) return false

  // Los usuarios pueden gestionar su propio perfil
  if (targetUserId === currentUser.id) return true

  // Solo usuarios con permisos de gestión pueden gestionar otros
  if (!hasPermission('manage_users')) return false

  // Los admins pueden gestionar cualquiera
  if (hasRole('admin')) return true

  // Los managers pueden gestionar usuarios regulares, pero no otros managers o admins
  if (hasRole('manager') && users?.users) {
    const targetUser: UserProfile | undefined = users?.users
      ? (users.users as UserProfile[]).find((u: UserProfile) => u.id === targetUserId)
      : undefined
    return (
      !!targetUser && !targetUser.roles.includes('manager') && !targetUser.roles.includes('admin')
    )
  }

  return false
}

// Hook combinado para toda la funcionalidad de gestión de usuarios
export function useUserManagement() {
  const { hasPermission, hasRole, user: currentUser } = useAuth()
  const { currentUser: fullUser, isLoading } = useCurrentUser()

  const updateLocalProfile = useUpdateLocalProfile()
  const syncWithShopify = useSyncWithShopify()
  const updatePreferences = useUpdatePreferences()
  const updateUserRoles = useUpdateUserRoles()
  const deactivateUser = useDeactivateUser()
  const reactivateUser = useReactivateUser()

  // Función helper para verificar si puede gestionar un usuario
  const canManageUser = (targetUserId: string, targetUserRoles?: string[]) => {
    if (!currentUser) return false
    if (targetUserId === currentUser.id) return true
    if (!hasPermission('manage_users')) return false
    if (hasRole('admin')) return true
    if (hasRole('manager') && targetUserRoles) {
      return !targetUserRoles.includes('manager') && !targetUserRoles.includes('admin')
    }
    return false
  }

  return {
    canManageUser,
    // Usuario actual
    currentUser: fullUser,

    deactivateUser: deactivateUser.mutate,

    // Control de acceso
    hasPermission,

    hasRole,

    isLoading,

    isSyncing: syncWithShopify.isPending,

    isUpdatingPreferences: updatePreferences.isPending,

    // Estados de mutación
    isUpdatingProfile: updateLocalProfile.isPending,

    reactivateUser: reactivateUser.mutate,

    syncWithShopify: syncWithShopify.mutate,

    updatePreferences: updatePreferences.mutate,

    // Acciones del usuario
    updateProfile: updateLocalProfile.mutate,
    // Acciones administrativas
    updateUserRole: updateUserRoles.mutate,

    useUserById,
    // Ahora es una función, no un hook
    // Hooks adicionales para uso independiente
    useUsersManagement,
  }
}
